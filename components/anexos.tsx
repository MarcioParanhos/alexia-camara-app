"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, FileText, Trash2, Loader2, Paperclip } from "lucide-react";

export type AnexoResumo = {
  id: string;
  fileName: string;
  fileType: string | null;
  uploadedAt: string | Date;
};

export function PainelAnexos({
  patientId,
  evolutionId,
  initialAnexos,
  compact = false,
}: {
  patientId: string;
  evolutionId?: string;
  initialAnexos: AnexoResumo[];
  compact?: boolean;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [anexos, setAnexos] = useState<AnexoResumo[]>(initialAnexos);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function enviarArquivos(files: FileList | null) {
    if (!files || files.length === 0) return;
    setErro(null);
    setEnviando(true);

    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append("file", f));
    if (evolutionId) formData.append("evolutionId", evolutionId);

    try {
      const resp = await fetch(`/api/patients/${patientId}/attachments`, {
        method: "POST",
        body: formData,
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(typeof data?.error === "string" ? data.error : "Não foi possível enviar o(s) arquivo(s).");

      setAnexos((prev) => [...data.attachments, ...prev]);
      router.refresh();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro inesperado ao enviar.");
    } finally {
      setEnviando(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remover(id: string) {
    setAnexos((prev) => prev.filter((a) => a.id !== id));
    await fetch(`/api/patients/${patientId}/attachments/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => enviarArquivos(e.target.files)}
        accept="image/*,.pdf,.doc,.docx"
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={enviando}
        className={`w-full flex flex-col items-center gap-2 text-center rounded-lg border border-dashed border-line bg-surface disabled:opacity-60 ${
          compact ? "p-3" : "p-5"
        }`}
      >
        {enviando ? (
          <Loader2 size={compact ? 15 : 18} className="animate-spin text-inkFaint" />
        ) : (
          <ImagePlus size={compact ? 15 : 18} className="text-inkFaint" />
        )}
        <span className="text-xs text-inkFaint">
          {enviando ? "Enviando..." : "Clique para escolher fotos, PDFs ou documentos"}
        </span>
      </button>

      {erro && <p className="text-xs mt-2 text-attention">{erro}</p>}

      {anexos.length > 0 && (
        <div className={`mt-3 grid gap-2 ${compact ? "grid-cols-1" : "sm:grid-cols-2"}`}>
          {anexos.map((a) => (
            <div key={a.id} className="flex items-center gap-2.5 rounded-lg p-2.5 bg-white border border-line">
              <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 bg-surface">
                {a.fileType?.startsWith("image/") ? <ImagePlus size={14} className="text-inkSoft" /> : <FileText size={14} className="text-inkSoft" />}
              </div>
              <a
                href={`/api/files/${a.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-0 text-xs text-ink truncate hover:underline"
                title={a.fileName}
              >
                {a.fileName}
              </a>
              <button type="button" onClick={() => remover(a.id)} className="shrink-0">
                <Trash2 size={13} className="text-inkFaint" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ResumoAnexos({ quantidade }: { quantidade: number }) {
  if (quantidade === 0) return null;
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-inkFaint">
      <Paperclip size={11} /> {quantidade} anexo{quantidade === 1 ? "" : "s"}
    </span>
  );
}

/** Toggle compacto usado dentro de cada card de evolução */
export function AnexosEvolucaoToggle({
  patientId,
  evolutionId,
  initialAnexos,
}: {
  patientId: string;
  evolutionId: string;
  initialAnexos: AnexoResumo[];
}) {
  const [aberto, setAberto] = useState(initialAnexos.length > 0);

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setAberto(!aberto)}
        className="flex items-center gap-1.5 text-[11px] text-inkFaint"
      >
        <Paperclip size={11} />
        {initialAnexos.length > 0 ? `${initialAnexos.length} anexo${initialAnexos.length === 1 ? "" : "s"}` : "Anexar arquivo"}
      </button>
      {aberto && (
        <div className="mt-2">
          <PainelAnexos patientId={patientId} evolutionId={evolutionId} initialAnexos={initialAnexos} compact />
        </div>
      )}
    </div>
  );
}
