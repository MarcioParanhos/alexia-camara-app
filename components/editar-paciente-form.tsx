"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Target, Check } from "lucide-react";

const CORES_FASE = ["#3F6B58", "#B9812F", "#6B5B95", "#A94A3D", "#3F7C8C"];

type Fase = { id?: string; nome: string; objetivo: string; sessoes: number };

type PacienteInicial = {
  id: string;
  name: string;
  birthDate: Date | string | null;
  phone: string | null;
  email: string | null;
  diagnosis: string | null;
  referredBy: string | null;
  clinicalHistory: string | null;
  status: "EM_TRATAMENTO" | "ALTA" | "PAUSADO";
  phases: { id: string; name: string; objective: string | null; plannedSessions: number }[];
};

function paraInputDate(data: Date | string | null) {
  if (!data) return "";
  return new Date(data).toISOString().slice(0, 10);
}

function autoResize(e: React.ChangeEvent<HTMLTextAreaElement>) {
  const el = e.target;
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

export function EditarPacienteForm({ paciente }: { paciente: PacienteInicial }) {
  const router = useRouter();
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  const [nome, setNome] = useState(paciente.name);
  const [nascimento, setNascimento] = useState(paraInputDate(paciente.birthDate));
  const [telefone, setTelefone] = useState(paciente.phone ?? "");
  const [email, setEmail] = useState(paciente.email ?? "");
  const [diagnostico, setDiagnostico] = useState(paciente.diagnosis ?? "");
  const [encaminhadoPor, setEncaminhadoPor] = useState(paciente.referredBy ?? "");
  const [historico, setHistorico] = useState(paciente.clinicalHistory ?? "");
  const [status, setStatus] = useState(paciente.status);
  const [fases, setFases] = useState<Fase[]>(
    paciente.phases.length > 0
      ? paciente.phases.map((f) => ({ id: f.id, nome: f.name, objetivo: f.objective ?? "", sessoes: f.plannedSessions }))
      : [{ nome: "", objetivo: "", sessoes: 6 }],
  );

  const historicoRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const el = historicoRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  }, []);

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
    setSucesso(false);

    if (!nome.trim()) {
      setErro("Informe o nome do paciente.");
      return;
    }

    setSalvando(true);
    try {
      const resp = await fetch(`/api/patients/${paciente.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nome,
          birthDate: nascimento || undefined,
          phone: telefone || undefined,
          email: email || undefined,
          diagnosis: diagnostico || undefined,
          referredBy: encaminhadoPor || undefined,
          clinicalHistory: historico || undefined,
          status,
          phases: fases
            .filter((f) => f.nome.trim())
            .map((f) => ({
              id: f.id,
              name: f.nome,
              objective: f.objetivo || undefined,
              plannedSessions: Number(f.sessoes) || 1,
            })),
        }),
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        const msg =
          typeof data?.error === "string"
            ? data.error
            : data?.error?.fieldErrors
            ? Object.values(data.error.fieldErrors).flat()[0]
            : "Não foi possível salvar as alterações.";
        throw new Error((msg as string) || "Não foi possível salvar as alterações.");
      }

      setSucesso(true);
      router.refresh();
      setTimeout(() => router.push(`/dashboard/pacientes/${paciente.id}`), 900);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setSalvando(false);
    }
  }

  const totalSessoes = fases.reduce((s, f) => s + (Number(f.sessoes) || 0), 0);

  return (
    <div className="min-h-screen p-5 sm:p-8 bg-bg">
      <p className="text-xs uppercase tracking-[0.18em] mb-1 text-inkFaint">Editar paciente</p>
      <h2 className="text-xl sm:text-2xl font-display font-semibold text-ink mb-6">{paciente.name}</h2>

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
            <div>
              <label className="text-xs mb-1.5 block text-inkSoft">Status do tratamento</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as typeof status)}
                className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none bg-surface border border-line"
              >
                <option value="EM_TRATAMENTO">Em tratamento</option>
                <option value="PAUSADO">Pausado</option>
                <option value="ALTA">Alta</option>
              </select>
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
          <textarea
            ref={historicoRef}
            rows={4}
            value={historico}
            onChange={(e) => {
              setHistorico(e.target.value);
              autoResize(e);
            }}
            className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none resize-none bg-surface border border-line overflow-hidden"
          />
        </div>

        {/* Fases da trilha */}
        <div>
          <h3 className="text-lg font-display font-semibold text-ink mb-1.5">Fases da trilha de tratamento</h3>
          <p className="text-sm text-inkSoft mb-4">
            Fases já existentes são atualizadas. Remover uma fase aqui a exclui definitivamente da trilha.
          </p>

          <div className="space-y-3 mb-3">
            {fases.map((f, i) => (
              <div key={f.id ?? `nova-${i}`} className="rounded-xl p-4 flex flex-col sm:flex-row gap-3 bg-surface border border-line">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs text-white shrink-0 font-mono"
                  style={{ background: CORES_FASE[i % CORES_FASE.length] }}
                >
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
        {sucesso && <p className="text-sm text-primary">Alterações salvas!</p>}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
          <button
            type="submit"
            disabled={salvando}
            className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white bg-primary disabled:opacity-60"
          >
            <Check size={15} /> {salvando ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}