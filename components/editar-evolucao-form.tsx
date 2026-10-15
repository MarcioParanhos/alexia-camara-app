"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Save, Sparkles, ThumbsUp, Smile, Meh, Frown } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { useToast } from "@/components/toast-provider";

type Fase = {
  id: string;
  name: string;
  color: string;
  plannedSessions: number;
  _count: { evolutions: number };
};

type Props = {
  paciente: { id: string; name: string; phases: Fase[] };
  evolucao: {
    id: string;
    title: string;
    note: string;
    painLevel: number | null;
    romDegrees: number | null;
    highlighted: boolean;
    phaseId: string | null;
    sessionDate: string;
  };
};

function FaceDor({ nivel }: { nivel: number }) {
  const Icone = nivel <= 3 ? Smile : nivel <= 6 ? Meh : Frown;
  const cor = nivel <= 3 ? "#3F6B58" : nivel <= 6 ? "#B9812F" : "#A94A3D";
  return <Icone size={22} color={cor} />;
}

function ajustarAltura(el: HTMLTextAreaElement) {
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

export function EditarEvolucaoForm({ paciente, evolucao }: Props) {
  const router = useRouter();
  const mostrarToast = useToast();

  const [faseId, setFaseId] = useState<string | undefined>(evolucao.phaseId ?? undefined);
  const [dor, setDor] = useState(evolucao.painLevel ?? 0);
  const [amplitude, setAmplitude] = useState(evolucao.romDegrees ?? 100);
  const [titulo, setTitulo] = useState(evolucao.title);
  const [nota, setNota] = useState(evolucao.note);
  const [dataSessao, setDataSessao] = useState(evolucao.sessionDate);
  const [destaque, setDestaque] = useState(evolucao.highlighted);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const notaRef = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => {
    if (notaRef.current) ajustarAltura(notaRef.current);
  }, []);

  const fase = paciente.phases.find((f) => f.id === faseId);
  // o _count já inclui esta sessão se ela continuar na mesma fase
  const mudouDeFase = (faseId ?? null) !== evolucao.phaseId;
  const registradosNaFase = fase ? fase._count.evolutions + (mudouDeFase ? 1 : 0) : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (!titulo.trim() || !nota.trim()) {
      setErro("Preencha ao menos o título e as observações.");
      return;
    }

    setSalvando(true);
    try {
      const resp = await fetch(`/api/patients/${paciente.id}/evolutions/${evolucao.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phaseId: faseId ?? null,
          title: titulo.trim(),
          note: nota.trim(),
          painLevel: dor,
          romDegrees: amplitude,
          highlighted: destaque,
          sessionDate: dataSessao,
        }),
      });

            if (!resp.ok) {
        const d = await resp.json().catch(() => null);
        const msg =
          typeof d?.error === "string"
            ? d.error
            : d?.error?.fieldErrors
            ? (Object.values(d.error.fieldErrors).flat()[0] as string | undefined)
            : undefined;
        throw new Error(msg || `Não foi possível salvar as alterações (erro ${resp.status}).`);
      }

      mostrarToast("Sessão atualizada com sucesso.", "sucesso");
      router.push(`/dashboard/pacientes/${paciente.id}`);
      router.refresh();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="rounded-2xl p-5 sm:p-8 bg-bg">
      <div className="flex items-start sm:items-center justify-between gap-4 mb-2">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.18em] mb-1 text-inkFaint">{paciente.name}</p>
          <h2 className="text-xl sm:text-2xl font-display font-semibold text-ink">Editar sessão</h2>
        </div>
        <Avatar nome={paciente.name} size={38} />
      </div>
      {fase && (
        <p className="text-sm mb-7 text-inkSoft">
          Faz parte da fase <strong style={{ color: fase.color }}>{fase.name}</strong>
          {registradosNaFase !== null && ` — ${registradosNaFase} de ${fase.plannedSessions} sessões previstas registradas`}.
        </p>
      )}
      {paciente.phases.length === 0 && (
        <p className="text-sm mb-7 text-inkFaint">Este paciente não tem fases de tratamento cadastradas.</p>
      )}

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_320px] gap-6 lg:gap-8">
        {/* Formulário */}
        <div className="rounded-xl p-5 sm:p-7 space-y-7 bg-white border border-line">
          {paciente.phases.length > 0 && (
            <div>
              <label className="text-xs mb-2.5 block text-inkSoft">Qual fase da trilha essa sessão pertence?</label>
              <div className="flex flex-wrap gap-2">
                {paciente.phases.map((f) => (
                  <button
                    type="button"
                    key={f.id}
                    onClick={() => setFaseId(f.id)}
                    className="flex items-center gap-2 text-xs px-3 py-2 rounded-full"
                    style={{
                      background: faseId === f.id ? f.color : "#F1ECE1",
                      color: faseId === f.id ? "#fff" : "#5B6157",
                      border: `1px solid ${faseId === f.id ? f.color : "#DDD5C4"}`,
                    }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ background: faseId === f.id ? "#fff" : f.color }} />
                    {f.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs mb-1.5 block text-inkSoft">Data da sessão</label>
              <div className="flex items-center gap-2 rounded-lg px-3.5 py-2.5 bg-surface border border-line focus-within:border-primary transition-colors">
                <Calendar size={14} className="text-inkFaint" />
                <input
                  type="date"
                  value={dataSessao}
                  onChange={(e) => setDataSessao(e.target.value)}
                  className="bg-transparent outline-none w-full text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-xs mb-1.5 block text-inkSoft">Título do registro</label>
              <input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none bg-surface border border-line focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-xs mb-2.5 block text-inkSoft">Nível de dor referido</label>
              <div className="flex items-center gap-3 mb-2">
                <FaceDor nivel={dor} />
                <span className="text-2xl font-mono text-ink">{dor}</span>
                <span className="text-xs text-inkFaint">/ 10 — escala EVA</span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                value={dor}
                onChange={(e) => setDor(Number(e.target.value))}
                className="w-full"
                style={{ accentColor: "#22291F" }}
              />
            </div>
            <div>
              <label className="text-xs mb-2.5 block text-inkSoft">Amplitude de movimento</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setAmplitude((a) => Math.max(0, a - 5))}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-lg bg-surface border border-line text-inkSoft"
                >
                  −
                </button>
                <div className="text-center w-20">
                  <span className="text-2xl font-mono text-ink">{amplitude}°</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAmplitude((a) => Math.min(180, a + 5))}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-lg bg-surface border border-line text-inkSoft"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs mb-1.5 block text-inkSoft">Observações clínicas</label>
            <textarea
              ref={notaRef}
              rows={4}
              value={nota}
              onChange={(e) => {
                setNota(e.target.value);
                ajustarAltura(e.target);
              }}
              className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none resize-none overflow-hidden bg-surface border border-line focus:border-primary transition-colors"
            />
          </div>

          <button
            type="button"
            onClick={() => setDestaque(!destaque)}
            className="w-full flex items-center justify-between rounded-lg p-4"
            style={{
              background: destaque ? "#F1E2C2" : "#F1ECE1",
              border: `1px solid ${destaque ? "#B9812F" : "#DDD5C4"}`,
            }}
          >
            <div className="flex items-center gap-2.5 text-left">
              <Sparkles size={16} className={destaque ? "text-accent" : "text-inkFaint"} />
              <div>
                <p className="text-sm font-medium text-ink">Destacar como marco na trilha</p>
                <p className="text-[11px] text-inkFaint">Aparece com um selo especial para a família</p>
              </div>
            </div>
            <div
              className="w-10 h-6 rounded-full flex items-center px-1 shrink-0"
              style={{ background: destaque ? "#B9812F" : "#DDD5C4", justifyContent: destaque ? "flex-end" : "flex-start" }}
            >
              <div className="w-4 h-4 rounded-full bg-white" />
            </div>
          </button>

          {erro && <p className="text-sm text-attention">{erro}</p>}

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={salvando}
              className="sm:w-40 rounded-lg py-3 text-sm font-medium border border-line text-inkSoft hover:bg-surface disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium text-white bg-primary disabled:opacity-60"
            >
              <Save size={15} /> {salvando ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </div>

        {/* Prévia ao vivo */}
        <div className="lg:sticky lg:top-24 h-fit">
          <p className="text-[11px] uppercase tracking-wide mb-3 flex items-center gap-1.5 text-inkFaint">
            <ThumbsUp size={12} /> Assim vai aparecer na trilha
          </p>
          <div className="rounded-xl p-5 bg-white border border-line">
            {fase && (
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full" style={{ background: fase.color }} />
                <span className="text-[11px] text-inkFaint">{fase.name}</span>
              </div>
            )}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <p className="text-[15px] font-display font-semibold text-ink">{titulo || "Título do registro"}</p>
                <p className="text-xs mt-0.5 font-mono text-inkFaint">
                  {dataSessao ? new Intl.DateTimeFormat("pt-BR").format(new Date(dataSessao + "T00:00:00")) : "—"}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-lg leading-none font-mono text-ink">{dor}</span>
                <span className="text-[10px] text-inkFaint">/10</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-2 whitespace-pre-line" style={{ color: nota ? "#5B6157" : "#8A8F7F" }}>
              {nota || "Suas observações aparecerão aqui conforme você digita."}
            </p>
            <p className="text-xs font-mono text-inkFaint">Amplitude: {amplitude}°</p>
            {destaque && (
              <span className="inline-flex items-center gap-1 mt-3 text-xs px-2.5 py-1 rounded-full bg-accent-soft text-accent">
                <Sparkles size={11} /> Marco em destaque
              </span>
            )}
          </div>

          <div className="rounded-xl p-4 mt-4 bg-primary-soft">
            <p className="text-xs leading-relaxed text-primary-dark">
              Os anexos desta sessão continuam sendo gerenciados no próprio card, em <strong>Anexar arquivo</strong>.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}