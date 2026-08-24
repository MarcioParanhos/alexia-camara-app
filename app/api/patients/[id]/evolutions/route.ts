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
  if (!acesso) return NextResponse.json({ error: "Sem permissão." }, { status: 404 });

  const evolutions = await prisma.evolution.findMany({
    where: { patientId: params.id },
    orderBy: { sessionDate: "desc" },
    include: { author: { select: { name: true } }, phase: { select: { name: true, color: true } } },
  });

  return NextResponse.json({ evolutions });
}

const createEvolutionSchema = z.object({
  phaseId: z.string().optional(),
  title: z.string().min(1),
  note: z.string().min(1),
  painLevel: z.number().int().min(0).max(10).optional(),
  romDegrees: z.number().int().min(0).max(180).optional(),
  highlighted: z.boolean().optional(),
  sessionDate: z.string().optional(),
});

// Só ADMIN e PROFISSIONAL registram evolução — a família só lê
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !podeEditarPaciente(session)) {
    return NextResponse.json({ error: "Sem permissão para registrar evolução." }, { status: 403 });
  }

  const acesso = await podeAcessarPaciente(session, params.id);
  if (!acesso) return NextResponse.json({ error: "Paciente não encontrado ou sem permissão." }, { status: 404 });

  const body = await req.json();
  const parsed = createEvolutionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { sessionDate, ...dados } = parsed.data;

  const evolution = await prisma.evolution.create({
    data: {
      ...dados,
      patientId: params.id,
      authorId: session.user.id,
      sessionDate: sessionDate ? new Date(sessionDate) : new Date(),
    },
  });

  return NextResponse.json({ evolution }, { status: 201 });
}
