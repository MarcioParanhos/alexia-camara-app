import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeAcessarPaciente, podeEditarPaciente } from "@/lib/patient-access";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !podeEditarPaciente(session)) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }
  const acesso = await podeAcessarPaciente(session, params.id);
  if (!acesso) return NextResponse.json({ error: "Paciente não encontrado." }, { status: 404 });

  const accessLinks = await prisma.accessLink.findMany({
    where: { patientId: params.id, revoked: false },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ accessLinks });
}

// Gera um novo link e revoga os anteriores (mantém só um ativo por paciente)
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !podeEditarPaciente(session)) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }
  const acesso = await podeAcessarPaciente(session, params.id);
  if (!acesso) return NextResponse.json({ error: "Paciente não encontrado." }, { status: 404 });

  await prisma.accessLink.updateMany({
    where: { patientId: params.id, revoked: false },
    data: { revoked: true },
  });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const accessLink = await prisma.accessLink.create({
    data: { patientId: params.id, expiresAt },
  });

  const url = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/acesso/${accessLink.token}`;

  return NextResponse.json({ accessLink, url }, { status: 201 });
}
