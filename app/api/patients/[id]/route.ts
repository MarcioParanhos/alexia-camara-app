import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeAcessarPaciente, podeEditarPaciente } from "@/lib/patient-access";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const acesso = await podeAcessarPaciente(session, params.id);
  if (!acesso) return NextResponse.json({ error: "Paciente não encontrado ou sem permissão." }, { status: 404 });

  const patient = await prisma.patient.findUnique({
    where: { id: params.id },
    include: {
      phases: { orderBy: { order: "asc" } },
      evolutions: {
        orderBy: { sessionDate: "desc" },
        include: { author: { select: { name: true } }, attachments: true },
      },
      familyMembers: true,
      professional: { select: { clinicName: true, brandColor: true, logoUrl: true, user: { select: { name: true } } } },
    },
  });

  return NextResponse.json({ patient });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !podeEditarPaciente(session)) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const acesso = await podeAcessarPaciente(session, params.id);
  if (!acesso) return NextResponse.json({ error: "Paciente não encontrado ou sem permissão." }, { status: 404 });

  const body = await req.json();
  const camposPermitidos = [
    "name",
    "birthDate",
    "phone",
    "email",
    "diagnosis",
    "referredBy",
    "clinicalHistory",
    "status",
    "photoUrl",
  ] as const;

  const data: Record<string, unknown> = {};
  for (const campo of camposPermitidos) {
    if (campo in body) data[campo] = campo === "birthDate" && body[campo] ? new Date(body[campo]) : body[campo];
  }

  const patient = await prisma.patient.update({ where: { id: params.id }, data });
  return NextResponse.json({ patient });
}
