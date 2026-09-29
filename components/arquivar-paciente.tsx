"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, X } from "lucide-react";
import { useToast } from "@/components/toast-provider";


export function ArquivarPaciente({ id, nome }: { id: string; nome: string }) {
  const router = useRouter();
  const mostrarToast = useToast();
  const [modalAberto, setModalAberto] = useState(false);
  const [arquivando, setArquivando] = useState(false);

  async function arquivar() {
    setArquivando(true);
    try {
      await fetch(`/api/patients/${id}/archive`, { method: "POST" });
      mostrarToast(`${nome} foi arquivado com sucesso.`, "sucesso");
      router.push("/dashboard");
      router.refresh();
    } finally {
      setArquivando(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setModalAberto(true)}
        className="flex items-center gap-1.5 text-sm px-4 py-2.5 rounded-lg text-inkFaint hover:bg-surface"
      >
        <Archive size={14} /> Arquivar paciente
      </button>

      {modalAberto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0"
            style={{ background: "rgba(34, 41, 31, 0.35)", backdropFilter: "blur(2px)" }}
            onClick={() => !arquivando && setModalAberto(false)}
          />

          <div className="relative w-full max-w-sm rounded-2xl bg-white border border-line shadow-xl p-6 sm:p-7">
            <button
              onClick={() => setModalAberto(false)}
              disabled={arquivando}
              className="absolute right-4 top-4 text-inkFaint hover:text-ink"
            >
              <X size={16} />
            </button>

            <span className="w-11 h-11 rounded-full flex items-center justify-center mb-4" style={{ background: "#F6E7C6" }}>
              <Archive size={19} color="#9A6A1E" strokeWidth={2.25} />
            </span>

            <h3 className="text-lg font-display font-semibold text-ink mb-1.5">Arquivar paciente?</h3>
            <p className="text-sm leading-relaxed text-inkFaint mb-6">
              <strong className="text-ink">{nome}</strong> sairá da lista principal, mas todos os dados continuam salvos e podem ser restaurados a qualquer momento.
            </p>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setModalAberto(false)}
                disabled={arquivando}
                className="flex-1 text-sm font-medium px-4 py-2.5 rounded-lg border border-line text-inkSoft transition-colors hover:bg-surface disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                onClick={arquivar}
                disabled={arquivando}
                className="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-lg text-white transition-colors disabled:opacity-70"
                style={{ background: "#9A6A1E" }}
              >
                <Archive size={14} /> {arquivando ? "Arquivando..." : "Arquivar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}