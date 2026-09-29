"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, X, AlertTriangle } from "lucide-react";

export function ExcluirPacienteDefinitivo({
  id,
  nome,
}: {
  id: string;
  nome: string;
}) {
  const router = useRouter();
  const [modalAberto, setModalAberto] = useState(false);
  const [confirmacao, setConfirmacao] = useState("");
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const nomeCorreto =
    confirmacao.trim().toLowerCase() === nome.trim().toLowerCase();

  async function excluir() {
    if (!nomeCorreto) return;
    setExcluindo(true);
    setErro(null);
    try {
      const resp = await fetch(`/api/patients/${id}`, { method: "DELETE" });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data?.error || "Não foi possível excluir o paciente.");
      }
      router.refresh();
      fechar();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setExcluindo(false);
    }
  }

  function fechar() {
    setModalAberto(false);
    setConfirmacao("");
    setErro(null);
  }

  return (
    <>
      <button
        onClick={() => setModalAberto(true)}
        className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg font-medium text-white shrink-0"
        style={{ background: "#B8452F" }}
      >
        <Trash2 size={13} /> Excluir
      </button>

      {modalAberto && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0"
            style={{
              background: "rgba(34, 41, 31, 0.35)",
              backdropFilter: "blur(2px)",
            }}
            onClick={() => !excluindo && fechar()}
          />

          <div className="relative w-full max-w-sm rounded-2xl bg-white border border-line shadow-xl p-6 sm:p-7">
            <button
              onClick={fechar}
              disabled={excluindo}
              className="absolute right-4 top-4 text-inkFaint hover:text-ink"
            >
              <X size={16} />
            </button>

            <span
              className="w-11 h-11 rounded-full flex items-center justify-center mb-4"
              style={{ background: "#FBEAE5" }}
            >
              <AlertTriangle size={19} color="#B8452F" strokeWidth={2.25} />
            </span>

            <h3 className="text-lg font-display font-semibold text-ink mb-1.5">
              Excluir definitivamente
            </h3>
            <p className="text-sm text-inkFaint mb-1">
              Isso apaga permanentemente{" "}
              <strong className="text-ink">{nome}</strong> e todos os registros
              vinculados — evoluções, anexos, relatórios e acessos de
              familiares. Esta ação não pode ser desfeita.
            </p>
            <p className="text-sm text-inkFaint mb-4">
              Para confirmar, digite o nome completo do paciente:
            </p>

            <input
              value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)}
              placeholder={nome}
              className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none bg-surface border border-line mb-2"
            />

            {erro && <p className="text-xs text-attention mb-2">{erro}</p>}

            <div className="flex items-center gap-2.5 mt-3">
              <button
                onClick={fechar}
                disabled={excluindo}
                className="flex-1 text-sm font-medium px-4 py-2.5 rounded-lg border border-line text-inkSoft hover:bg-surface disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                onClick={excluir}
                disabled={!nomeCorreto || excluindo}
                className="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-lg text-white disabled:opacity-40"
                style={{ background: "#B8452F" }}
              >
                <Trash2 size={14} />{" "}
                {excluindo ? "Excluindo..." : "Excluir para sempre"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
