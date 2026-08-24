"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Mail, Lock, LogIn, Footprints, ShieldCheck, Activity, Users } from "lucide-react";
import { C } from "@/lib/design-tokens";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    const resultado = await signIn("credentials", {
      email,
      password: senha,
      redirect: false,
    });

    setCarregando(false);

    if (resultado?.error) {
      setErro("E-mail ou senha inválidos.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6" style={{ background: C.surface }}>
      <div
        className="grid md:grid-cols-2 md:min-h-[640px] w-full max-w-4xl rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 20px 60px -20px rgba(34,41,31,0.35)" }}
      >
        <div
          className="relative flex flex-col justify-between gap-8 p-7 sm:p-10 md:p-12"
          style={{ background: `linear-gradient(160deg, ${C.primaryDark}, ${C.primary})` }}
        >
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <Footprints size={16} />
              <span>prontuário &amp; acompanhamento</span>
            </div>
          </div>
          <div className="relative z-10">
            <h1 className="text-white text-4xl sm:text-5xl md:text-6xl leading-[0.95] font-display italic font-medium">
              Alexia
              <br />
              Câmara
            </h1>
            <p className="text-white/75 mt-5 max-w-xs text-[15px] leading-relaxed">
              Cada sessão é um passo. Aqui você acompanha a trilha de recuperação de cada paciente, do primeiro atendimento à alta.
            </p>
          </div>
          <div className="relative z-10 text-white/50 text-xs">Fisioterapia • ♥</div>
        </div>

        <div className="flex flex-col justify-center px-7 sm:px-10 md:px-14 py-10 md:py-12 bg-white">
          <p className="text-xs uppercase tracking-[0.18em] mb-2 text-inkFaint">Entrar</p>
          <h2 className="text-2xl mb-8 font-display font-semibold text-ink">Acesse sua conta</h2>

          <form onSubmit={handleSubmit}>
            <label className="text-xs mb-1.5 block text-inkSoft">E-mail</label>
            <div className="flex items-center gap-2 rounded-lg px-3.5 py-3 mb-4 bg-surface border border-line">
              <Mail size={16} color={C.inkFaint} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@exemplo.com"
                className="bg-transparent outline-none w-full text-sm"
              />
            </div>

            <label className="text-xs mb-1.5 block text-inkSoft">Senha</label>
            <div className="flex items-center gap-2 rounded-lg px-3.5 py-3 mb-2 bg-surface border border-line">
              <Lock size={16} color={C.inkFaint} />
              <input
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="bg-transparent outline-none w-full text-sm"
              />
            </div>

            {erro && <p className="text-xs mb-4" style={{ color: C.attention }}>{erro}</p>}

            <button
              type="submit"
              disabled={carregando}
              className="flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60 w-full mt-4"
              style={{ background: C.primary }}
            >
              <LogIn size={16} /> {carregando ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="flex items-center gap-4 flex-wrap mt-8 pt-6 border-t border-line">
            {[
              { icon: ShieldCheck, label: "Administrador" },
              { icon: Activity, label: "Fisioterapeuta" },
              { icon: Users, label: "Família" },
            ].map((r, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-inkFaint">
                <r.icon size={13} /> {r.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
