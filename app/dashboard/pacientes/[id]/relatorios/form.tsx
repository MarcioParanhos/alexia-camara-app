"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

function seiMesesAtras() {
  const d = new Date();
  d.setMonth(d.getMonth() - 6);
  return d.toISOString().slice(0, 10);
}
function hoje() {
  return new Date().toISOString().slice(0, 10);
}

export function GerarRelatorioForm({ patientId }: { patientId: string }) {
  const router = useRouter();
  const [periodStart, setPeriodStart] = useState(seiMesesAtras());
  const [periodEnd, setPeriodEnd] = useState(hoje());
  const [parecer, setParecer] = useState("");
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (!parecer.trim()) {
      setErro("Escreva o parecer clínico que vai constar no relatório.");
      return;
    }

    setGerando(true);
    try {
      const resp = await fetch(`/api/patients/${patientId}/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ periodStart, periodEnd, parecer }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error("Não foi possível gerar o relatório.");

      router.push(`/dashboard/pacientes/${patientId}/relatorios/${data.report.id}`);
      router.refresh();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setGerando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl p-5 sm:p-6 h-fit bg-white border border-line">
      <h3 className="text-sm font-display font-semibold text-ink mb-1">Gerar novo relatório</h3>
      <p className="text-xs text-inkSoft mb-5">
        Consolida os registros de evolução do período escolhido, com a marca do seu perfil.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-xs mb-1.5 block text-inkSoft">De</label>
          <input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm outline-none bg-surface border border-line" />
        </div>
        <div>
          <label className="text-xs mb-1.5 block text-inkSoft">Até</label>
          <input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm outline-none bg-surface border border-line" />
        </div>
      </div>

      <label className="text-xs mb-1.5 block text-inkSoft">Parecer clínico</label>
      <textarea
        rows={5}
        value={parecer}
        onChange={(e) => setParecer(e.target.value)}
        placeholder="Resumo da evolução no período, recomendações e próximos passos..."
        className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none resize-none mb-4 bg-surface border border-line"
      />

      {erro && <p className="text-xs mb-3 text-attention">{erro}</p>}

      <button
        type="submit"
        disabled={gerando}
        className="w-full flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium text-white bg-primary disabled:opacity-60"
      >
        <Sparkles size={14} /> {gerando ? "Gerando..." : "Gerar relatório"}
      </button>
    </form>
  );
}
