"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArchiveRestore } from "lucide-react";
import { useToast } from "@/components/toast-provider";

export function DesarquivarPaciente({ id, nome }: { id: string; nome: string }) {
  const router = useRouter();
  const mostrarToast = useToast();
  const [carregando, setCarregando] = useState(false);

  async function desarquivar() {
    setCarregando(true);
    try {
      await fetch(`/api/patients/${id}/archive`, { method: "DELETE" });
      mostrarToast(`${nome} foi restaurado e já aparece na lista principal.`, "sucesso");
      router.refresh();
    } finally {
      setCarregando(false);
    }
  }

  return (
    <button
      onClick={desarquivar}
      disabled={carregando}
      className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg font-medium text-primary bg-primary-soft disabled:opacity-60 shrink-0"
    >
      <ArchiveRestore size={13} /> {carregando ? "Restaurando..." : "Restaurar"}
    </button>
  );
}