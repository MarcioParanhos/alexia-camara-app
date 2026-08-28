"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopiarLink({ url }: { url: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    await navigator.clipboard.writeText(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1500);
  }

  return (
    <button
      onClick={copiar}
      className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md shrink-0"
      style={{ background: copiado ? "#3F6B58" : "#DCE5DA", color: copiado ? "#fff" : "#2C4B3E" }}
    >
      {copiado ? <Check size={12} /> : <Copy size={12} />} {copiado ? "Copiado" : "Copiar"}
    </button>
  );
}