import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  await requireAdmin();

  const usuario = await prisma.user.findUnique({ where: { id: params.id } });
  if (!usuario) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }

  // invalida tokens anteriores não usados, para só o link mais recente funcionar
  await prisma.passwordResetToken.deleteMany({
    where: { userId: usuario.id, usedAt: null },
  });

  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 2); // expira em 2h

  await prisma.passwordResetToken.create({
    data: { userId: usuario.id, token, expiresAt },
  });

  const url = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/redefinir-senha/${token}`;

  return NextResponse.json({ url }, { status: 201 });
}