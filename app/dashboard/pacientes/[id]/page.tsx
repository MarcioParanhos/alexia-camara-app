import Link from "next/link";
import { notFound } from "next/navigation";
import { BackButton } from "@/components/back-button";
import {
  TrendingUp,
  Users,
  Plus,
  Sparkles,
  FileText,
  UserPlus,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/session";
import { podeAcessarPaciente } from "@/lib/patient-access";
import { Avatar } from "@/components/avatar";
import { PainelAnexos, AnexosEvolucaoToggle } from "@/components/anexos";

export const dynamic = "force-dynamic";

export default async function ProntuarioPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await requireStaff();

  const acesso = await podeAcessarPaciente(session, params.id);
  if (!acesso) notFound();

  const paciente = await prisma.patient.findUnique({
    where: { id: params.id },
    include: {
      phases: { orderBy: { order: "asc" } },
      evolutions: {
        orderBy: { sessionDate: "desc" },
        include: {
          author: { select: { name: true } },
          attachments: { orderBy: { uploadedAt: "desc" } },
        },
      },
      attachments: {
        where: { evolutionId: null },
        orderBy: { uploadedAt: "desc" },
      },
      _count: { select: { familyMembers: true } },
    },
  });

  if (!paciente) notFound();

  const totalPrevisto = paciente.phases.reduce(
    (s, f) => s + f.plannedSessions,
    0,
  );
  const adesao =
    totalPrevisto > 0
      ? Math.min(
          100,
          Math.round((paciente.evolutions.length / totalPrevisto) * 100),
        )
      : null;
  const idade = paciente.birthDate ? calcularIdade(paciente.birthDate) : null;

  return (
    <div className="rounded-2xl p-5 sm:p-8 bg-bg">
      <div className="flex justify-end mb-6">
        <BackButton />
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-6 lg:gap-8">
        {/* Sidebar paciente */}
        <div className="rounded-xl p-6 h-fit bg-white border border-line">
          <Avatar nome={paciente.name} size={64} />
          <h3 className="text-xl mt-4 mb-1 font-display font-semibold text-ink">
            {paciente.name}
          </h3>
          <p className="text-sm mb-5 text-inkFaint">
            {idade !== null ? `${idade} anos` : "Idade não informada"}
          </p>

          <div className="space-y-4 text-sm">
            <div>
              <p className="text-[11px] uppercase tracking-wide mb-1 text-inkFaint">
                Diagnóstico
              </p>
              <p className="text-ink">
                {paciente.diagnosis || "Não informado"}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide mb-1 text-inkFaint">
                Início do tratamento
              </p>
              <p className="text-ink">{formatarData(paciente.startDate)}</p>
            </div>
            {adesao !== null && (
              <div>
                <p className="text-[11px] uppercase tracking-wide mb-1 text-inkFaint">
                  Adesão ao plano
                </p>
                <div className="flex items-center gap-2">
                  <span className="flex-1 h-1.5 rounded-full overflow-hidden bg-surfaceAlt">
                    <span
                      className="block h-full rounded-full bg-accent"
                      style={{ width: `${adesao}%` }}
                    />
                  </span>
                  <span className="font-mono text-ink text-xs">{adesao}%</span>
                </div>
              </div>
            )}
            <div className="pt-2">
              <p className="text-[11px] uppercase tracking-wide mb-1.5 text-inkFaint">
                Familiares vinculados
              </p>
              <div className="flex items-center gap-2">
                <Link
                  href={`/dashboard/pacientes/${paciente.id}/acessos`}
                  className="flex items-center gap-1.5 text-xs text-inkSoft"
                >
                  <Users size={13} /> {paciente._count.familyMembers} acesso(s)
                </Link>
                <Link
                  href={`/dashboard/pacientes/${paciente.id}/acessos`}
                  aria-label="Vincular familiar"
                  className="p-1 rounded-md text-primary text-xs hover:bg-surface"
                >
                  <UserPlus size={14} />
                </Link>
              </div>
            </div>
          </div>

          <div className="pt-5 mt-5 border-t border-line">
            <p className="text-[11px] uppercase tracking-wide mb-2 text-inkFaint">
              Anexos do paciente
            </p>
            <p className="text-[11px] mb-2.5 text-inkFaint">
              Documentos e exames que não pertencem a uma sessão específica
              (laudos, avaliações posturais etc.).
            </p>
            <PainelAnexos
              patientId={paciente.id}
              initialAnexos={paciente.attachments}
              compact
            />
          </div>

          <Link
            href={`/dashboard/pacientes/${paciente.id}/nova-evolucao`}
            className="w-full mt-6 rounded-lg py-2.5 text-sm font-medium text-white bg-primary flex items-center justify-center gap-1.5"
          >
            <Plus size={15} /> Novo registro de evolução
          </Link>
          <Link
            href={`/dashboard/pacientes/${paciente.id}/relatorios`}
            className="w-full mt-2.5 rounded-lg py-2.5 text-sm font-medium text-primary-dark bg-primary-soft flex items-center justify-center gap-1.5"
          >
            <FileText size={15} /> Relatórios
          </Link>
        </div>

        {/* Conteúdo */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-6 text-sm text-primary border-b border-line pb-3">
            <TrendingUp size={14} /> Evolução ({paciente.evolutions.length}{" "}
            registro{paciente.evolutions.length === 1 ? "" : "s"})
          </div>

          {paciente.evolutions.length === 0 ? (
            <div className="rounded-xl p-8 text-center bg-white border border-dashed border-line">
              <p className="text-sm text-inkFaint mb-4">
                Nenhum registro de evolução ainda.
              </p>
              <Link
                href={`/dashboard/pacientes/${paciente.id}/nova-evolucao`}
                className="text-sm text-primary underline"
              >
                Criar o primeiro registro
              </Link>
            </div>
          ) : (
            <div>
              {paciente.evolutions.map((ev) => (
                <div
                  key={ev.id}
                  className="rounded-xl p-4 sm:p-5 mb-4 bg-white border border-line"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-[15px] font-display font-semibold text-ink">
                        {ev.title}
                      </p>
                      <p className="text-xs mt-0.5 font-mono text-inkFaint">
                        {formatarData(ev.sessionDate)} · {ev.author.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      {ev.painLevel !== null && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg leading-none font-mono text-ink">
                            {ev.painLevel}
                          </span>
                          <span className="text-[10px] text-inkFaint">
                            /10 EVA
                          </span>
                        </div>
                      )}
                      {ev.romDegrees !== null && (
                        <div className="text-right">
                          <p className="text-lg leading-none font-mono text-ink">
                            {ev.romDegrees}°
                          </p>
                          <p className="text-[10px] text-inkFaint">amplitude</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-inkSoft whitespace-pre-line">
                    {ev.note}
                  </p>
                  {ev.highlighted && (
                    <span className="inline-flex items-center gap-1 mt-3 text-xs px-2.5 py-1 rounded-full bg-accent-soft text-accent">
                      <Sparkles size={11} /> Marco em destaque
                    </span>
                  )}
                  <AnexosEvolucaoToggle
                    patientId={paciente.id}
                    evolutionId={ev.id}
                    initialAnexos={ev.attachments}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
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

function formatarData(data: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(data));
}
