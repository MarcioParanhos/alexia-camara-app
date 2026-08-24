import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AceitarConviteForm } from "./form";

export const dynamic = "force-dynamic";

export default async function ConvitePage({ params }: { params: { token: string } }) {
  const familyMember = await prisma.familyMember.findUnique({
    where: { inviteToken: params.token },
    include: { patient: { select: { name: true } } },
  });

  if (!familyMember) notFound();

  if (familyMember.status === "ATIVO") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-surface">
        <div className="text-center max-w-sm">
          <h1 className="text-xl font-display font-semibold text-ink mb-2">Convite já utilizado</h1>
          <p className="text-sm text-inkSoft">Este convite já foi aceito. Faça login normalmente.</p>
        </div>
      </div>
    );
  }

  return (
    <AceitarConviteForm
      token={params.token}
      nomeFamiliar={familyMember.name}
      email={familyMember.email}
      nomePaciente={familyMember.patient.name}
      parentesco={familyMember.relationship}
    />
  );
}
