import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/patients
// - ADMIN vê todos os pacientes
// - PROFISSIONAL vê só os seus
// - FAMILIAR vê só os pacientes vinculados a ele (via FamilyMember)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { role, professionalId, patientIds } = session.user;

  const where =
    role === "ADMIN"
      ? {}
      : role === "PROFISSIONAL"
      ? { professionalId: professionalId ?? "__none__" }
      : { id: { in: patientIds } };

  const patients = await prisma.patient.findMany({
    where,
    select: {
      id: true,
      name: true,
      birthDate: true,
      diagnosis: true,
      status: true,
      startDate: true,
      photoUrl: true,
      phases: {
        select: { id: true, name: true, plannedSessions: true, color: true, order: true },
        orderBy: { order: "asc" },
      },
      _count: { select: { evolutions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ patients });
}

const createPatientSchema = z.object({
  name: z.string().min(2),
  birthDate: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  diagnosis: z.string().optional(),
  referredBy: z.string().optional(),
  clinicalHistory: z.string().optional(),
  phases: z
    .array(
      z.object({
        name: z.string().min(1),
        objective: z.string().optional(),
        plannedSessions: z.number().int().min(1),
        color: z.string().optional(),
      })
    )
    .optional(),
});

// POST /api/patients — só ADMIN e PROFISSIONAL podem cadastrar
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "PROFISSIONAL")) {
    return NextResponse.json({ error: "Sem permissão para cadastrar pacientes." }, { status: 403 });
  }

  let professionalId = session.user.professionalId;

  if (session.user.role === "ADMIN" && !professionalId) {
    // Hoje só existe a Alexia — vincula automaticamente a ela.
    // Quando houver múltiplos profissionais, isso vira um campo de seleção no formulário.
    const unico = await prisma.professional.findFirst({ select: { id: true } });
    professionalId = unico?.id ?? null;
  }

  if (!professionalId) {
    return NextResponse.json({ error: "Nenhum profissional encontrado para vincular o paciente." }, { status: 400 });
  }

  const body = await req.json();
  const parsed = createPatientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { phases, ...dados } = parsed.data;

  const patient = await prisma.patient.create({
    data: {
      ...dados,
      birthDate: dados.birthDate ? new Date(dados.birthDate) : undefined,
      professionalId: professionalId as string,
      phases: phases
        ? {
            create: phases.map((f, i) => ({
              name: f.name,
              objective: f.objective,
              plannedSessions: f.plannedSessions,
              color: f.color ?? "#3F6B58",
              order: i + 1,
            })),
          }
        : undefined,
    },
    include: { phases: true },
  });

  return NextResponse.json({ patient }, { status: 201 });
}
