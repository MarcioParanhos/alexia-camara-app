import Link from "next/link";
import { Archive } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/session";
import { BackButton } from "@/components/back-button";
import { ExcluirPacienteDefinitivo } from "@/components/excluir-paciente-definitivo";
import { DesarquivarPaciente } from "@/components/desarquivar-paciente";

export const dynamic = "force-dynamic";

export default async function PacientesArquivadosPage() {
  const session = await requireStaff();
  const isAdmin = session.user.role === "ADMIN";
  const professionalId = session.user.professionalId ?? "__none__";

  const pacientes = await prisma.patient.findMany({
    where: {
      status: "ARQUIVADO",
      ...(isAdmin ? {} : { professionalId }),
    },
    select: { id: true, name: true, diagnosis: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="rounded-2xl p-5 sm:p-8 bg-bg">
      <div className="flex justify-end mb-6">
        <BackButton />
      </div>

      <div className="flex items-center gap-1.5 mb-1">
        <Archive size={14} className="text-inkFaint" />
        <p className="text-xs uppercase tracking-[0.18em] text-inkFaint">
          Pacientes arquivados
        </p>
      </div>
      <h2 className="text-xl sm:text-2xl font-display font-semibold text-ink mb-6">
        {pacientes.length} paciente{pacientes.length === 1 ? "" : "s"} arquivado
        {pacientes.length === 1 ? "" : "s"}
      </h2>

      {pacientes.length === 0 ? (
        <div className="rounded-xl p-8 text-center bg-white border border-dashed border-line">
          <p className="text-sm text-inkFaint">
            Nenhum paciente arquivado no momento.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {pacientes.map((p) => (
            <div
              key={p.id}
              className="flex flex-wrap items-center gap-3 rounded-xl p-4 bg-white border border-line"
            >
              <div className="flex-1 min-w-[160px]">
                <p className="text-sm font-medium text-ink truncate">
                  {p.name}
                </p>
                <p className="text-xs text-inkFaint truncate">
                  {p.diagnosis || "Sem diagnóstico"}
                </p>
              </div>
              <DesarquivarPaciente id={p.id} />
              <ExcluirPacienteDefinitivo id={p.id} nome={p.name} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
