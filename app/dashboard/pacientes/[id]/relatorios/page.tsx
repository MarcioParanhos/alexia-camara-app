import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/session";
import { podeAcessarPaciente } from "@/lib/patient-access";
import { GerarRelatorioForm } from "./form";

export const dynamic = "force-dynamic";

export default async function RelatoriosPage({ params }: { params: { id: string } }) {
  const session = await requireStaff();
  const acesso = await podeAcessarPaciente(session, params.id);
  if (!acesso) notFound();

  const paciente = await prisma.patient.findUnique({
    where: { id: params.id },
    select: { id: true, name: true },
  });
  if (!paciente) notFound();

  const reports = await prisma.report.findMany({
    where: { patientId: params.id },
    orderBy: { createdAt: "desc" },
    include: { generatedBy: { select: { name: true } } },
  });

  return (
    <div className="rounded-2xl p-5 sm:p-8 bg-bg">
      <Link href={`/dashboard/pacientes/${paciente.id}`} className="text-xs mb-6 flex items-center gap-1 text-inkFaint">
        ← Voltar ao prontuário
      </Link>

      <p className="text-xs uppercase tracking-[0.18em] mb-1 text-inkFaint">{paciente.name}</p>
      <h2 className="text-xl sm:text-2xl font-display font-semibold text-ink mb-7">Relatórios de evolução</h2>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6 lg:gap-8">
        <div>
          <p className="text-[11px] uppercase tracking-wide mb-3 text-inkFaint">
            Relatórios já gerados ({reports.length})
          </p>
          {reports.length === 0 ? (
            <div className="rounded-xl p-8 text-center bg-white border border-dashed border-line">
              <FileText size={20} className="mx-auto mb-3 text-inkFaint" />
              <p className="text-sm text-inkFaint">Nenhum relatório gerado ainda para este paciente.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {reports.map((r) => (
                <Link
                  key={r.id}
                  href={`/dashboard/pacientes/${paciente.id}/relatorios/${r.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl p-4 bg-white border border-line block"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText size={16} className="text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink truncate">
                        {formatarData(r.periodStart)} — {formatarData(r.periodEnd)}
                      </p>
                      <p className="text-xs text-inkFaint truncate">
                        Gerado por {r.generatedBy.name} em {formatarData(r.createdAt)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <GerarRelatorioForm patientId={paciente.id} />
      </div>
    </div>
  );
}

function formatarData(data: Date) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(data));
}
