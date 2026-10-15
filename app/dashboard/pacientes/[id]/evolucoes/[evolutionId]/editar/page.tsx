import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/session";
import { podeAcessarPaciente } from "@/lib/patient-access";
import { EditarEvolucaoForm } from "@/components/editar-evolucao-form";


export const dynamic = "force-dynamic";

export default async function EditarEvolucaoPage({
  params,
}: {
  params: { id: string; evolutionId: string };
}) {
  const session = await requireStaff();
  const acesso = await podeAcessarPaciente(session, params.id);
  if (!acesso) notFound();

  const evolution = await prisma.evolution.findUnique({ where: { id: params.evolutionId } });
  if (!evolution || evolution.patientId !== params.id) notFound();

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

  return (
    <EditarEvolucaoForm
      paciente={paciente}
      evolucao={{
        id: evolution.id,
        title: evolution.title,
        note: evolution.note,
        painLevel: evolution.painLevel,
        romDegrees: evolution.romDegrees,
        highlighted: evolution.highlighted,
        phaseId: evolution.phaseId,
        // mesma convenção da criação: a data é guardada como AAAA-MM-DD (meia-noite UTC)
        sessionDate: evolution.sessionDate.toISOString().slice(0, 10),
      }}
    />
  );
}