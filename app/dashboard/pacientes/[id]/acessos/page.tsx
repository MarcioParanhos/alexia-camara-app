import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/session";
import { podeAcessarPaciente } from "@/lib/patient-access";
import { GestaoAcessosPainel } from "./painel";

export const dynamic = "force-dynamic";

export default async function GestaoAcessosPage({ params }: { params: { id: string } }) {
  const session = await requireStaff();
  const acesso = await podeAcessarPaciente(session, params.id);
  if (!acesso) notFound();

  const paciente = await prisma.patient.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      familyMembers: { orderBy: { invitedAt: "desc" } },
      accessLinks: { where: { revoked: false }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!paciente) notFound();

  return <GestaoAcessosPainel paciente={paciente} />;
}
