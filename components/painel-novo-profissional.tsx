"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, UserCog, Copy, Check, X } from "lucide-react";

export function PainelNovoProfissional() {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [urlGerada, setUrlGerada] = useState<string | null>(null);

  async function enviarConvite(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (!nome.trim() || !email.trim()) {
      setErro("Preencha nome e e-mail.");
      return;
    }

    setEnviando(true);
    try {
      const resp = await fetch("/api/admin/professionals/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nome, email }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || "Não foi possível criar o convite.");

      setUrlGerada(data.inviteUrl);
      router.refresh();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setEnviando(false);
    }
  }

  async function copiar() {
    if (!urlGerada) return;
    await navigator.clipboard.writeText(urlGerada);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1500);
  }

  function fechar() {
    setAberto(false);
    setNome("");
    setEmail("");
    setUrlGerada(null);
    setErro(null);
  }

  if (!aberto) {
    return (
      <button
        onClick={() => setAberto(true)}
        className="flex items-center justify-center gap-1.5 text-sm px-4 py-2.5 rounded-lg font-medium text-white shrink-0 bg-primary"
      >
        <Plus size={15} /> Novo profissional
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0"
        style={{ background: "rgba(34, 41, 31, 0.35)", backdropFilter: "blur(2px)" }}
        onClick={fechar}
      />

      <div className="relative w-full max-w-sm rounded-2xl bg-white border border-line shadow-xl p-6 sm:p-7">
        <button onClick={fechar} className="absolute right-4 top-4 text-inkFaint hover:text-ink">
          <X size={16} />
        </button>

        <span className="w-11 h-11 rounded-full flex items-center justify-center mb-4" style={{ background: "#DCE5DA" }}>
          <UserCog size={19} color="#2C4B3E" strokeWidth={2.25} />
        </span>

        <h3 className="text-lg font-display font-semibold text-ink mb-1.5">Convidar profissional</h3>
        <p className="text-sm text-inkFaint mb-5">
          Envie um link para a pessoa concluir o próprio cadastro e definir sua senha.
        </p>

        {!urlGerada ? (
          <form onSubmit={enviarConvite}>
            <label className="text-xs mb-1.5 block text-inkSoft">Nome</label>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome completo"
              className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none bg-surface border border-line mb-3.5"
            />
            <label className="text-xs mb-1.5 block text-inkSoft">E-mail</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="profissional@exemplo.com"
              className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none bg-surface border border-line mb-2"
            />

            {erro && <p className="text-xs mt-2 mb-1 text-attention">{erro}</p>}

            <button
              type="submit"
              disabled={enviando}
              className="w-full mt-4 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium text-white bg-primary disabled:opacity-60"
            >
              {enviando ? "Gerando..." : "Gerar convite"}
            </button>
          </form>
        ) : (
          <div>
            <div className="rounded-lg p-3 mb-4 bg-surface border border-line">
              <p className="text-xs text-inkFaint mb-1.5">
                Convite criado. Copie e envie este link para o profissional:
              </p>
              <p className="text-xs font-mono break-all text-ink">{urlGerada}</p>
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
                onClick={fechar}
                className="text-sm px-4 py-2.5 rounded-lg font-medium border border-line text-inkSoft"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}