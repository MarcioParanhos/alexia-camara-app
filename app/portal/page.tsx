import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireFamily } from "@/lib/session";
import { Avatar } from "@/components/avatar";

export const dynamic = "force-dynamic";

export default async function PortalHomePage() {
  const session = await requireFamily();

  const where = session.user.role === "ADMIN" ? {} : { id: { in: session.user.patientIds } };

  const pacientes = await prisma.patient.findMany({
    where,
    select: { id: true, name: true, diagnosis: true, photoUrl: true },
  });

  if (pacientes.length === 1) {
    redirect(`/portal/${pacientes[0].id}`);
  }

  return (
    <div className="rounded-2xl p-5 sm:p-8 bg-white border border-line">
      <h2 className="text-xl font-display font-semibold text-ink mb-1">Quem você acompanha</h2>
      <p className="text-sm text-inkSoft mb-6">Selecione um paciente para ver a evolução.</p>

      {pacientes.length === 0 ? (
        <p className="text-sm text-inkFaint">Nenhum paciente vinculado à sua conta ainda.</p>
      ) : (
        <div className="space-y-2.5">
          {pacientes.map((p) => (
            <Link key={p.id} href={`/portal/${p.id}`} className="flex items-center gap-3 rounded-xl p-4 bg-surface border border-line">
              <Avatar nome={p.name} size={38} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink truncate">{p.name}</p>
                <p className="text-xs text-inkFaint truncate">{p.diagnosis || "Sem diagnóstico informado"}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
