import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PROFISSIONAL") {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const professional = await prisma.professional.findUnique({
    where: { userId: session.user.id },
    include: { user: { select: { name: true, email: true } } },
  });

  return NextResponse.json({ professional });
}

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  crefito: z.string().optional(),
  specialty: z.string().optional(),
  bio: z.string().optional(),
  clinicName: z.string().optional(),
  brandColor: z.string().optional(),
  logoUrl: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
});

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PROFISSIONAL") {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, currentPassword, newPassword, ...dadosProfissional } = parsed.data;

  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json({ error: "Informe a senha atual para definir uma nova." }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });

    const valida = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valida) return NextResponse.json({ error: "Senha atual incorreta." }, { status: 400 });

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: session.user.id }, data: { passwordHash } });
  }

  if (name) {
    await prisma.user.update({ where: { id: session.user.id }, data: { name } });
  }

  const professional = await prisma.professional.update({
    where: { userId: session.user.id },
    data: dadosProfissional,
  });

  return NextResponse.json({ professional });
}
