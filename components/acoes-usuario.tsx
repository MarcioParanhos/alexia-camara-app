"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVertical, KeyRound, Copy, Check, Loader2, X } from "lucide-react";

export function AcoesUsuario({ id, nome }: { id: string; nome: string }) {
  const [menuAberto, setMenuAberto] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [linkGerado, setLinkGerado] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuAberto(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function gerarLinkReset() {
    setMenuAberto(false);
    setModalAberto(true);
    setGerando(true);
    setErro(null);
    setLinkGerado(null);
    try {
      const resp = await fetch(`/api/admin/users/${id}/reset-password`, { method: "POST" });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || "Não foi possível gerar o link.");
      setLinkGerado(data.url);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setGerando(false);
    }
  }

  async function copiar() {
    if (!linkGerado) return;
    await navigator.clipboard.writeText(linkGerado);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1500);
  }

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuAberto((v) => !v)}
          className="w-7 h-7 rounded-md flex items-center justify-center text-inkFaint hover:bg-surface"
          aria-haspopup="menu"
          aria-expanded={menuAberto}
          title="Ações"
        >
          <MoreVertical size={15} />
        </button>

        {menuAberto && (
          <div
            role="menu"
            className="absolute right-0 mt-1 w-56 rounded-lg bg-white border border-line shadow-lg z-30 overflow-hidden origin-top-right"
          >
            <ul className="py-1">
              <li>
                <button
                  onClick={gerarLinkReset}
                  className="w-full text-left px-3.5 py-2.5 text-sm text-ink hover:bg-surface flex items-center gap-2.5"
                >
                  <KeyRound size={14} color="#5B6157" /> Gerar link de redefinição
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>

      {modalAberto && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0"
            style={{ background: "rgba(34, 41, 31, 0.35)", backdropFilter: "blur(2px)" }}
            onClick={() => setModalAberto(false)}
          />

          <div className="relative w-full max-w-sm rounded-2xl bg-white border border-line shadow-xl p-6 sm:p-7">
            <button
              onClick={() => setModalAberto(false)}
              className="absolute right-4 top-4 text-inkFaint hover:text-ink"
            >
              <X size={16} />
            </button>

            <span className="w-11 h-11 rounded-full flex items-center justify-center mb-4" style={{ background: "#DCE5DA" }}>
              <KeyRound size={19} color="#2C4B3E" strokeWidth={2.25} />
            </span>

            <h3 className="text-lg font-display font-semibold text-ink mb-1.5">Redefinir senha</h3>
            <p className="text-sm text-inkFaint mb-5">
              Link de redefinição para <strong className="text-ink">{nome}</strong>. Expira em 2 horas.
            </p>

            {gerando && (
              <div className="flex items-center gap-2 text-sm text-inkFaint py-2">
                <Loader2 size={15} className="animate-spin" /> Gerando link...
              </div>
            )}

            {erro && <p className="text-xs text-attention">{erro}</p>}

            {linkGerado && (
              <div>
                <div className="rounded-lg p-3 mb-4 bg-surface border border-line">
                  <p className="text-xs font-mono break-all text-ink">{linkGerado}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={copiar}
                    className="flex-1 flex items-center justify-center gap-1.5 text-sm px-4 py-2.5 rounded-lg font-medium"
                    style={{ background: copiado ? "#3F6B58" : "#DCE5DA", color: copiado ? "#fff" : "#2C4B3E" }}
                  >
                    {copiado ? <Check size={14} /> : <Copy size={14} />} {copiado ? "Copiado" : "Copiar link"}
                  </button>
                  <button
                    onClick={() => setModalAberto(false)}
                    className="text-sm px-4 py-2.5 rounded-lg font-medium border border-line text-inkSoft"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}