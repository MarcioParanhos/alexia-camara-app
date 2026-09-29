import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { compare, hash } from "bcryptjs";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  name: z.string().min(2),
  crefito: z.string().optional(),
  specialty: z.string().optional(),
  bio: z.string().optional(),
  clinicName: z.string().optional(),
  brandColor: z.string().optional(),
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

  const { currentPassword, newPassword, name, ...dadosProfissional } = parsed.data;

  const usuario = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!usuario) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }

  // Se a pessoa preencheu nova senha, exige e valida a senha atual antes de trocar
  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json({ error: "Informe sua senha atual para definir uma nova." }, { status: 400 });
    }
    const senhaValida = await compare(currentPassword, usuario.passwordHash);
    if (!senhaValida) {
      return NextResponse.json({ error: "Senha atual incorreta." }, { status: 400 });
    }
  }

  const passwordHash = newPassword ? await hash(newPassword, 10) : undefined;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        ...(passwordHash ? { passwordHash } : {}),
      },
    }),
    prisma.professional.update({
      where: { userId: session.user.id },
      data: dadosProfissional,
    }),
  ]);

  return NextResponse.json({ ok: true });
} 