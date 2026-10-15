import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeAcessarPaciente, podeEditarPaciente } from "@/lib/patient-access";

const updateEvolutionSchema = z.object({
  phaseId: z.string().nullable().optional(),
  title: z.string().min(1),
  note: z.string().min(1),
  painLevel: z.number().int().min(0).max(10).nullable().optional(),
  romDegrees: z.number().int().min(0).max(180).nullable().optional(),
  highlighted: z.boolean().optional(),
  sessionDate: z.string().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string; evolutionId: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session || !podeEditarPaciente(session)) {
    return NextResponse.json({ error: "Sem permissão para editar sessões." }, { status: 403 });
  }

  const acesso = await podeAcessarPaciente(session, params.id);
  if (!acesso) return NextResponse.json({ error: "Paciente não encontrado." }, { status: 404 });

  const evolution = await prisma.evolution.findUnique({ where: { id: params.evolutionId } });
  if (!evolution || evolution.patientId !== params.id) {
    return NextResponse.json({ error: "Sessão não encontrada." }, { status: 404 });
  }

  const body = await req.json();
  const parsed = updateEvolutionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { sessionDate, phaseId, ...dados } = parsed.data;

  // a fase precisa pertencer ao mesmo paciente
  if (phaseId) {
    const fase = await prisma.treatmentPhase.findUnique({ where: { id: phaseId } });
    if (!fase || fase.patientId !== params.id) {
      return NextResponse.json({ error: "Fase inválida para este paciente." }, { status: 400 });
    }
  }

  let novaData: Date | undefined;
  if (sessionDate) {
    novaData = new Date(sessionDate);
    if (isNaN(novaData.getTime())) {
      return NextResponse.json({ error: "Data da sessão inválida." }, { status: 400 });
    }
  }

  const atualizada = await prisma.evolution.update({
    where: { id: params.evolutionId },
    data: {
      ...dados,
      ...(phaseId !== undefined ? { phaseId } : {}),
      ...(novaData ? { sessionDate: novaData } : {}),
    },
  });

  return NextResponse.json({ evolution: atualizada });
}