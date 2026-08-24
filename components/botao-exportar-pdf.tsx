"use client";

import { Download } from "lucide-react";

export function BotaoExportarPdf() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-white border border-line text-primary-dark print:hidden"
    >
      <Download size={13} /> Exportar PDF
    </button>
  );
}
