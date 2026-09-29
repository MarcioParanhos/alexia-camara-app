import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeAcessarPaciente, podeEditarPaciente } from "@/lib/patient-access";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !podeEditarPaciente(session)) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const acesso = await podeAcessarPaciente(session, params.id);
  if (!acesso) return NextResponse.json({ error: "Paciente não encontrado." }, { status: 404 });

  const patient = await prisma.patient.update({
    where: { id: params.id },
    data: { status: "ARQUIVADO" },
  });

  return NextResponse.json({ patient });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  // reaproveitado como "desarquivar" — POST arquiva, DELETE nesta mesma rota desarquiva
  const session = await getServerSession(authOptions);
  if (!session || !podeEditarPaciente(session)) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const acesso = await podeAcessarPaciente(session, params.id);
  if (!acesso) return NextResponse.json({ error: "Paciente não encontrado." }, { status: 404 });

  const patient = await prisma.patient.update({
    where: { id: params.id },
    data: { status: "EM_TRATAMENTO" },
  });

  return NextResponse.json({ patient });
}