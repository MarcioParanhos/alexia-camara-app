import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { token: string } }) {
  const reset = await prisma.passwordResetToken.findUnique({
    where: { token: params.token },
    include: { user: { select: { name: true, email: true } } },
  });

  if (!reset || reset.usedAt || reset.expiresAt < new Date()) {
    return NextResponse.json({ error: "Link inválido ou expirado." }, { status: 404 });
  }

  return NextResponse.json({ name: reset.user.name, email: reset.user.email });
}

const schema = z.object({
  password: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres."),
});

export async function POST(req: Request, { params }: { params: { token: string } }) {
  const reset = await prisma.passwordResetToken.findUnique({ where: { token: params.token } });

  if (!reset || reset.usedAt || reset.expiresAt < new Date()) {
    return NextResponse.json({ error: "Link inválido ou expirado." }, { status: 404 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const passwordHash = await hash(parsed.data.password, 10);

  await prisma.$transaction([
    prisma.user.update({ where: { id: reset.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: reset.id }, data: { usedAt: new Date() } }),
  ]);

  return NextResponse.json({ ok: true });
}