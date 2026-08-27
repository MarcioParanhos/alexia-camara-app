import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireFamily } from "@/lib/session";
import { Avatar } from "@/components/avatar";
import { Calendar, Activity, TrendingUp, Sparkles, Footprints, Star } from "lucide-react";
import { C } from "@/lib/design-tokens";

export const dynamic = "force-dynamic";

export default async function PortalPacientePage({ params }: { params: { id: string } }) {
  const session = await requireFamily();

  const temAcesso = session.user.role === "ADMIN" || session.user.patientIds.includes(params.id);
  if (!temAcesso) notFound();

  const paciente = await prisma.patient.findUnique({
    where: { id: params.id },
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
  const diasTratamento = paciente.startDate
    ? Math.max(0, Math.floor((Date.now() - new Date(paciente.startDate).getTime()) / 86400000))
    : null;

  return (
    <div className="p-3 sm:p-10 bg-surfaceAlt">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <p className="text-lg sm:text-xl leading-relaxed max-w-2xl font-display font-medium mb-4">Portal da família</p>
          <h2 className="text-xl sm:text-2xl font-display font-semibold text-ink">
            Como {paciente.name.split(" ")[0]} está indo
          </h2>
        </div>
        <Avatar nome={paciente.name} size={38} />
      </div>

      {/* Hero — trilha percorrida até aqui */}
      <div
        className="relative rounded-2xl p-5 sm:p-8 mb-6 text-white overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${C.primaryDark}, ${brandColor})` }}
      >
        <svg
          aria-hidden
          className="absolute -right-6 -bottom-8 opacity-[0.14] pointer-events-none"
          width="200"
          height="140"
          viewBox="0 0 200 140"
        >
          <path
            d="M4 130 C 40 100, 20 70, 55 55 S 100 20, 130 30 S 175 60, 196 20"
            stroke="white"
            strokeWidth="3"
            strokeDasharray="1 14"
            strokeLinecap="round"
            fill="none"
          />
        </svg>

        <p className="text-xs uppercase tracking-wide text-white/70 mb-2">Resumo</p>
        <p className="text-lg sm:text-xl leading-relaxed max-w-6xl font-display font-medium mb-4">
          {paciente.evolutions.length > 0
            ? `${paciente.evolutions.length} sessões registradas até agora, com acompanhamento contínuo da evolução.`
            : "O tratamento ainda está começando — em breve os primeiros registros aparecem aqui."}
        </p>

        {diasTratamento !== null && (
          <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm">
            <Footprints size={13} />
            {diasTratamento === 0 ? "Começou hoje" : `${diasTratamento} dias de trilha percorrida`}
          </span>
        )}
      </div>

      {/* Resumo em três paradas */}
      <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <span
          aria-hidden
          className="hidden sm:block absolute top-[27px] left-[16.6%] right-[16.6%] h-px"
          style={{ background: "#E4E7DE" }}
        />
        {[
          { label: "Sessões realizadas", valor: String(paciente.evolutions.length), icon: Calendar },
          { label: "Nível de dor mais recente", valor: ultimaDor !== null ? `${ultimaDor}/10` : "—", icon: Activity },
          { label: "Progresso do plano", valor: adesao !== null ? `${adesao}%` : "—", icon: TrendingUp },
        ].map((s, i) => (
          <div key={i} className="relative rounded-xl p-5 bg-white border border-line">
            <span
              className="w-9 h-9 rounded-full flex items-center justify-center mb-3"
              style={{ background: `${brandColor}1A` }}
            >
              <s.icon size={16} style={{ color: brandColor }} />
            </span>
            <p className="text-2xl font-display font-semibold text-ink">{s.valor}</p>
            <p className="text-xs mt-1 text-inkFaint">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Marcos — carrossel de destaques */}
      {marcos.length > 0 && (
        <div className="mb-9">
          <p className="text-xs uppercase tracking-[0.18em] mb-4 text-inkFaint flex items-center gap-1.5">
            <Sparkles size={12} /> Marcos recentes
          </p>
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1 -mx-1 px-1 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible sm:pb-0 sm:mx-0 sm:px-0">
            {marcos.slice(0, 6).map((m) => (
              <div
                key={m.id}
                className="snap-start shrink-0 w-[250px] sm:w-auto rounded-xl p-4 border"
                style={{ background: "#FBF3E1", borderColor: "#EEDBA6" }}
              >
                <div className="flex items-center gap-1.5 mb-2 text-[11px] font-mono" style={{ color: "#9A6A1E" }}>
                  <Star size={11} fill="#D9A441" color="#D9A441" /> {formatarDataCurta(m.sessionDate)}
                </div>
                <p className="text-sm leading-relaxed text-inkSoft line-clamp-4">{m.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trilha completa */}
      <p className="text-xs uppercase tracking-[0.18em] mb-4 text-inkFaint">Linha do tempo</p>
      {paciente.evolutions.length === 0 ? (
        <div className="rounded-xl p-8 text-center bg-white border border-dashed border-line">
          <Footprints size={20} className="mx-auto mb-3 text-inkFaint" />
          <p className="text-sm text-inkFaint">A trilha ainda vai começar — os primeiros passos aparecem aqui em breve.</p>
        </div>
      ) : (
        <div>
          {paciente.evolutions.map((ev, i) => {
            const ultimo = i === paciente.evolutions.length - 1;
            return (
              <div key={ev.id} className="flex gap-3.5">
                <div className="flex flex-col items-center">
                  {ev.highlighted ? (
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: "#F6E7C6" }}
                    >
                      <Star size={11} fill="#D9A441" color="#D9A441" />
                    </span>
                  ) : (
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 my-[6px]"
                      style={{ background: i === 0 ? brandColor : "#D8DED3" }}
                    />
                  )}
                  {!ultimo && <span className="w-px flex-1 my-1" style={{ background: "#E4E7DE" }} />}
                </div>

                <div className={`flex-1 min-w-0 ${ultimo ? "pb-0" : "pb-5"}`}>
                  <div className="rounded-xl p-4 bg-white border border-line">
                    <div className="flex items-center justify-between mb-1.5 gap-2">
                      <p className="text-sm font-medium text-ink truncate">{ev.title}</p>
                      <span className="text-[11px] font-mono text-inkFaint shrink-0">
                        {formatarDataCurta(ev.sessionDate)}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-inkSoft">{ev.note}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatarDataCurta(data: Date) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(data));
}