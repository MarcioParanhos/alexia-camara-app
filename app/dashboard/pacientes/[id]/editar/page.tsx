import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { podeAcessarPaciente } from "@/lib/patient-access";
import { EditarPacienteForm } from "@/components/editar-paciente-form";

export const dynamic = "force-dynamic";

export default async function EditarPacientePage({ params }: { params: { id: string } }) {
  const session = await requireStaff();

  const acesso = await podeAcessarPaciente(session, params.id);
  if (!acesso) notFound();

  const paciente = await prisma.patient.findUnique({
    where: { id: params.id },
    include: { phases: { orderBy: { order: "asc" } } },
  });

  if (!paciente) notFound();

  return <EditarPacienteForm paciente={paciente} />;
}