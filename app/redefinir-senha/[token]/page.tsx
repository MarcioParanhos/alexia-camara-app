"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Lock, Loader2, CheckCircle2, KeyRound } from "lucide-react";
import { C } from "@/lib/design-tokens";

export default function RedefinirSenhaPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();

  const [carregando, setCarregando] = useState(true);
  const [invalido, setInvalido] = useState(false);
  const [nome, setNome] = useState("");

  const [senha, setSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [concluido, setConcluido] = useState(false);

  useEffect(() => {
    fetch(`/api/redefinir-senha/${token}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => setNome(data.name))
      .catch(() => setInvalido(true))
      .finally(() => setCarregando(false));
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (senha.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (senha !== confirmSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setEnviando(true);
    try {
      const resp = await fetch(`/api/redefinir-senha/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: senha }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || "Não foi possível redefinir a senha.");
      setConcluido(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setEnviando(false);
    }
  }

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.surface }}>
        <Loader2 size={22} className="animate-spin text-primary" />
      </div>
    );
  }

  if (invalido) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: C.surface }}>
        <div className="max-w-sm w-full rounded-2xl bg-white border border-line p-7 text-center">
          <p className="text-sm text-inkFaint">
            Este link não é mais válido. Peça ao administrador para gerar um novo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: C.surface }}>
      <div
        className="max-w-sm w-full rounded-2xl bg-white border border-line p-7 sm:p-8"
        style={{ boxShadow: "0 20px 60px -20px rgba(34,41,31,0.25)" }}
      >
        {concluido ? (
          <div className="text-center py-6">
            <CheckCircle2 size={32} className="mx-auto mb-3 text-primary" />
            <p className="text-sm text-ink font-medium mb-1">Senha redefinida!</p>
            <p className="text-xs text-inkFaint">Redirecionando para o login...</p>
          </div>
        ) : (
          <>
            <span className="w-11 h-11 rounded-full flex items-center justify-center mb-4" style={{ background: "#DCE5DA" }}>
              <KeyRound size={19} color="#2C4B3E" strokeWidth={2.25} />
            </span>
            <p className="text-xs uppercase tracking-[0.18em] mb-1 text-inkFaint">Redefinir senha</p>
            <h2 className="text-xl font-display font-semibold text-ink mb-6">Olá, {nome.split(" ")[0]}</h2>

            <form onSubmit={handleSubmit}>
              <label className="text-xs mb-1.5 block text-inkSoft">Nova senha</label>
              <div className="flex items-center gap-2 rounded-lg px-3.5 py-2.5 mb-4 bg-surface border border-line focus-within:border-primary transition-colors">
                <Lock size={15} className="text-inkFaint shrink-0" />
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="bg-transparent outline-none w-full text-sm"
                />
              </div>

              <label className="text-xs mb-1.5 block text-inkSoft">Confirme a nova senha</label>
              <div className="flex items-center gap-2 rounded-lg px-3.5 py-2.5 mb-2 bg-surface border border-line focus-within:border-primary transition-colors">
                <Lock size={15} className="text-inkFaint shrink-0" />
                <input
                  type="password"
                  value={confirmSenha}
                  onChange={(e) => setConfirmSenha(e.target.value)}
                  placeholder="••••••••"
                  className="bg-transparent outline-none w-full text-sm"
                />
              </div>

              {erro && <p className="text-xs mt-2 mb-3 text-attention">{erro}</p>}

              <button
                type="submit"
                disabled={enviando}
                className="w-full mt-4 rounded-lg py-2.5 text-sm font-medium text-white bg-primary disabled:opacity-60"
              >
                {enviando ? "Salvando..." : "Redefinir senha"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}