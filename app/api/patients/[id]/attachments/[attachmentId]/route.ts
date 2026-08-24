import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeAcessarPaciente, podeEditarPaciente } from "@/lib/patient-access";
import { removerArquivo } from "@/lib/storage";

export async function DELETE(_req: Request, { params }: { params: { id: string; attachmentId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !podeEditarPaciente(session)) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const acesso = await podeAcessarPaciente(session, params.id);
  if (!acesso) return NextResponse.json({ error: "Paciente não encontrado." }, { status: 404 });

  const attachment = await prisma.attachment.findUnique({ where: { id: params.attachmentId } });
  if (!attachment || attachment.patientId !== params.id) {
    return NextResponse.json({ error: "Anexo não encontrado." }, { status: 404 });
  }

  await removerArquivo(attachment.url);
  await prisma.attachment.delete({ where: { id: params.attachmentId } });

  return NextResponse.json({ ok: true });
}
