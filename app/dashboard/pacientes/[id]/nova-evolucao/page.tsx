import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/session";
import { podeAcessarPaciente } from "@/lib/patient-access";
import { NovoRegistroForm } from "./form";

export const dynamic = "force-dynamic";

export default async function NovaEvolucaoPage({ params }: { params: { id: string } }) {
  const session = await requireStaff();
  const acesso = await podeAcessarPaciente(session, params.id);
  if (!acesso) notFound();

  const paciente = await prisma.patient.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      phases: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          name: true,
          color: true,
          plannedSessions: true,
          _count: { select: { evolutions: true } },
        },
      },
    },
  });

  if (!paciente) notFound();

  return <NovoRegistroForm paciente={paciente} />;
}
