import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { C } from "@/lib/design-tokens";
import { Avatar } from "@/components/avatar";
import { RelatorioDocumento, type ReportSnapshot } from "@/components/relatorio-documento";
import { Sparkles, Calendar, Activity, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AcessoPublicoPage({ params }: { params: { token: string } }) {
  const link = await prisma.accessLink.findUnique({ where: { token: params.token } });

  if (!link || link.revoked || link.expiresAt < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: C.surface }}>
        <div className="text-center max-w-sm">
          <h1 className="text-xl font-display font-semibold text-ink mb-2">Link indisponível</h1>
          <p className="text-sm text-inkSoft">
            Este link expirou ou foi desativado. Peça à Alexia Câmara para gerar um novo.
          </p>
        </div>
      </div>
    );
  }

  // Registra o acesso (não bloqueia a renderização se falhar)
  prisma.accessLink.update({ where: { id: link.id }, data: { lastAccessAt: new Date() } }).catch(() => {});

  // Link de um RELATÓRIO específico — mostra o documento, não a trilha geral
  if (link.reportId) {
    const report = await prisma.report.findUnique({ where: { id: link.reportId } });
    if (!report) notFound();

    const snapshot = report.snapshot as unknown as ReportSnapshot;

    return (
      <div className="min-h-screen py-8 sm:py-10 px-3 sm:px-6" style={{ background: C.surfaceAlt }}>
        <p className="text-center text-xs uppercase tracking-[0.18em] mb-6 text-inkFaint">
          Relatório compartilhado — acesso somente leitura, expira em {formatarData(link.expiresAt)}
        </p>
        <RelatorioDocumento snapshot={snapshot} criadoEm={report.createdAt} />
      </div>
    );
  }

  // Link geral da trilha do paciente
  const paciente = await prisma.patient.findUnique({
    where: { id: link.patientId },
    include: {
      evolutions: { orderBy: { sessionDate: "desc" } },
      phases: { orderBy: { order: "asc" } },
      professional: { select: { clinicName: true, brandColor: true } },
    },
  });

  if (!paciente) notFound();

  const totalPrevisto = paciente.phases.reduce((s, f) => s + f.plannedSessions, 0);
  const adesao = totalPrevisto > 0 ? Math.min(100, Math.round((paciente.evolutions.length / totalPrevisto) * 100)) : null;
  const ultimaDor = paciente.evolutions[0]?.painLevel ?? null;
  const marcos = paciente.evolutions.filter((e) => e.highlighted);
  const brandColor = paciente.professional.brandColor || C.primary;

  return (
    <div className="min-h-screen" style={{ background: C.surface }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] mb-1 text-inkFaint">Acompanhamento — acesso somente leitura</p>
            <h1 className="text-xl sm:text-2xl font-display font-semibold text-ink">Como {paciente.name.split(" ")[0]} está indo</h1>
          </div>
          <Avatar nome={paciente.name} size={38} />
        </div>

        <div
          className="rounded-2xl p-6 sm:p-7 mb-6 text-white relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${C.primaryDark}, ${brandColor})` }}
        >
          <p className="text-xs uppercase tracking-wide text-white/70 mb-2">{paciente.professional.clinicName || "Fisioterapia"}</p>
          <p className="text-lg leading-relaxed max-w-md font-display font-medium">
            {paciente.evolutions.length > 0
              ? `${paciente.evolutions.length} sessões registradas até agora, com acompanhamento contínuo da evolução.`
              : "O tratamento ainda está começando — em breve os primeiros registros aparecem aqui."}
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Sessões realizadas", valor: String(paciente.evolutions.length), icon: Calendar },
            { label: "Nível de dor mais recente", valor: ultimaDor !== null ? `${ultimaDor}/10` : "—", icon: Activity },
            { label: "Progresso do plano", valor: adesao !== null ? `${adesao}%` : "—", icon: TrendingUp },
          ].map((s, i) => (
            <div key={i} className="rounded-xl p-5 bg-white border border-line">
              <s.icon size={16} className="mb-3" style={{ color: brandColor }} />
              <p className="text-2xl font-mono text-ink">{s.valor}</p>
              <p className="text-xs mt-1 text-inkFaint">{s.label}</p>
            </div>
          ))}
        </div>

        {marcos.length > 0 && (
          <>
            <p className="text-xs uppercase tracking-[0.18em] mb-4 text-inkFaint">Marcos recentes</p>
            <div className="space-y-3 mb-8">
              {marcos.slice(0, 5).map((m) => (
                <div key={m.id} className="flex items-start gap-4 rounded-xl p-4 bg-white border border-line">
                  <div className="text-xs shrink-0 w-16 pt-0.5 font-mono" style={{ color: brandColor }}>
                    {formatarDataCurta(m.sessionDate)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed text-inkSoft">{m.note}</p>
                    <span className="inline-flex items-center gap-1 mt-2 text-[11px] px-2 py-0.5 rounded-full bg-accent-soft text-accent">
                      <Sparkles size={10} /> Marco
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <p className="text-xs uppercase tracking-[0.18em] mb-4 text-inkFaint">Linha do tempo</p>
        {paciente.evolutions.length === 0 ? (
          <p className="text-sm text-inkFaint">Ainda não há registros de evolução para mostrar.</p>
        ) : (
          <div className="space-y-3">
            {paciente.evolutions.map((ev) => (
              <div key={ev.id} className="rounded-xl p-4 bg-white border border-line">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-medium text-ink">{ev.title}</p>
                  <span className="text-[11px] font-mono text-inkFaint">{formatarDataCurta(ev.sessionDate)}</span>
                </div>
                <p className="text-sm leading-relaxed text-inkSoft">{ev.note}</p>
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-[11px] mt-10 text-inkFaint">
          Acesso somente leitura fornecido por {paciente.professional.clinicName || "Alexia Câmara"}.
        </p>
      </div>
    </div>
  );
}

function formatarDataCurta(data: Date) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(data));
}

function formatarData(data: Date) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(data));
}
