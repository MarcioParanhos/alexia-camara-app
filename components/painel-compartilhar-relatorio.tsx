"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link2, Copy, Check, Clock, ShieldCheck, RefreshCw } from "lucide-react";

type LinkAtivo = { id: string; token: string; expiresAt: string | Date };

const DURACOES = [
  { dias: 3, label: "3 dias" },
  { dias: 7, label: "7 dias" },
  { dias: 14, label: "14 dias" },
  { dias: 30, label: "30 dias" },
];

export function PainelCompartilharRelatorio({
  patientId,
  reportId,
  linkInicial,
}: {
  patientId: string;
  reportId: string;
  linkInicial: LinkAtivo | null;
}) {
  const router = useRouter();
  const [dias, setDias] = useState(7);
  const [diasCustom, setDiasCustom] = useState("");
  const [gerando, setGerando] = useState(false);
  const [link, setLink] = useState<LinkAtivo | null>(linkInicial);
  const [copiado, setCopiado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const appUrl = typeof window !== "undefined" ? window.location.origin : "";
  const duracaoEfetiva = diasCustom ? Number(diasCustom) : dias;

  async function gerarLink() {
    setErro(null);
    if (!duracaoEfetiva || duracaoEfetiva < 1) {
      setErro("Escolha por quantos dias o link fica disponível.");
      return;
    }

    setGerando(true);
    try {
      const resp = await fetch(`/api/patients/${patientId}/reports/${reportId}/access-links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days: duracaoEfetiva }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error("Não foi possível gerar o link.");

      setLink(data.accessLink);
      router.refresh();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setGerando(false);
    }
  }

  async function revogarLink() {
    if (!link) return;
    await fetch(`/api/patients/${patientId}/access-links/${link.id}`, { method: "DELETE" });
    setLink(null);
    router.refresh();
  }

  async function copiarLink() {
    if (!link) return;
    await navigator.clipboard.writeText(`${appUrl}/acesso/${link.token}`);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1500);
  }

  return (
    <div className="rounded-xl p-5 sm:p-6 mb-6 bg-white border border-line">
      <h3 className="text-sm font-display font-semibold text-ink mb-1 flex items-center gap-1.5">
        <Link2 size={14} /> Compartilhar este relatório
      </h3>
      <p className="text-xs text-inkSoft mb-4">
        Gere um link somente-leitura deste relatório para enviar a familiares sem cadastro no sistema. Escolha por quanto
        tempo ele fica disponível.
      </p>

      {link ? (
        <div>
          <div className="flex items-center gap-2 rounded-lg p-3 mb-3 bg-surface border border-line">
            <Link2 size={14} className="text-primary shrink-0" />
            <span className="text-xs flex-1 truncate font-mono text-ink">{`${appUrl}/acesso/${link.token}`}</span>
            <button
              onClick={copiarLink}
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md shrink-0"
              style={{ background: copiado ? "#3F6B58" : "#DCE5DA", color: copiado ? "#fff" : "#2C4B3E" }}
            >
              {copiado ? <Check size={12} /> : <Copy size={12} />} {copiado ? "Copiado" : "Copiar"}
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-inkFaint">
            <span className="flex items-center gap-1">
              <Clock size={12} /> Expira em {formatarData(link.expiresAt)}
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck size={12} /> Somente leitura, sem precisar de conta
            </span>
            <button onClick={revogarLink} className="flex items-center gap-1 text-attention">
              <RefreshCw size={12} /> Revogar acesso
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-xs mb-2 text-inkSoft">Disponível por:</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {DURACOES.map((d) => (
              <button
                key={d.dias}
                type="button"
                onClick={() => {
                  setDias(d.dias);
                  setDiasCustom("");
                }}
                className="text-xs px-3 py-1.5 rounded-full"
                style={{
                  background: !diasCustom && dias === d.dias ? "#3F6B58" : "#F1ECE1",
                  color: !diasCustom && dias === d.dias ? "#fff" : "#5B6157",
                  border: `1px solid ${!diasCustom && dias === d.dias ? "#3F6B58" : "#DDD5C4"}`,
                }}
              >
                {d.label}
              </button>
            ))}
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min={1}
                max={365}
                placeholder="Outro"
                value={diasCustom}
                onChange={(e) => setDiasCustom(e.target.value)}
                className="w-16 text-xs px-2.5 py-1.5 rounded-full outline-none bg-surface border border-line"
              />
              <span className="text-xs text-inkFaint">dias</span>
            </div>
          </div>

          {erro && <p className="text-xs mb-3 text-attention">{erro}</p>}

          <button
            onClick={gerarLink}
            disabled={gerando}
            className="flex items-center justify-center gap-1.5 text-sm px-4 py-2.5 rounded-lg font-medium text-white w-full sm:w-auto bg-primary disabled:opacity-60"
          >
            <Link2 size={14} /> {gerando ? "Gerando..." : "Gerar link de acesso"}
          </button>
        </div>
      )}
    </div>
  );
}

function formatarData(data: string | Date) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(data));
}
