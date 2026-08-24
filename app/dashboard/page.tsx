import Link from "next/link";
import { Users, Calendar, TrendingUp, Activity, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/session";
import { Avatar } from "@/components/avatar";
import { PainelPacientes } from "@/components/painel-pacientes";

export const dynamic = "force-dynamic";

export default async function PainelPage() {
  const session = await requireStaff();

  const isAdmin = session.user.role === "ADMIN";
  const professionalId = session.user.professionalId ?? "__none__";

  const pacientes = await prisma.patient.findMany({
    where: isAdmin ? {} : { professionalId },
    select: {
      id: true,
      name: true,
      birthDate: true,
      diagnosis: true,
      status: true,
      phases: { select: { plannedSessions: true } },
      _count: { select: { evolutions: true } },
      evolutions: {
        select: { sessionDate: true },
        orderBy: { sessionDate: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const seteDiasAtras = new Date();
  seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);

  const sessoesEstaSemana = await prisma.evolution.count({
    where: {
      sessionDate: { gte: seteDiasAtras },
      ...(isAdmin ? {} : { patient: { professionalId } }),
    },
  });

  const listaComAdesao = pacientes.map((p) => {
    const totalPrevisto = p.phases.reduce((s, f) => s + f.plannedSessions, 0);
    const adesao = totalPrevisto > 0 ? Math.min(100, Math.round((p._count.evolutions / totalPrevisto) * 100)) : null;
    const idade = p.birthDate ? calcularIdade(p.birthDate) : null;
    const ultima = p.evolutions[0]?.sessionDate ?? null;
    return {
      id: p.id,
      name: p.name,
      diagnosis: p.diagnosis,
      idade,
      adesao,
      ultima,
    };
  });

  const comAdesaoDefinida = listaComAdesao.filter((p) => p.adesao !== null);
  const adesaoMedia =
    comAdesaoDefinida.length > 0
      ? Math.round(comAdesaoDefinida.reduce((s, p) => s + (p.adesao ?? 0), 0) / comAdesaoDefinida.length)
      : null;
  const precisamAtencao = listaComAdesao.filter((p) => p.adesao !== null && p.adesao < 80).length;

  const nomeExibicao = (session.user.name ?? "").split(" ")[0] || "";

  return (
    <div className="rounded-2xl p-5 sm:p-8 bg-bg">
      <div className="flex items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <p className="text-[11px] sm:text-xs uppercase tracking-[0.18em] mb-1 text-inkFaint">Painel do profissional</p>
          <h2 className="text-xl sm:text-2xl font-display font-semibold text-ink">Bom dia, {nomeExibicao || "por aqui"}</h2>
        </div>
        <Avatar nome={session.user.name ?? "?"} size={38} />
      </div>

      {/* Resumo real */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-7">
        {[
          { label: "Pacientes ativos", valor: pacientes.length, icon: Users },
          { label: "Sessões esta semana", valor: sessoesEstaSemana, icon: Calendar },
          { label: "Adesão média", valor: adesaoMedia !== null ? `${adesaoMedia}%` : "—", icon: TrendingUp },
          { label: "Precisam de atenção", valor: precisamAtencao, icon: Activity },
        ].map((s, i) => (
          <div key={i} className="rounded-xl p-4 sm:p-5 bg-white border border-line">
            <s.icon size={15} className="mb-3 text-primary" />
            <p className="text-xl sm:text-2xl font-mono text-ink">{s.valor}</p>
            <p className="text-[11px] sm:text-xs mt-1 leading-tight text-inkFaint">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-end mb-4">
        <Link
          href="/dashboard/pacientes/novo"
          className="flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white shrink-0 bg-primary"
        >
          <Plus size={16} /> Novo paciente
        </Link>
      </div>

      <PainelPacientes pacientes={listaComAdesao} />
    </div>
  );
}

function calcularIdade(nascimento: Date) {
  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const m = hoje.getMonth() - nascimento.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) idade--;
  return idade;
}
