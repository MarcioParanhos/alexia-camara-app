"use client";

import { useState } from "react";
import { FileText, ChevronDown } from "lucide-react";

export function HistoricoClinico({
  historico,
  abertoPorPadrao = false,
}: {
  historico: string | null;
  abertoPorPadrao?: boolean;
}) {
  const [aberto, setAberto] = useState(abertoPorPadrao);

  if (!historico) return null;

  return (
    <div className="rounded-xl mb-6 bg-white border border-line overflow-hidden">
      <button
        onClick={() => setAberto((v) => !v)}
        className="w-full flex items-center justify-between gap-2 p-4 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-ink">
          <FileText size={14} className="text-inkFaint" />
          Histórico clínico e observações iniciais
        </span>
        <ChevronDown
          size={15}
          className="text-inkFaint transition-transform shrink-0"
          style={{ transform: aberto ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {aberto && (
        <div className="px-4 pb-4 pt-0 border-t border-line">
          <p className="text-sm leading-relaxed whitespace-pre-line text-inkSoft pt-3.5">
            {historico}
          </p>
        </div>
      )}
    </div>
  );
}