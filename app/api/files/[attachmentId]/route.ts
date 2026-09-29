import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeAcessarPaciente } from "@/lib/patient-access";
import { r2, R2_BUCKET } from "@/lib/r2";

export async function GET(_req: Request, { params }: { params: { attachmentId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const attachment = await prisma.attachment.findUnique({ where: { id: params.attachmentId } });
  if (!attachment) return NextResponse.json({ error: "Anexo não encontrado." }, { status: 404 });

  const acesso = await podeAcessarPaciente(session, attachment.patientId);
  if (!acesso) return NextResponse.json({ error: "Sem permissão." }, { status: 404 });

  const url = await getSignedUrl(
    r2,
    new GetObjectCommand({
      Bucket: R2_BUCKET,
      Key: attachment.url,
      ResponseContentDisposition: `inline; filename="${attachment.fileName}"`,
    }),
    { expiresIn: 300 }, // link válido por 5 minutos
  );

  return NextResponse.redirect(url);
}