import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const aceitarSchema = z.object({
  password: z.string().min(6, "A senha precisa ter ao menos 6 caracteres."),
});

export async function POST(req: Request, { params }: { params: { token: string } }) {
  const familyMember = await prisma.familyMember.findUnique({ where: { inviteToken: params.token } });

  if (!familyMember) {
    return NextResponse.json({ error: "Convite inválido." }, { status: 404 });
  }
  if (familyMember.status === "ATIVO") {
    return NextResponse.json({ error: "Este convite já foi aceito." }, { status: 409 });
  }

  const body = await req.json();
  const parsed = aceitarSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  // Se esse e-mail já tem conta (ex: acompanha mais de um paciente), reaproveita o usuário
  let user = await prisma.user.findUnique({ where: { email: familyMember.email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: familyMember.name,
        email: familyMember.email,
        passwordHash,
        role: "FAMILIAR",
      },
    });
  }

  await prisma.familyMember.update({
    where: { id: familyMember.id },
    data: { status: "ATIVO", userId: user.id, inviteToken: null },
  });

  return NextResponse.json({ ok: true });
}
