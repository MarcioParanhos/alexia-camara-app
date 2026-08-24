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

  const reports = await prisma.report.findMany({
    where: { patientId: params.id },
    orderBy: { createdAt: "desc" },
    include: { generatedBy: { select: { name: true } } },
  });

  return NextResponse.json({ reports });
}

const createReportSchema = z.object({
  periodStart: z.string(),
  periodEnd: z.string(),
  parecer: z.string().min(1),
});

// Só ADMIN e PROFISSIONAL geram relatório
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !podeEditarPaciente(session)) {
    return NextResponse.json({ error: "Sem permissão para gerar relatório." }, { status: 403 });
  }

  const acesso = await podeAcessarPaciente(session, params.id);
  if (!acesso) return NextResponse.json({ error: "Paciente não encontrado ou sem permissão." }, { status: 404 });

  const body = await req.json();
  const parsed = createReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const periodStart = new Date(parsed.data.periodStart);
  const periodEnd = new Date(parsed.data.periodEnd);
  periodEnd.setHours(23, 59, 59, 999);

  const paciente = await prisma.patient.findUnique({
    where: { id: params.id },
    include: {
      phases: { orderBy: { order: "asc" }, include: { _count: { select: { evolutions: true } } } },
      evolutions: {
        where: { sessionDate: { gte: periodStart, lte: periodEnd } },
        orderBy: { sessionDate: "asc" },
      },
      professional: {
        select: {
          crefito: true,
          specialty: true,
          bio: true,
          clinicName: true,
          brandColor: true,
          logoUrl: true,
          user: { select: { name: true } },
        },
      },
    },
  });

  if (!paciente) return NextResponse.json({ error: "Paciente não encontrado." }, { status: 404 });

  const evolucoesPeriodo = paciente.evolutions;
  const romHistory = evolucoesPeriodo
    .filter((e) => e.romDegrees !== null)
    .map((e) => ({ date: e.sessionDate, romDegrees: e.romDegrees as number }))
    .slice(-6);
  const painHistory = evolucoesPeriodo
    .filter((e) => e.painLevel !== null)
    .map((e) => ({ date: e.sessionDate, painLevel: e.painLevel as number }))
    .slice(-8);
  const milestones = evolucoesPeriodo
    .filter((e) => e.highlighted)
    .map((e) => ({ date: e.sessionDate, title: e.title, note: e.note }));

  const snapshot = {
    patientName: paciente.name,
    diagnosis: paciente.diagnosis,
    periodStart,
    periodEnd,
    parecer: parsed.data.parecer,
    phases: paciente.phases.map((f) => ({
      name: f.name,
      color: f.color,
      plannedSessions: f.plannedSessions,
      completedSessions: f._count.evolutions,
    })),
    painHistory,
    romHistory,
    milestones,
    evolutions: evolucoesPeriodo.map((e) => ({
      id: e.id,
      sessionDate: e.sessionDate,
      title: e.title,
      note: e.note,
      painLevel: e.painLevel,
      romDegrees: e.romDegrees,
      highlighted: e.highlighted,
    })),
    totalSessoesNoPeriodo: evolucoesPeriodo.length,
    professional: {
      name: paciente.professional.user.name,
      crefito: paciente.professional.crefito,
      specialty: paciente.professional.specialty,
      bio: paciente.professional.bio,
      clinicName: paciente.professional.clinicName,
      brandColor: paciente.professional.brandColor,
      logoUrl: paciente.professional.logoUrl,
    },
  };

  const report = await prisma.report.create({
    data: {
      patientId: params.id,
      generatedById: session.user.id,
      periodStart,
      periodEnd,
      snapshot,
    },
  });

  return NextResponse.json({ report }, { status: 201 });
}
