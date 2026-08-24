"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Link2, Copy, Check, Clock, ShieldCheck, RefreshCw, Trash2 } from "lucide-react";
import { Avatar } from "@/components/avatar";

type FamilyMember = {
  id: string;
  name: string;
  relationship: string;
  email: string;
  status: "PENDENTE" | "ATIVO";
  lastAccessAt: string | Date | null;
};

type AccessLink = {
  id: string;
  token: string;
  expiresAt: string | Date;
  createdAt: string | Date;
};

export function GestaoAcessosPainel({
  paciente,
}: {
  paciente: { id: string; name: string; familyMembers: FamilyMember[]; accessLinks: AccessLink[] };
}) {
  const router = useRouter();
  const [modo, setModo] = useState<"convite" | "link">("convite");

  // Convite
  const [nome, setNome] = useState("");
  const [parentesco, setParentesco] = useState("");
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erroConvite, setErroConvite] = useState<string | null>(null);
  const [linkConvite, setLinkConvite] = useState<string | null>(null);

  // Link de acesso
  const [gerandoLink, setGerandoLink] = useState(false);
  const [linkAtivo, setLinkAtivo] = useState<AccessLink | null>(paciente.accessLinks[0] ?? null);
  const [urlLink, setUrlLink] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  const appUrl = typeof window !== "undefined" ? window.location.origin : "";

  async function enviarConvite(e: React.FormEvent) {
    e.preventDefault();
    setErroConvite(null);
    setLinkConvite(null);

    if (!nome.trim() || !parentesco.trim() || !email.trim()) {
      setErroConvite("Preencha nome, parentesco e e-mail.");
      return;
    }

    setEnviando(true);
    try {
      const resp = await fetch(`/api/patients/${paciente.id}/family`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nome, relationship: parentesco, email }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || "Não foi possível enviar o convite.");

      setLinkConvite(data.inviteUrl);
      setNome("");
      setParentesco("");
      setEmail("");
      router.refresh();
    } catch (err) {
      setErroConvite(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setEnviando(false);
    }
  }

  async function removerFamiliar(id: string) {
    await fetch(`/api/patients/${paciente.id}/family/${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function gerarLink() {
    setGerandoLink(true);
    try {
      const resp = await fetch(`/api/patients/${paciente.id}/access-links`, { method: "POST" });
      const data = await resp.json();
      if (resp.ok) {
        setLinkAtivo(data.accessLink);
        setUrlLink(data.url);
      }
    } finally {
      setGerandoLink(false);
    }
  }

  async function copiarLink() {
    const url = urlLink ?? `${appUrl}/acesso/${linkAtivo?.token}`;
    await navigator.clipboard.writeText(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1500);
  }

  return (
    <div className="min-h-screen p-5 sm:p-8 bg-bg">
      <p className="text-xs uppercase tracking-[0.18em] mb-1 text-inkFaint">Administração</p>
      <h2 className="text-xl sm:text-2xl font-display font-semibold text-ink mb-6">
        Acessos da família — {paciente.name}
      </h2>

      <div className="flex items-center gap-2 mb-6 rounded-lg p-1 w-fit max-w-full overflow-x-auto bg-surface">
        <button
          onClick={() => setModo("convite")}
          className="flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-md shrink-0"
          style={{ background: modo === "convite" ? "#fff" : "transparent", color: modo === "convite" ? "#22291F" : "#8A8F7F" }}
        >
          <UserPlus size={13} /> Convidar por e-mail
        </button>
        <button
          onClick={() => setModo("link")}
          className="flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-md shrink-0"
          style={{ background: modo === "link" ? "#fff" : "transparent", color: modo === "link" ? "#22291F" : "#8A8F7F" }}
        >
          <Link2 size={13} /> Link de acesso
        </button>
      </div>

      {modo === "convite" ? (
        <form onSubmit={enviarConvite} className="rounded-xl p-5 sm:p-6 mb-6 bg-white border border-line w-full">
          <p className="text-sm mb-4 text-inkSoft">
            Cadastre o familiar diretamente. Assim que ele aceitar o convite, entra com acesso somente à trilha de{" "}
            <strong className="text-ink">{paciente.name}</strong>.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome do familiar" className="rounded-lg px-3.5 py-2.5 text-sm outline-none bg-surface border border-line" />
            <input value={parentesco} onChange={(e) => setParentesco(e.target.value)} placeholder="Parentesco (ex: Mãe)" className="rounded-lg px-3.5 py-2.5 text-sm outline-none bg-surface border border-line" />
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" type="email" className="rounded-lg px-3.5 py-2.5 text-sm outline-none bg-surface border border-line" />
          </div>
          {erroConvite && <p className="text-xs mb-3 text-attention">{erroConvite}</p>}
          <button
            type="submit"
            disabled={enviando}
            className="flex items-center justify-center gap-1.5 text-sm px-4 py-2.5 rounded-lg font-medium text-white w-full sm:w-auto bg-primary disabled:opacity-60"
          >
            <UserPlus size={14} /> {enviando ? "Enviando..." : "Enviar convite"}
          </button>

          {linkConvite && (
            <div className="mt-4 rounded-lg p-3 bg-surface border border-line">
              <p className="text-xs text-inkFaint mb-1">
                Envio automático de e-mail ainda não está configurado — copie e envie este link manualmente por enquanto:
              </p>
              <p className="text-xs font-mono break-all text-ink">{linkConvite}</p>
            </div>
          )}
        </form>
      ) : (
        <div className="rounded-xl p-5 sm:p-6 mb-6 bg-white border border-line w-full">
          <p className="text-sm mb-4 text-inkSoft">
            Gere um link único e somente-leitura da trilha de <strong className="text-ink">{paciente.name}</strong>. Compartilhe por
            WhatsApp ou e-mail — sem precisar cadastrar cada familiar manualmente.
          </p>

          {!linkAtivo ? (
            <button
              onClick={gerarLink}
              disabled={gerandoLink}
              className="flex items-center justify-center gap-1.5 text-sm px-4 py-2.5 rounded-lg font-medium text-white w-full sm:w-auto bg-primary disabled:opacity-60"
            >
              <Link2 size={14} /> {gerandoLink ? "Gerando..." : "Gerar link de acesso"}
            </button>
          ) : (
            <div>
              <div className="flex items-center gap-2 rounded-lg p-3 mb-3 bg-surface border border-line">
                <Link2 size={14} className="text-primary shrink-0" />
                <span className="text-sm flex-1 truncate font-mono text-ink">{`${appUrl}/acesso/${linkAtivo.token}`}</span>
                <button
                  onClick={copiarLink}
                  className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md shrink-0"
                  style={{ background: copiado ? "#3F6B58" : "#DCE5DA", color: copiado ? "#fff" : "#2C4B3E" }}
                >
                  {copiado ? <Check size={12} /> : <Copy size={12} />} {copiado ? "Copiado" : "Copiar"}
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-inkFaint">
                <span className="flex items-center gap-1">
                  <Clock size={12} /> Expira em {formatarData(linkAtivo.expiresAt)}
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck size={12} /> Somente leitura
                </span>
                <button onClick={gerarLink} className="flex items-center gap-1 text-attention">
                  <RefreshCw size={12} /> Gerar novo (revoga o atual)
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <p className="text-[11px] uppercase tracking-wide mb-3 text-inkFaint">
        Acessos de {paciente.name.split(" ")[0]} ({paciente.familyMembers.length})
      </p>
      {paciente.familyMembers.length === 0 ? (
        <p className="text-sm text-inkFaint">Nenhum familiar vinculado ainda.</p>
      ) : (
        <div className="space-y-2.5 w-full">
          {paciente.familyMembers.map((f) => (
            <div key={f.id} className="flex flex-wrap sm:flex-nowrap items-center gap-3 rounded-xl p-4 bg-white border border-line">
              <Avatar nome={f.name} size={38} />
              <div className="flex-1 min-w-[140px]">
                <p className="text-sm truncate font-medium text-ink">{f.name}</p>
                <p className="text-xs truncate text-inkFaint">
                  {f.relationship} · {f.email}
                </p>
              </div>
              <span
                className="text-[11px] px-2.5 py-1 rounded-full shrink-0"
                style={{
                  background: f.status === "ATIVO" ? "#DCE5DA" : "#F1E2C2",
                  color: f.status === "ATIVO" ? "#2C4B3E" : "#B9812F",
                }}
              >
                {f.status === "ATIVO" ? "Ativo" : "Pendente"}
              </span>
              <button onClick={() => removerFamiliar(f.id)}>
                <Trash2 size={14} className="text-inkFaint" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatarData(data: string | Date) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(data));
}
