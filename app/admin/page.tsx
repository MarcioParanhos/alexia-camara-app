import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { Avatar } from "@/components/avatar";
import { Users, ShieldCheck, Activity, UserCog } from "lucide-react";

export const dynamic = "force-dynamic";

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Administrador",
  PROFISSIONAL: "Profissional",
  FAMILIAR: "Familiar",
};

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
      <p className="text-xs uppercase tracking-[0.18em] mb-1 text-inkFaint">Administração</p>
      <h2 className="text-xl sm:text-2xl font-display font-semibold text-ink mb-7">Visão geral</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {[
          { label: "Usuários", valor: usuarios.length, icon: Users },
          { label: "Profissionais", valor: profissionais.length, icon: UserCog },
          { label: "Pacientes", valor: totalPacientes, icon: Activity },
          { label: "Familiares ativos", valor: totalFamiliaresAtivos, icon: ShieldCheck },
        ].map((s, i) => (
          <div key={i} className="rounded-xl p-4 sm:p-5 bg-white border border-line">
            <s.icon size={15} className="mb-3 text-primary" />
            <p className="text-xl sm:text-2xl font-mono text-ink">{s.valor}</p>
            <p className="text-[11px] sm:text-xs mt-1 text-inkFaint">{s.label}</p>
          </div>
        ))}
      </div>

      <p className="text-[11px] uppercase tracking-wide mb-3 text-inkFaint">Profissionais</p>
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
            <span className="text-xs font-mono text-inkFaint shrink-0">{p._count.patients} paciente(s)</span>
          </div>
        ))}
      </div>

      <p className="text-[11px] uppercase tracking-wide mb-3 text-inkFaint">Todos os usuários</p>
      <div className="rounded-xl overflow-hidden bg-white border border-line">
        <table className="w-full text-sm">
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
                <td className="px-4 py-3 text-inkFaint">{u.active ? "Ativo" : "Inativo"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
