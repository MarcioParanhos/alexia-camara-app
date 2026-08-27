import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { z } from "zod";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await requireAdmin();
  const convites = await prisma.professionalInvite.findMany({
    where: { status: "PENDENTE" },
    orderBy: { invitedAt: "desc" },
  });
  return NextResponse.json({ convites });
}

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

export async function POST(req: Request) {
  await requireAdmin();

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();

  const jaExisteUsuario = await prisma.user.findUnique({ where: { email } });
  if (jaExisteUsuario) {
    return NextResponse.json({ error: "Já existe um usuário com este e-mail." }, { status: 409 });
  }

  const conviteExistente = await prisma.professionalInvite.findUnique({ where: { email } });
  if (conviteExistente && conviteExistente.status === "PENDENTE") {
    return NextResponse.json({ error: "Já existe um convite pendente para este e-mail." }, { status: 409 });
  }

  const token = randomBytes(24).toString("hex");

  const convite = conviteExistente
    ? await prisma.professionalInvite.update({
        where: { email },
        data: { name: parsed.data.name, token, status: "PENDENTE", invitedAt: new Date() },
      })
    : await prisma.professionalInvite.create({
        data: { name: parsed.data.name, email, token },
      });

  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/convite-profissional/${token}`;

  return NextResponse.json({ convite, inviteUrl }, { status: 201 });
}