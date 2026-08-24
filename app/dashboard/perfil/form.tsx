"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, ShieldCheck, Sparkles, Lock, Check } from "lucide-react";

type Professional = {
  id: string;
  crefito: string | null;
  specialty: string | null;
  bio: string | null;
  clinicName: string | null;
  brandColor: string;
  logoUrl: string | null;
  user: { name: string; email: string };
};

const SECOES = [
  { key: "pessoal", label: "Dados pessoais", icon: User },
  { key: "profissional", label: "Dados profissionais", icon: ShieldCheck },
  { key: "marca", label: "Marca do relatório", icon: Sparkles },
  { key: "seguranca", label: "Segurança", icon: Lock },
] as const;

const PALETAS = [
  { nome: "Pinho", cor: "#3F6B58" },
  { nome: "Ocre", cor: "#B9812F" },
  { nome: "Ameixa", cor: "#6B5B95" },
  { nome: "Terracota", cor: "#A94A3D" },
  { nome: "Petróleo", cor: "#3F7C8C" },
];

export function PerfilForm({ professional }: { professional: Professional }) {
  const router = useRouter();
  const [secao, setSecao] = useState<(typeof SECOES)[number]["key"]>("marca");
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [nome, setNome] = useState(professional.user.name);
  const [crefito, setCrefito] = useState(professional.crefito ?? "");
  const [specialty, setSpecialty] = useState(professional.specialty ?? "");
  const [bio, setBio] = useState(professional.bio ?? "");
  const [clinicName, setClinicName] = useState(professional.clinicName ?? "");
  const [brandColor, setBrandColor] = useState(professional.brandColor);

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  async function salvar() {
    setErro(null);

    if (secao === "seguranca" && novaSenha) {
      if (novaSenha !== confirmarSenha) {
        setErro("As senhas não coincidem.");
        return;
      }
      if (novaSenha.length < 6) {
        setErro("A nova senha precisa ter ao menos 6 caracteres.");
        return;
      }
    }

    setSalvando(true);
    try {
      const resp = await fetch("/api/professional/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nome,
          crefito,
          specialty,
          bio,
          clinicName,
          brandColor,
          ...(novaSenha ? { currentPassword: senhaAtual, newPassword: novaSenha } : {}),
        }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(typeof data?.error === "string" ? data.error : "Não foi possível salvar.");

      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
      setSalvo(true);
      setTimeout(() => setSalvo(false), 1800);
      router.refresh();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="rounded-2xl p-5 sm:p-8 bg-bg">
      <p className="text-xs uppercase tracking-[0.18em] mb-1 text-inkFaint">Configurações</p>
      <h2 className="text-xl sm:text-2xl font-display font-semibold text-ink mb-6">Meu perfil</h2>

      <div className="grid lg:grid-cols-[240px_1fr] gap-6 lg:gap-8">
        <div>
          <div
            className="rounded-xl p-6 mb-5 text-center"
            style={{ background: `linear-gradient(155deg, #2C4B3E, ${brandColor})` }}
          >
            <p className="text-white text-[15px] font-display italic font-semibold">{nome}</p>
            <p className="text-white/65 text-[11px] mt-0.5">
              Fisioterapeuta{crefito ? ` • CREFITO ${crefito}` : ""}
            </p>
          </div>

          <div className="space-y-1">
            {SECOES.map((s) => (
              <button
                key={s.key}
                onClick={() => setSecao(s.key)}
                className="w-full flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-left text-sm"
                style={{
                  background: secao === s.key ? "#DCE5DA" : "transparent",
                  color: secao === s.key ? "#2C4B3E" : "#5B6157",
                  fontWeight: secao === s.key ? 500 : 400,
                }}
              >
                <s.icon size={14} /> {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl p-5 sm:p-7 bg-white border border-line" style={{ minHeight: 480 }}>
          {secao === "pessoal" && (
            <div>
              <h3 className="text-xl mb-6 font-display font-semibold text-ink">Dados pessoais</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs mb-1.5 block text-inkSoft">Nome completo</label>
                  <input value={nome} onChange={(e) => setNome(e.target.value)} className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none bg-surface border border-line" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs mb-1.5 block text-inkSoft">E-mail de acesso</label>
                  <input value={professional.user.email} disabled className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none bg-surface border border-line opacity-60" />
                </div>
              </div>
            </div>
          )}

          {secao === "profissional" && (
            <div>
              <h3 className="text-xl mb-6 font-display font-semibold text-ink">Dados profissionais</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs mb-1.5 block text-inkSoft">Registro (CREFITO)</label>
                  <input value={crefito} onChange={(e) => setCrefito(e.target.value)} className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none bg-surface border border-line" />
                </div>
                <div>
                  <label className="text-xs mb-1.5 block text-inkSoft">Especialidade principal</label>
                  <input value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none bg-surface border border-line" />
                </div>
              </div>
              <label className="text-xs mb-1.5 block text-inkSoft">Sobre — aparece no rodapé dos relatórios</label>
              <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none resize-none bg-surface border border-line" />
              <div className="mt-4">
                <label className="text-xs mb-1.5 block text-inkSoft">Clínica / consultório</label>
                <input value={clinicName} onChange={(e) => setClinicName(e.target.value)} className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none bg-surface border border-line" />
              </div>
            </div>
          )}

          {secao === "marca" && (
            <div>
              <h3 className="text-xl mb-1.5 font-display font-semibold text-ink">Marca dos relatórios</h3>
              <p className="text-sm mb-6 max-w-md text-inkSoft">
                Define a cor que aparece nos relatórios enviados às famílias e no portal de acompanhamento.
              </p>

              <p className="text-xs mb-2.5 text-inkSoft">Cor de assinatura</p>
              <div className="flex items-center gap-3 flex-wrap mb-7">
                {PALETAS.map((p) => (
                  <button key={p.cor} onClick={() => setBrandColor(p.cor)} className="flex flex-col items-center gap-1.5" type="button">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center"
                      style={{ background: p.cor, outline: `2px solid ${p.cor}`, outlineOffset: 2, border: brandColor === p.cor ? "2px solid #22291F" : "2px solid transparent" }}
                    >
                      {brandColor === p.cor && <Check size={13} color="#fff" />}
                    </div>
                    <span className="text-[10px] text-inkFaint">{p.nome}</span>
                  </button>
                ))}
              </div>

              <p className="text-xs mb-2.5 text-inkSoft">Prévia</p>
              <div className="rounded-lg p-5 flex flex-wrap items-center gap-4 justify-between" style={{ background: `linear-gradient(155deg, #2C4B3E, ${brandColor})` }}>
                <div>
                  <p className="text-white text-base font-display italic font-semibold">{nome}</p>
                  <p className="text-white/60 text-[10px] uppercase tracking-wide mt-0.5">Relatório de evolução</p>
                </div>
              </div>
            </div>
          )}

          {secao === "seguranca" && (
            <div>
              <h3 className="text-xl mb-6 font-display font-semibold text-ink">Segurança</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-xs mb-1.5 block text-inkSoft">Senha atual</label>
                  <input type="password" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none bg-surface border border-line" />
                </div>
                <div className="hidden sm:block" />
                <div>
                  <label className="text-xs mb-1.5 block text-inkSoft">Nova senha</label>
                  <input type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none bg-surface border border-line" />
                </div>
                <div>
                  <label className="text-xs mb-1.5 block text-inkSoft">Confirmar nova senha</label>
                  <input type="password" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none bg-surface border border-line" />
                </div>
              </div>
              <p className="text-xs text-inkFaint">Deixe os campos de senha em branco se não quiser alterá-la agora.</p>
            </div>
          )}

          {erro && <p className="text-sm text-attention mt-4">{erro}</p>}

          <div className="flex items-center justify-end gap-3 mt-10 pt-6 border-t border-line">
            {salvo && <span className="flex items-center gap-1.5 text-xs text-primary"><Check size={13} /> Alterações salvas</span>}
            <button onClick={salvar} disabled={salvando} className="rounded-lg px-5 py-2.5 text-sm font-medium text-white bg-primary disabled:opacity-60">
              {salvando ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
