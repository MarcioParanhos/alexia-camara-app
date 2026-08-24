"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Save, ImagePlus, Sparkles, ThumbsUp, Smile, Meh, Frown, X, FileText } from "lucide-react";
import { Avatar } from "@/components/avatar";

type Fase = {
  id: string;
  name: string;
  color: string;
  plannedSessions: number;
  _count: { evolutions: number };
};

function FaceDor({ nivel }: { nivel: number }) {
  const Icone = nivel <= 3 ? Smile : nivel <= 6 ? Meh : Frown;
  const cor = nivel <= 3 ? "#3F6B58" : nivel <= 6 ? "#B9812F" : "#A94A3D";
  return <Icone size={22} color={cor} />;
}

export function NovoRegistroForm({ paciente }: { paciente: { id: string; name: string; phases: Fase[] } }) {
  const router = useRouter();
  const [faseId, setFaseId] = useState<string | undefined>(paciente.phases[0]?.id);
  const [dor, setDor] = useState(3);
  const [amplitude, setAmplitude] = useState(100);
  const [titulo, setTitulo] = useState("");
  const [nota, setNota] = useState("");
  const [dataSessao, setDataSessao] = useState(() => new Date().toISOString().slice(0, 10));
  const [destaque, setDestaque] = useState(false);
  const [arquivos, setArquivos] = useState<File[]>([]);
  const inputArquivoRef = useRef<HTMLInputElement>(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const fase = paciente.phases.find((f) => f.id === faseId);
  const numeroSessao = fase ? fase._count.evolutions + 1 : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (!titulo.trim() || !nota.trim()) {
      setErro("Preencha ao menos o título e as observações.");
      return;
    }

    setSalvando(true);
    try {
      const resp = await fetch(`/api/patients/${paciente.id}/evolutions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phaseId: faseId,
          title: titulo,
          note: nota,
          painLevel: dor,
          romDegrees: amplitude,
          highlighted: destaque,
          sessionDate: dataSessao,
        }),
      });

      if (!resp.ok) throw new Error("Não foi possível salvar o registro.");

      const { evolution } = await resp.json();

      if (arquivos.length > 0) {
        const formData = new FormData();
        arquivos.forEach((f) => formData.append("file", f));
        formData.append("evolutionId", evolution.id);
        const respAnexos = await fetch(`/api/patients/${paciente.id}/attachments`, { method: "POST", body: formData });
        if (!respAnexos.ok) {
          // O registro já foi salvo; só avisamos que os anexos falharam, sem bloquear o fluxo
          const dataErro = await respAnexos.json().catch(() => ({}));
          setErro(typeof dataErro?.error === "string" ? dataErro.error : "Registro salvo, mas houve erro ao enviar os anexos.");
        }
      }

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
          <h2 className="text-xl sm:text-2xl font-display font-semibold text-ink">Novo registro de evolução</h2>
        </div>
        <Avatar nome={paciente.name} size={38} />
      </div>
      {fase && (
        <p className="text-sm mb-7 text-inkSoft">
          Faz parte da fase <strong style={{ color: fase.color }}>{fase.name}</strong>
          {numeroSessao !== null && ` — sessão ${numeroSessao} de ${fase.plannedSessions} previstas`}.
        </p>
      )}
      {paciente.phases.length === 0 && (
        <p className="text-sm mb-7 text-inkFaint">Este paciente ainda não tem fases de tratamento cadastradas.</p>
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
              <div className="flex items-center gap-2 rounded-lg px-3.5 py-2.5 bg-surface border border-line">
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
                placeholder={`Sessão ${numeroSessao ?? ""}`}
                className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none bg-surface border border-line"
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
              rows={4}
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Como foi a sessão? O que evoluiu, o que chamou atenção..."
              className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none resize-none bg-surface border border-line"
            />
          </div>

          <div>
            <label className="text-xs mb-2.5 block text-inkSoft">Anexar à sessão</label>
            <input
              ref={inputArquivoRef}
              type="file"
              multiple
              className="hidden"
              accept="image/*,.pdf,.doc,.docx"
              onChange={(e) => setArquivos((prev) => [...prev, ...Array.from(e.target.files ?? [])])}
            />
            <button
              type="button"
              onClick={() => inputArquivoRef.current?.click()}
              className="w-full rounded-lg p-5 flex flex-col items-center gap-2 text-center bg-surface border border-dashed border-line"
            >
              <ImagePlus size={18} className="text-inkFaint" />
              <span className="text-xs text-inkFaint">Clique para escolher fotos, PDFs ou documentos</span>
            </button>

            {arquivos.length > 0 && (
              <div className="mt-3 space-y-2">
                {arquivos.map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5 rounded-lg p-2.5 bg-surface border border-line">
                    <FileText size={14} className="text-inkSoft shrink-0" />
                    <span className="flex-1 min-w-0 text-xs text-ink truncate">{f.name}</span>
                    <button type="button" onClick={() => setArquivos((prev) => prev.filter((_, idx) => idx !== i))}>
                      <X size={13} className="text-inkFaint" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={salvando}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium text-white bg-primary disabled:opacity-60"
            >
              <Save size={15} /> {salvando ? "Salvando..." : "Salvar registro"}
            </button>
          </div>
        </div>

        {/* Prévia ao vivo */}
        <div className="lg:sticky lg:top-6 h-fit">
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
                  {new Intl.DateTimeFormat("pt-BR").format(new Date(dataSessao + "T00:00:00"))}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-lg leading-none font-mono text-ink">{dor}</span>
                <span className="text-[10px] text-inkFaint">/10</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-2" style={{ color: nota ? "#5B6157" : "#8A8F7F" }}>
              {nota || "Suas observações aparecerão aqui conforme você digita."}
            </p>
            <p className="text-xs font-mono text-inkFaint">Amplitude: {amplitude}°</p>
            {destaque && (
              <span className="inline-flex items-center gap-1 mt-3 text-xs px-2.5 py-1 rounded-full bg-accent-soft text-accent">
                <Sparkles size={11} /> Marco em destaque
              </span>
            )}
          </div>

          {fase && numeroSessao !== null && (
            <div className="rounded-xl p-4 mt-4 bg-primary-soft">
              <p className="text-xs leading-relaxed text-primary-dark">
                Esse será o registro <strong>{numeroSessao}</strong> de <strong>{fase.plannedSessions}</strong> na fase atual.
              </p>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
