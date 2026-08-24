"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Target, Check } from "lucide-react";

const CORES_FASE = ["#3F6B58", "#B9812F", "#6B5B95", "#A94A3D", "#3F7C8C"];

type Fase = { nome: string; objetivo: string; sessoes: number };

export default function NovoPacientePage() {
  const router = useRouter();
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [nome, setNome] = useState("");
  const [nascimento, setNascimento] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [diagnostico, setDiagnostico] = useState("");
  const [encaminhadoPor, setEncaminhadoPor] = useState("");
  const [historico, setHistorico] = useState("");
  const [fases, setFases] = useState<Fase[]>([
    { nome: "", objetivo: "", sessoes: 6 },
  ]);

  function addFase() {
    setFases([...fases, { nome: "", objetivo: "", sessoes: 4 }]);
  }
  function removeFase(i: number) {
    setFases(fases.filter((_, idx) => idx !== i));
  }
  function updateFase(i: number, campo: keyof Fase, valor: string | number) {
    setFases(fases.map((f, idx) => (idx === i ? { ...f, [campo]: valor } : f)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (!nome.trim()) {
      setErro("Informe o nome do paciente.");
      return;
    }

    setSalvando(true);
    try {
      const resp = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nome,
          birthDate: nascimento || undefined,
          phone: telefone || undefined,
          email: email || undefined,
          diagnosis: diagnostico || undefined,
          referredBy: encaminhadoPor || undefined,
          clinicalHistory: historico || undefined,
          phases: fases
            .filter((f) => f.nome.trim())
            .map((f) => ({ name: f.nome, objective: f.objetivo || undefined, plannedSessions: Number(f.sessoes) || 1 })),
        }),
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        const msg =
          typeof data?.error === "string"
            ? data.error
            : data?.error?.fieldErrors
            ? Object.values(data.error.fieldErrors).flat()[0]
            : "Não foi possível salvar o paciente.";
        throw new Error((msg as string) || "Não foi possível salvar o paciente.");
      }

      const { patient } = await resp.json();
      router.push(`/dashboard/pacientes/${patient.id}`);
      router.refresh();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setSalvando(false);
    }
  }

  const totalSessoes = fases.reduce((s, f) => s + (Number(f.sessoes) || 0), 0);

  return (
    <div className="min-h-screen p-5 sm:p-8 bg-bg">
      <p className="text-xs uppercase tracking-[0.18em] mb-1 text-inkFaint">Novo paciente</p>
      <h2 className="text-xl sm:text-2xl font-display font-semibold text-ink mb-6">Cadastro</h2>

      <form onSubmit={handleSubmit} className="rounded-xl p-5 sm:p-7 bg-white border border-line space-y-8 w-full h-full">
        {/* Dados pessoais */}
        <div>
          <h3 className="text-lg font-display font-semibold text-ink mb-4">Dados pessoais</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs mb-1.5 block text-inkSoft">Nome completo *</label>
              <input value={nome} onChange={(e) => setNome(e.target.value)} required className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none bg-surface border border-line" />
            </div>
            <div>
              <label className="text-xs mb-1.5 block text-inkSoft">Data de nascimento</label>
              <input type="date" value={nascimento} onChange={(e) => setNascimento(e.target.value)} className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none bg-surface border border-line" />
            </div>
            <div>
              <label className="text-xs mb-1.5 block text-inkSoft">Telefone</label>
              <input value={telefone} onChange={(e) => setTelefone(e.target.value)} className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none bg-surface border border-line" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs mb-1.5 block text-inkSoft">E-mail</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none bg-surface border border-line" />
            </div>
          </div>
        </div>

        {/* Histórico clínico */}
        <div>
          <h3 className="text-lg font-display font-semibold text-ink mb-4">Histórico clínico</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs mb-1.5 block text-inkSoft">Diagnóstico principal</label>
              <input value={diagnostico} onChange={(e) => setDiagnostico(e.target.value)} className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none bg-surface border border-line" />
            </div>
            <div>
              <label className="text-xs mb-1.5 block text-inkSoft">Encaminhado por</label>
              <input value={encaminhadoPor} onChange={(e) => setEncaminhadoPor(e.target.value)} className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none bg-surface border border-line" />
            </div>
          </div>
          <label className="text-xs mb-1.5 block text-inkSoft">Histórico e observações iniciais</label>
          <textarea rows={4} value={historico} onChange={(e) => setHistorico(e.target.value)} className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none resize-none bg-surface border border-line" />
        </div>

        {/* Fases da trilha */}
        <div>
          <h3 className="text-lg font-display font-semibold text-ink mb-1.5">Fases da trilha de tratamento</h3>
          <p className="text-sm text-inkSoft mb-4">Divida o tratamento em fases. Cada fase vira um trecho da trilha de evolução deste paciente.</p>

          <div className="space-y-3 mb-3">
            {fases.map((f, i) => (
              <div key={i} className="rounded-xl p-4 flex flex-col sm:flex-row gap-3 bg-surface border border-line">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs text-white shrink-0 font-mono" style={{ background: CORES_FASE[i % CORES_FASE.length] }}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <input
                    value={f.nome}
                    onChange={(e) => updateFase(i, "nome", e.target.value)}
                    placeholder="Nome da fase"
                    className="w-full bg-transparent outline-none text-sm font-medium mb-1.5"
                  />
                  <input
                    value={f.objetivo}
                    onChange={(e) => updateFase(i, "objetivo", e.target.value)}
                    placeholder="Objetivo desta fase"
                    className="w-full bg-transparent outline-none text-xs text-inkFaint"
                  />
                </div>
                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <Target size={12} className="text-inkFaint" />
                    <input
                      type="number"
                      min={1}
                      value={f.sessoes}
                      onChange={(e) => updateFase(i, "sessoes", Number(e.target.value))}
                      className="w-12 bg-transparent outline-none text-sm text-right font-mono"
                    />
                    <span className="text-[10px] text-inkFaint">sessões</span>
                  </div>
                  <button type="button" onClick={() => removeFase(i)}>
                    <Trash2 size={13} className="text-inkFaint" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button type="button" onClick={addFase} className="flex items-center gap-1.5 text-sm px-3.5 py-2 rounded-lg text-primary bg-primary-soft">
            <Plus size={14} /> Adicionar fase
          </button>

          {totalSessoes > 0 && (
            <p className="text-xs mt-3 text-inkFaint">
              Total previsto: <span className="font-mono text-ink">{totalSessoes} sessões</span>
            </p>
          )}
        </div>

        {erro && <p className="text-sm text-attention">{erro}</p>}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
          <button
            type="submit"
            disabled={salvando}
            className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white bg-primary disabled:opacity-60"
          >
            <Check size={15} /> {salvando ? "Salvando..." : "Concluir cadastro"}
          </button>
        </div>
      </form>
    </div>
  );
}
