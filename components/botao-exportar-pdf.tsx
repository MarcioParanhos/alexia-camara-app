"use client";

import { Download } from "lucide-react";
import { useState } from "react";

type Props = {
  reportId?: string;
  fileName?: string;
};

export function BotaoExportarPdf({ reportId, fileName = "relatorio.pdf" }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    if (!reportId) return window.print();
    try {
      setLoading(true);
      const res = await fetch(`/api/reports/${reportId}/export`);
      if (!res.ok) throw new Error("Falha ao gerar PDF");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const win = window.open(url, "_blank");
      if (!win) {
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (e) {
      // fallback: ainda podemos mostrar notificação na UI que chama
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-white border border-line text-primary-dark print:hidden"
    >
      <Download size={13} /> {loading ? "Gerando..." : "Exportar PDF"}
    </button>
  );
}
