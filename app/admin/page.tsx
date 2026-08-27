import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { Avatar } from "@/components/avatar";
import { Users, ShieldCheck, Activity, UserCog, Plus } from "lucide-react";
import { PainelNovoProfissional } from "@/components/painel-novo-profissional";

export const dynamic = "force-dynamic";

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Administrador",
  PROFISSIONAL: "Profissional",
  FAMILIAR: "Familiar",
};

const [usuarios, profissionais, totalPacientes, totalFamiliaresAtivos, convitesPendentes] = await Promise.all([
  prisma.user.findMany({ /* ...igual já está... */ }),
  prisma.professional.findMany({ /* ...igual já está... */ }),
  prisma.patient.count(),
  prisma.familyMember.count({ where: { status: "ATIVO" } }),
  prisma.professionalInvite.findMany({ where: { status: "PENDENTE" }, orderBy: { invitedAt: "desc" } }),
]);

export default async function AdminPage() {
  await requireAdmin();

  const [usuarios, profissionais, totalPacientes, totalFamiliaresAtivos] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
    }),
    prisma.professional.findMany({
      include: { user: { select: { name: true, email: true } }, _count: { select: { patients: true } } },
    }),
    prisma.patient.count(),
    prisma.familyMember.count({ where: { status: "ATIVO" } }),
  ]);

  return (
    <div className="rounded-2xl p-5 sm:p-8 bg-bg">
      <div className="flex items-start sm:items-center justify-between gap-4 mb-7">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] mb-1 text-inkFaint">Administração</p>
          <h2 className="text-xl sm:text-2xl font-display font-semibold text-ink">Visão geral</h2>
        </div>
        <PainelNovoProfissional />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {[
          { label: "Usuários", valor: usuarios.length, icon: Users },
          { label: "Profissionais", valor: profissionais.length, icon: UserCog },
          { label: "Pacientes", valor: totalPacientes, icon: Activity },
          { label: "Familiares ativos", valor: totalFamiliaresAtivos, icon: ShieldCheck },
        ].map((s, i) => (
          <div key={i} className="relative rounded-xl p-4 sm:p-5 bg-white border border-line overflow-hidden">
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center mb-3.5"
              style={{ background: "#DCE5DA" }}
            >
              <s.icon size={14} color="#2C4B3E" strokeWidth={2.25} />
            </span>
            <p className="text-xl sm:text-2xl font-mono tabular-nums text-ink">{s.valor}</p>
            <p className="text-[11px] sm:text-xs uppercase tracking-wide mt-1.5 text-inkFaint">{s.label}</p>
          </div>
        ))}
      </div>

      <p className="text-[11px] uppercase tracking-wide mb-3 text-inkFaint">
        Profissionais ({profissionais.length})
      </p>
      {profissionais.length === 0 ? (
        <div className="rounded-xl p-8 text-center bg-white border border-dashed border-line mb-8">
          <p className="text-sm text-inkFaint">Nenhum profissional cadastrado ainda.</p>
        </div>
      ) : (
        <div className="space-y-2.5 mb-8">
          {profissionais.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-xl p-4 bg-white border border-line">
              <Avatar nome={p.user.name} size={38} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink truncate">{p.user.name}</p>
                <p className="text-xs text-inkFaint truncate">
                  {p.clinicName || "Sem clínica informada"} · {p.user.email}
                </p>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-full shrink-0 bg-surface text-inkFaint">
                {p._count.patients} paciente{p._count.patients === 1 ? "" : "s"}
              </span>
            </div>
          ))}
        </div>
      )}
      {convitesPendentes.length > 0 && (
  <>
    <p className="text-[11px] uppercase tracking-wide mb-3 text-inkFaint">
      Convites pendentes ({convitesPendentes.length})
    </p>
    <div className="space-y-2.5 mb-8">
      {convitesPendentes.map((c) => (
        <div key={c.id} className="rounded-xl bg-white border overflow-hidden" style={{ borderColor: "#E9C77E" }}>
          <div className="flex items-center gap-3 p-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink truncate">{c.name}</p>
              <p className="text-xs text-inkFaint truncate">{c.email}</p>
            </div>
            <span className="text-[11px] px-2.5 py-1 rounded-full shrink-0" style={{ background: "#F1E2C2", color: "#B9812F" }}>
              Pendente
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-3 bg-surface border-t border-line">
            <span className="text-xs flex-1 truncate font-mono text-ink">
              {`${process.env.NEXT_PUBLIC_APP_URL ?? ""}/convite-profissional/${c.token}`}
            </span>
          </div>
        </div>
      ))}
    </div>
  </>
)}
      <p className="text-[11px] uppercase tracking-wide mb-3 text-inkFaint">
        Todos os usuários ({usuarios.length})
      </p>
      <div className="rounded-xl overflow-hidden bg-white border border-line">
        {/* tabela no desktop */}
        <table className="w-full text-sm hidden sm:table">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-inkFaint border-b border-line">
              <th className="px-4 py-3 font-normal">Nome</th>
              <th className="px-4 py-3 font-normal">E-mail</th>
              <th className="px-4 py-3 font-normal">Papel</th>
              <th className="px-4 py-3 font-normal">Status</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 text-ink">{u.name}</td>
                <td className="px-4 py-3 text-inkSoft">{u.email}</td>
                <td className="px-4 py-3">
                  <span className="text-[11px] px-2 py-1 rounded-full bg-primary-soft text-primary-dark">
                    {ROLE_LABEL[u.role] ?? u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 text-xs text-inkFaint">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: u.active ? "#3F6B58" : "#C7CBC0" }}
                    />
                    {u.active ? "Ativo" : "Inativo"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* cards no mobile */}
        <div className="sm:hidden divide-y divide-line">
          {usuarios.map((u) => (
            <div key={u.id} className="p-4">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-sm font-medium text-ink truncate">{u.name}</p>
                <span className="inline-flex items-center gap-1.5 text-[11px] text-inkFaint shrink-0">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: u.active ? "#3F6B58" : "#C7CBC0" }}
                  />
                  {u.active ? "Ativo" : "Inativo"}
                </span>
              </div>
              <p className="text-xs text-inkFaint truncate mb-2">{u.email}</p>
              <span className="text-[11px] px-2 py-1 rounded-full bg-primary-soft text-primary-dark">
                {ROLE_LABEL[u.role] ?? u.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}