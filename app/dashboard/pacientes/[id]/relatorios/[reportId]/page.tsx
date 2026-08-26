import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/session";
import { podeAcessarPaciente } from "@/lib/patient-access";
import { BotaoExportarPdf } from "@/components/botao-exportar-pdf";
import { RelatorioDocumento, type ReportSnapshot } from "@/components/relatorio-documento";
import { PainelCompartilharRelatorio } from "@/components/painel-compartilhar-relatorio";

export const dynamic = "force-dynamic";

export default async function VerRelatorioPage({ params }: { params: { id: string; reportId: string } }) {
  const session = await requireStaff();
  const acesso = await podeAcessarPaciente(session, params.id);
  if (!acesso) notFound();

  const report = await prisma.report.findUnique({ where: { id: params.reportId } });
  if (!report || report.patientId !== params.id) notFound();

  const linkAtivo = await prisma.accessLink.findFirst({
    where: { reportId: params.reportId, revoked: false },
    orderBy: { createdAt: "desc" },
  });

  const snapshot = report.snapshot as unknown as ReportSnapshot;

  return (
    <div className="min-h-screen p-3 sm:p-10 bg-surfaceAlt">
      <div className="w-full h-full">
        <div className="flex items-center justify-between mb-4 print:hidden">
          <Link href={`/dashboard/pacientes/${params.id}/relatorios`} className="text-xs text-inkFaint">
            ← Voltar aos relatórios
          </Link>
          <BotaoExportarPdf reportId={params.reportId} fileName={`relatorio-${params.reportId}.pdf`} />
        </div>

        <div className="print:hidden">
          <PainelCompartilharRelatorio
            patientId={params.id}
            reportId={params.reportId}
            linkInicial={linkAtivo}
          />
        </div>

        <RelatorioDocumento snapshot={snapshot} criadoEm={report.createdAt} />
      </div>
    </div>
  );
}
