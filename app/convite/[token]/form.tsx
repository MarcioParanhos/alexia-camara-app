"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Lock, Footprints } from "lucide-react";
import { C } from "@/lib/design-tokens";

export function AceitarConviteForm({
  token,
  nomeFamiliar,
  email,
  nomePaciente,
  parentesco,
}: {
  token: string;
  nomeFamiliar: string;
  email: string;
  nomePaciente: string;
  parentesco: string;
}) {
  const router = useRouter();
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (senha.length < 6) {
      setErro("A senha precisa ter ao menos 6 caracteres.");
      return;
    }
    if (senha !== confirmar) {
      setErro("As senhas não coincidem.");
      return;
    }

    setCarregando(true);
    try {
      const resp = await fetch(`/api/convite/${token}/aceitar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: senha }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || "Não foi possível ativar o acesso.");

      // já loga automaticamente
      await signIn("credentials", { email, password: senha, redirect: false });
      router.push("/portal");
      router.refresh();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6" style={{ background: C.surface }}>
      <div className="w-full max-w-sm rounded-2xl p-8 bg-white" style={{ boxShadow: "0 20px 60px -20px rgba(34,41,31,0.35)" }}>
        <div className="flex items-center gap-2 text-xs mb-6 text-inkFaint">
          <Footprints size={14} /> prontuário &amp; acompanhamento
        </div>
        <h1 className="text-xl font-display font-semibold text-ink mb-1">Olá, {nomeFamiliar.split(" ")[0]}</h1>
        <p className="text-sm mb-6 text-inkSoft">
          Você foi convidado(a) como <strong>{parentesco.toLowerCase()}</strong> para acompanhar a trilha de{" "}
          <strong>{nomePaciente}</strong>. Crie uma senha para acessar.
        </p>

        <form onSubmit={handleSubmit}>
          <label className="text-xs mb-1.5 block text-inkSoft">Criar senha</label>
          <div className="flex items-center gap-2 rounded-lg px-3.5 py-3 mb-4 bg-surface border border-line">
            <Lock size={16} className="text-inkFaint" />
            <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} className="bg-transparent outline-none w-full text-sm" />
          </div>
          <label className="text-xs mb-1.5 block text-inkSoft">Confirmar senha</label>
          <div className="flex items-center gap-2 rounded-lg px-3.5 py-3 mb-4 bg-surface border border-line">
            <Lock size={16} className="text-inkFaint" />
            <input type="password" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} className="bg-transparent outline-none w-full text-sm" />
          </div>

          {erro && <p className="text-xs mb-4 text-attention">{erro}</p>}

          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-lg py-3 text-sm font-medium text-white bg-primary disabled:opacity-60"
          >
            {carregando ? "Ativando..." : "Ativar acesso"}
          </button>
        </form>
      </div>
    </div>
  );
}
