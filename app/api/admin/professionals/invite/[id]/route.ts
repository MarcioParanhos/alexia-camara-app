import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await requireAdmin();

  const convite = await prisma.professionalInvite.findUnique({ where: { id: params.id } });
  if (!convite) {
    return NextResponse.json({ error: "Convite não encontrado." }, { status: 404 });
  }
  if (convite.status !== "PENDENTE") {
    return NextResponse.json({ error: "Este convite já foi aceito e não pode ser excluído." }, { status: 409 });
  }

  await prisma.professionalInvite.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}