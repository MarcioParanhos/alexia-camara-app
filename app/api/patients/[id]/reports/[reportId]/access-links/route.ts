import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeAcessarPaciente, podeEditarPaciente } from "@/lib/patient-access";

async function validarRelatorio(patientId: string, reportId: string) {
  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report || report.patientId !== patientId) return null;
  return report;
}

export async function GET(_req: Request, { params }: { params: { id: string; reportId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !podeEditarPaciente(session)) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }
  const acesso = await podeAcessarPaciente(session, params.id);
  if (!acesso) return NextResponse.json({ error: "Paciente não encontrado." }, { status: 404 });

  const report = await validarRelatorio(params.id, params.reportId);
  if (!report) return NextResponse.json({ error: "Relatório não encontrado." }, { status: 404 });

  const accessLinks = await prisma.accessLink.findMany({
    where: { reportId: params.reportId, revoked: false },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ accessLinks });
}

const createSchema = z.object({
  // duração em dias — o profissional escolhe (3, 7, 14, 30 ou um valor customizado)
  days: z.number().int().min(1).max(365),
});

// Gera um novo link para ESTE relatório e revoga os anteriores do mesmo relatório
// (mantém só um ativo por vez, evitando links "esquecidos" no ar)
export async function POST(req: Request, { params }: { params: { id: string; reportId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !podeEditarPaciente(session)) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }
  const acesso = await podeAcessarPaciente(session, params.id);
  if (!acesso) return NextResponse.json({ error: "Paciente não encontrado." }, { status: 404 });

  const report = await validarRelatorio(params.id, params.reportId);
  if (!report) return NextResponse.json({ error: "Relatório não encontrado." }, { status: 404 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Duração inválida." }, { status: 400 });
  }

  await prisma.accessLink.updateMany({
    where: { reportId: params.reportId, revoked: false },
    data: { revoked: true },
  });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + parsed.data.days);

  const accessLink = await prisma.accessLink.create({
    data: { patientId: params.id, reportId: params.reportId, expiresAt },
  });

  const url = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/acesso/${accessLink.token}`;

  return NextResponse.json({ accessLink, url }, { status: 201 });
}
