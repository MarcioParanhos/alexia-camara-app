"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  LogIn,
  Footprints,
  ShieldCheck,
  Activity,
  Users,
  ClipboardList,
  TrendingUp,
  Sparkles,
  Loader2,
} from "lucide-react";
import { C } from "@/lib/design-tokens";

const ETAPAS = [
  { icon: ClipboardList, cx: 40, cy: 150 },
  { icon: Activity, cx: 120, cy: 90 },
  { icon: TrendingUp, cx: 210, cy: 130 },
  { icon: Sparkles, cx: 280, cy: 55 },
];

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
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6"
      style={{ background: C.surface }}
    >
      <style>{`
        @keyframes trilhaTraco {
          from { stroke-dashoffset: 480; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes trilhaNo {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.12); opacity: 1; }
        }
        .trilha-linha {
          stroke-dasharray: 480;
          animation: trilhaTraco 1.8s cubic-bezier(0.65, 0, 0.35, 1) forwards;
        }
        .trilha-no {
          transform-origin: center;
          transform-box: fill-box;
          opacity: 0;
          animation: trilhaNo 2.6s ease-in-out infinite;
          animation-fill-mode: backwards;
        }
      `}</style>

      <div className="grid md:grid-cols-2 w-full max-w-6xl md:min-h-[620px] rounded-2xl overflow-hidden" style={{ boxShadow: "0 20px 60px -20px rgba(34,41,31,0.35)" }}>
        {/* Painel — trilha de evolução ilustrada */}
        <div className="relative flex items-center flex-col p-6 sm:p-10 md:p-12" style={{background: `linear-gradient(160deg, ${C.primaryDark}, ${C.primary})`,}}>
          <div className="relative z-10 flex items-center gap-2 text-white/80 text-sm">
            <Footprints size={16} />
            <span>prontuário &amp; acompanhamento</span>
          </div>

          {/* bloco principal — agora ocupa o espaço restante e se centraliza nele */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center">
            <h1 className="text-white text-center text-4xl sm:text-5xl md:text-6xl leading-[0.95] font-display italic font-medium mb-6">
              Alexia
              <br />
              Câmara
            </h1>

            {/* trilha ilustrada: avaliação → sessões → evolução → alta */}
            <svg
              aria-hidden
              viewBox="0 0 320 190"
              className="w-full max-w-[280px] h-auto -ml-1 mb-6"
              fill="none"
            >
              <path
                d="M40 150 C 70 150, 90 90, 120 90 S 180 150, 210 130 S 250 60, 280 55"
                stroke="rgba(255,255,255,0.85)"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="trilha-linha"
              />
              {ETAPAS.map((e, i) => (
                <g
                  key={i}
                  className="trilha-no"
                  style={{ animationDelay: `${0.4 + i * 0.15}s` }}
                >
                  <circle
                    cx={e.cx}
                    cy={e.cy}
                    r="15"
                    fill="white"
                    fillOpacity="0.16"
                  />
                  <circle cx={e.cx} cy={e.cy} r="10" fill="white" />
                  <foreignObject
                    x={e.cx - 6}
                    y={e.cy - 6}
                    width="12"
                    height="12"
                  >
                    <e.icon size={12} color={C.primaryDark} strokeWidth={2.5} />
                  </foreignObject>
                </g>
              ))}
            </svg>

            <p className="text-white/75 max-w-xs text-[15px] leading-relaxed">
              Cada sessão é um passo. Aqui você acompanha a trilha de
              recuperação de cada paciente, do primeiro atendimento à alta.
            </p>
          </div>

          <div className="relative z-10 text-white/50 text-xs">
            Fisioterapia • ♥
          </div>
        </div>

        {/* Formulário */}
        <div className="flex flex-col justify-center px-6 sm:px-10 md:px-14 py-9 md:py-12 bg-white">
          <p className="text-xs uppercase tracking-[0.18em] mb-2 text-inkFaint">
            Entrar
          </p>
          <h2 className="text-2xl mb-8 font-display font-semibold text-ink">
            Acesse sua conta
          </h2>

          <form onSubmit={handleSubmit}>
            <label
              htmlFor="email"
              className="text-xs mb-1.5 block text-inkSoft"
            >
              E-mail
            </label>
            <div className="flex items-center gap-2 rounded-lg px-3.5 py-3 mb-4 bg-surface border border-line transition-colors focus-within:border-primary">
              <Mail size={16} color={C.inkFaint} className="shrink-0" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@exemplo.com"
                className="bg-transparent outline-none w-full text-sm"
              />
            </div>

            <label
              htmlFor="senha"
              className="text-xs mb-1.5 block text-inkSoft"
            >
              Senha
            </label>
            <div className="flex items-center gap-2 rounded-lg px-3.5 py-3 mb-2 bg-surface border border-line transition-colors focus-within:border-primary">
              <Lock size={16} color={C.inkFaint} className="shrink-0" />
              <input
                id="senha"
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="bg-transparent outline-none w-full text-sm"
              />
            </div>

            {erro && (
              <div
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 mt-3 text-xs"
                style={{ background: "#FBEAE5", color: C.attention }}
              >
                {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60 w-full mt-5"
              style={{ background: C.primary }}
            >
              {carregando ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <LogIn size={16} />
              )}
              {carregando ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="flex items-center gap-4 flex-wrap mt-8 pt-6 border-t border-line">
            {[
              { icon: ShieldCheck, label: "Administrador" },
              { icon: Activity, label: "Fisioterapeuta" },
              { icon: Users, label: "Família" },
            ].map((r, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 text-xs text-inkFaint"
              >
                <r.icon size={13} /> {r.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}