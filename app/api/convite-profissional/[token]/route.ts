import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { token: string } }) {
  const convite = await prisma.professionalInvite.findUnique({ where: { token: params.token } });
  if (!convite || convite.status !== "PENDENTE") {
    return NextResponse.json({ error: "Convite inválido ou já utilizado." }, { status: 404 });
  }
  return NextResponse.json({ name: convite.name, email: convite.email });
}

const schema = z.object({
  password: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres."),
  clinicName: z.string().optional(),
});

export async function POST(req: Request, { params }: { params: { token: string } }) {
  const convite = await prisma.professionalInvite.findUnique({ where: { token: params.token } });
  if (!convite || convite.status !== "PENDENTE") {
    return NextResponse.json({ error: "Convite inválido ou já utilizado." }, { status: 404 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const passwordHash = await hash(parsed.data.password, 10);

  await prisma.$transaction([
    prisma.user.create({
      data: {
        name: convite.name,
        email: convite.email,
        passwordHash,
        role: "PROFISSIONAL",
        professional: { create: { clinicName: parsed.data.clinicName } },
      },
    }),
    prisma.professionalInvite.update({
      where: { id: convite.id },
      data: { status: "ACEITO", acceptedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ ok: true });
}