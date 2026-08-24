import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeAcessarPaciente, podeEditarPaciente } from "@/lib/patient-access";

export async function DELETE(_req: Request, { params }: { params: { id: string; linkId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !podeEditarPaciente(session)) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }
  const acesso = await podeAcessarPaciente(session, params.id);
  if (!acesso) return NextResponse.json({ error: "Paciente não encontrado." }, { status: 404 });

  const link = await prisma.accessLink.findUnique({ where: { id: params.linkId } });
  if (!link || link.patientId !== params.id) {
    return NextResponse.json({ error: "Link não encontrado." }, { status: 404 });
  }

  await prisma.accessLink.update({ where: { id: params.linkId }, data: { revoked: true } });
  return NextResponse.json({ ok: true });
}
