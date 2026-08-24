import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeAcessarPaciente } from "@/lib/patient-access";
import { caminhoAbsoluto } from "@/lib/storage";

export async function GET(_req: Request, { params }: { params: { attachmentId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const attachment = await prisma.attachment.findUnique({ where: { id: params.attachmentId } });
  if (!attachment) return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });

  const acesso = await podeAcessarPaciente(session, attachment.patientId);
  if (!acesso) return NextResponse.json({ error: "Sem permissão." }, { status: 403 });

  try {
    const bytes = await readFile(caminhoAbsoluto(attachment.url));
    return new NextResponse(bytes as unknown as BodyInit, {
      headers: {
        "Content-Type": attachment.fileType || "application/octet-stream",
        "Content-Disposition": `inline; filename="${encodeURIComponent(attachment.fileName)}"`,
        "Cache-Control": "private, max-age=0, must-revalidate",
      },
    });
  } catch {
    return NextResponse.json({ error: "Arquivo não encontrado em disco." }, { status: 404 });
  }
}
