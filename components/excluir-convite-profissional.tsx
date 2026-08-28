"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, X, Loader2 } from "lucide-react";

export function ExcluirConviteProfissional({ id, nome }: { id: string; nome: string }) {
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  async function excluir() {
    setExcluindo(true);
    try {
      const resp = await fetch(`/api/admin/professionals/invite/${id}`, { method: "DELETE" });
      if (!resp.ok) throw new Error();
      router.refresh();
    } finally {
      setExcluindo(false);
      setConfirmando(false);
    }
  }

  if (confirmando) {
    return (
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-[11px] text-inkFaint hidden sm:inline">Excluir convite de {nome.split(" ")[0]}?</span>
        <button
          onClick={excluir}
          disabled={excluindo}
          className="text-xs px-2.5 py-1.5 rounded-md font-medium text-white disabled:opacity-60"
          style={{ background: "#B8452F" }}
        >
          {excluindo ? <Loader2 size={12} className="animate-spin" /> : "Confirmar"}
        </button>
        <button
          onClick={() => setConfirmando(false)}
          disabled={excluindo}
          className="p-1.5 rounded-md text-inkFaint hover:bg-surface"
        >
          <X size={13} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirmando(true)}
      className="p-1.5 rounded-md text-inkFaint hover:bg-surface shrink-0"
      title="Excluir convite"
    >
      <Trash2 size={14} />
    </button>
  );
}