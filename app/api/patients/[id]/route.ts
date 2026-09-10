import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeAcessarPaciente, podeEditarPaciente } from "@/lib/patient-access";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const acesso = await podeAcessarPaciente(session, params.id);
  if (!acesso) return NextResponse.json({ error: "Paciente não encontrado." }, { status: 404 });

  const patient = await prisma.patient.findUnique({
    where: { id: params.id },
    include: { phases: { orderBy: { order: "asc" } } },
  });

  if (!patient) return NextResponse.json({ error: "Paciente não encontrado." }, { status: 404 });

  return NextResponse.json({ patient });
}

const updatePatientSchema = z.object({
  name: z.string().min(2),
  birthDate: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  diagnosis: z.string().optional(),
  referredBy: z.string().optional(),
  clinicalHistory: z.string().optional(),
  status: z.enum(["EM_TRATAMENTO", "ALTA", "PAUSADO"]).optional(),
  phases: z
    .array(
      z.object({
        id: z.string().optional(), // presente = fase já existente
        name: z.string().min(1),
        objective: z.string().optional(),
        plannedSessions: z.number().int().min(1),
        color: z.string().optional(),
      }),
    )
    .optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !podeEditarPaciente(session)) {
    return NextResponse.json({ error: "Sem permissão para editar pacientes." }, { status: 403 });
  }

  const acesso = await podeAcessarPaciente(session, params.id);
  if (!acesso) return NextResponse.json({ error: "Paciente não encontrado." }, { status: 404 });

  const body = await req.json();
  const parsed = updatePatientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { phases, email, ...dados } = parsed.data;

  const patient = await prisma.$transaction(async (tx) => {
    await tx.patient.update({
      where: { id: params.id },
      data: {
        ...dados,
        email: email || null,
        birthDate: dados.birthDate ? new Date(dados.birthDate) : null,
      },
    });

    if (phases) {
      const idsRecebidos = phases.filter((f) => f.id).map((f) => f.id as string);

      // remove fases que existiam antes mas não vieram mais no payload
      await tx.treatmentPhase.deleteMany({
        where: { patientId: params.id, id: { notIn: idsRecebidos.length > 0 ? idsRecebidos : ["__none__"] } },
      });

      for (let i = 0; i < phases.length; i++) {
        const f = phases[i];
        if (f.id) {
          await tx.treatmentPhase.update({
            where: { id: f.id },
            data: {
              name: f.name,
              objective: f.objective,
              plannedSessions: f.plannedSessions,
              color: f.color ?? "#3F6B58",
              order: i + 1,
            },
          });
        } else {
          await tx.treatmentPhase.create({
            data: {
              patientId: params.id,
              name: f.name,
              objective: f.objective,
              plannedSessions: f.plannedSessions,
              color: f.color ?? "#3F6B58",
              order: i + 1,
            },
          });
        }
      }
    }

    return tx.patient.findUnique({ where: { id: params.id }, include: { phases: true } });
  });

  return NextResponse.json({ patient });
}