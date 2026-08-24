import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeAcessarPaciente, podeEditarPaciente } from "@/lib/patient-access";

export async function DELETE(_req: Request, { params }: { params: { id: string; familyId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !podeEditarPaciente(session)) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }
  const acesso = await podeAcessarPaciente(session, params.id);
  if (!acesso) return NextResponse.json({ error: "Paciente não encontrado." }, { status: 404 });

  const familyMember = await prisma.familyMember.findUnique({ where: { id: params.familyId } });
  if (!familyMember || familyMember.patientId !== params.id) {
    return NextResponse.json({ error: "Familiar não encontrado." }, { status: 404 });
  }

  await prisma.familyMember.delete({ where: { id: params.familyId } });
  return NextResponse.json({ ok: true });
}
