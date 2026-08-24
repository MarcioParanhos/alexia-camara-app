import { Sparkles, TrendingUp, Activity } from "lucide-react";

export type ReportSnapshot = {
  patientName: string;
  diagnosis: string | null;
  periodStart: string;
  periodEnd: string;
  parecer: string;
  phases: { name: string; color: string; plannedSessions: number; completedSessions: number }[];
  painHistory: { date: string; painLevel: number }[];
  romHistory: { date: string; romDegrees: number }[];
  milestones: { date: string; title: string; note: string }[];
  evolutions: { id: string; sessionDate: string; title: string; note: string; painLevel: number | null; romDegrees: number | null; highlighted: boolean }[];
  totalSessoesNoPeriodo: number;
  professional: {
    name: string;
    crefito: string | null;
    specialty: string | null;
    bio: string | null;
    clinicName: string | null;
    brandColor: string;
    logoUrl: string | null;
  };
};

export function RelatorioDocumento({ snapshot: s, criadoEm }: { snapshot: ReportSnapshot; criadoEm: Date | string }) {
  const brandColor = s.professional.brandColor || "#3F6B58";
  const primaryDark = "#2C4B3E";
  const totalPrevisto = s.phases.reduce((sum, f) => sum + f.plannedSessions, 0);

  return (
    <div className="min-h-screen w-full">
      {/* Página 1 — Capa */}
      <div
        className="relative rounded-lg overflow-hidden mb-6"
        style={{ minHeight: 420, background: `linear-gradient(155deg, ${primaryDark}, ${brandColor})`, boxShadow: "0 30px 70px -30px rgba(34,41,31,0.45)" }}
      >
        <div className="relative z-10 h-full flex flex-col justify-between gap-8 p-6 sm:p-10" style={{ minHeight: 420 }}>
          <div className="flex items-center justify-between">
            <div
              className="flex items-center justify-center rounded-full shrink-0"
              style={{ width: 46, height: 46, border: "1.5px solid rgba(255,255,255,0.55)", color: "#fff" }}
            >
              <span className="font-display italic font-semibold" style={{ fontSize: 18 }}>
                {iniciais(s.professional.name)}
              </span>
            </div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/60">Relatório de evolução</span>
          </div>

          <div>
            <p className="text-white/60 text-[11px] uppercase tracking-[0.2em] mb-3">
              {formatarData(s.periodStart)} — {formatarData(s.periodEnd)}
            </p>
            <h2 className="text-white text-3xl sm:text-4xl leading-[1.05] mb-6 font-display font-medium">
              A trilha de
              <br />
              {s.patientName.split(" ")[0]} até aqui
            </h2>
            <div className="flex flex-wrap gap-6 sm:gap-8 text-white/85 text-sm">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-white/50 mb-1">Paciente</p>
                <p style={{ fontWeight: 500 }}>{s.patientName}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-white/50 mb-1">Sessões no período</p>
                <p style={{ fontWeight: 500 }}>{s.totalSessoesNoPeriodo}</p>
              </div>
            </div>
          </div>

          <p className="text-white/60 text-xs max-w-[280px] leading-relaxed">{s.diagnosis || "Diagnóstico não informado"}</p>
        </div>
      </div>

      {/* Página 2 — Conteúdo */}
      <div className="relative rounded-lg p-6 sm:p-10 bg-white" style={{ boxShadow: "0 30px 70px -30px rgba(34,41,31,0.35)" }}>
        <div className="flex items-center justify-between mb-8">
          <span className="text-xs font-display italic font-semibold" style={{ color: primaryDark }}>
            {s.professional.clinicName || s.professional.name}
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-inkFaint">2 de 2</span>
        </div>

        {s.phases.length > 0 && (
          <>
            <p className="text-[11px] uppercase tracking-wide mb-4 text-inkFaint">Progresso por fase do tratamento</p>
            <div className="mb-9">
              <div className="flex w-full h-2.5 rounded-full overflow-hidden mb-3 bg-surfaceAlt">
                {s.phases.map((f, i) => (
                  <div key={i} style={{ width: `${totalPrevisto > 0 ? (f.plannedSessions / totalPrevisto) * 100 : 0}%` }}>
                    <div
                      className="h-full"
                      style={{
                        width: `${f.plannedSessions > 0 ? Math.min(100, (f.completedSessions / f.plannedSessions) * 100) : 0}%`,
                        background: f.color,
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-y-3 justify-between">
                {s.phases.map((f, i) => (
                  <div key={i} className="flex items-start gap-1.5" style={{ maxWidth: 130, minWidth: 100 }}>
                    <div className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ background: f.color }} />
                    <div>
                      <p className="text-[11px] leading-tight text-ink" style={{ fontWeight: 500 }}>{f.name}</p>
                      <p className="text-[10px] font-mono text-inkFaint">{f.completedSessions}/{f.plannedSessions} sessões</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {s.evolutions && s.evolutions.length > 0 && (
          <>
            <p className="text-[11px] uppercase tracking-wide mb-4 text-inkFaint">Evoluções do período</p>
            <div className="space-y-4 mb-9">
              {s.evolutions.map((ev) => (
                <div key={ev.id} className="rounded-xl p-4 bg-surface border border-line">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-ink">{ev.title}</p>
                      <p className="text-xs font-mono text-inkFaint">{formatarData(ev.sessionDate)}</p>
                    </div>
                    <div className="text-right text-xs text-inkFaint">
                      {ev.painLevel !== null && <div>Dor: {ev.painLevel}/10</div>}
                      {ev.romDegrees !== null && <div>Amplitude: {ev.romDegrees}°</div>}
                    </div>
                  </div>
                  {ev.note && <p className="text-sm mt-2 text-inkSoft whitespace-pre-line">{ev.note}</p>}
                </div>
              ))}
            </div>
          </>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-9">
          <div className="rounded-xl p-5 bg-surface border border-line">
            <p className="text-[11px] uppercase tracking-wide mb-3 flex items-center gap-1.5 text-inkFaint">
              <TrendingUp size={12} /> Amplitude de movimento
            </p>
            {s.romHistory.length === 0 ? (
              <p className="text-xs text-inkFaint">Sem registros de amplitude no período.</p>
            ) : (
              <div className="flex items-end gap-2.5 h-16">
                {s.romHistory.map((r, i) => {
                  const max = Math.max(...s.romHistory.map((x) => x.romDegrees));
                  const ultimo = i === s.romHistory.length - 1;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                      <div
                        className="w-full rounded-t"
                        style={{ height: `${(r.romDegrees / max) * 52}px`, background: ultimo ? s.professional.brandColor : "#DCE5DA" }}
                      />
                      <span className="text-[9px] font-mono text-inkFaint">{r.romDegrees}°</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="rounded-xl p-5 bg-surface border border-line">
            <p className="text-[11px] uppercase tracking-wide mb-3 flex items-center gap-1.5 text-inkFaint">
              <Activity size={12} /> Nível de dor (EVA)
            </p>
            {s.painHistory.length === 0 ? (
              <p className="text-xs text-inkFaint">Sem registros de dor no período.</p>
            ) : (
              <>
                <Sparkline valores={s.painHistory.map((p) => p.painLevel)} cor="#A94A3D" />
                <p className="text-[10px] mt-1 font-mono text-inkFaint">
                  {s.painHistory[0].painLevel} → {s.painHistory[s.painHistory.length - 1].painLevel} no período
                </p>
              </>
            )}
          </div>
        </div>

        <div className="rounded-xl p-6 mb-9 relative" style={{ background: "#DCE5DA" }}>
          <span className="absolute top-3 left-4 text-5xl leading-none select-none font-display" style={{ color: brandColor, opacity: 0.35 }}>
            "
          </span>
          <p className="text-[15px] leading-relaxed italic relative z-10 pl-4 font-display font-medium whitespace-pre-line" style={{ color: primaryDark }}>
            {s.parecer}
          </p>
          <p className="text-xs mt-3 pl-4" style={{ color: primaryDark, opacity: 0.7 }}>
            — {s.professional.name}, fisioterapeuta responsável
          </p>
        </div>

        {s.milestones.length > 0 && (
          <>
            <p className="text-[11px] uppercase tracking-wide mb-3 text-inkFaint">Marcos deste período</p>
            <div className="flex flex-wrap gap-2 mb-9">
              {s.milestones.map((m, i) => (
                <span key={i} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-accent-soft text-accent">
                  <Sparkles size={11} /> {m.title}
                </span>
              ))}
            </div>
          </>
        )}

        <div className="flex items-center justify-between pt-6 border-t border-line">
          <div>
            <p className="text-xs font-display italic font-semibold text-ink">{s.professional.name}</p>
            <p className="text-[10px] text-inkFaint">
              {s.professional.crefito ? `CREFITO ${s.professional.crefito}` : ""}
              {s.professional.specialty ? ` · ${s.professional.specialty}` : ""}
            </p>
          </div>
          <p className="text-xs font-mono text-inkFaint">Emitido em {formatarData(criadoEm)}</p>
        </div>
      </div>
    </div>
  );
}

function Sparkline({ valores, cor }: { valores: number[]; cor: string }) {
  const w = 180,
    h = 46,
    max = Math.max(...valores),
    min = Math.min(...valores);
  const pts = valores.map((v, i) => {
    const x = (i / Math.max(1, valores.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * (h - 8) - 4;
    return `${x},${y}`;
  });
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ maxWidth: w }}>
      <polyline points={pts.join(" ")} fill="none" stroke={cor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => {
        const [x, y] = p.split(",");
        const ultimo = i === pts.length - 1;
        return <circle key={i} cx={x} cy={y} r={ultimo ? 3.5 : 2} fill={ultimo ? cor : "#fff"} stroke={cor} strokeWidth="1.5" />;
      })}
    </svg>
  );
}

function iniciais(nome: string) {
  return nome.split(" ").map((p) => p[0]).slice(0, 2).join("");
}

function formatarData(data: Date | string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(data));
}
