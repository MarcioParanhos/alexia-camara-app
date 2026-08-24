import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { randomBytes } from "crypto";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeAcessarPaciente, podeEditarPaciente } from "@/lib/patient-access";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !podeEditarPaciente(session)) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }
  const acesso = await podeAcessarPaciente(session, params.id);
  if (!acesso) return NextResponse.json({ error: "Paciente não encontrado." }, { status: 404 });

  const familyMembers = await prisma.familyMember.findMany({
    where: { patientId: params.id },
    orderBy: { invitedAt: "desc" },
  });

  return NextResponse.json({ familyMembers });
}

const inviteSchema = z.object({
  name: z.string().min(2),
  relationship: z.string().min(1),
  email: z.string().email(),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !podeEditarPaciente(session)) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }
  const acesso = await podeAcessarPaciente(session, params.id);
  if (!acesso) return NextResponse.json({ error: "Paciente não encontrado." }, { status: 404 });

  const body = await req.json();
  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();

  const existente = await prisma.familyMember.findUnique({
    where: { patientId_email: { patientId: params.id, email } },
  });
  if (existente) {
    return NextResponse.json({ error: "Este e-mail já tem acesso (ou convite pendente) a este paciente." }, { status: 409 });
  }

  const inviteToken = randomBytes(24).toString("hex");

  const familyMember = await prisma.familyMember.create({
    data: {
      patientId: params.id,
      name: parsed.data.name,
      relationship: parsed.data.relationship,
      email,
      status: "PENDENTE",
      inviteToken,
    },
  });

  // TODO: enviar e-mail de verdade (Resend/Nodemailer) com o link:
  // `${process.env.NEXT_PUBLIC_APP_URL}/convite/${inviteToken}`
  // Por enquanto, o link fica disponível na resposta para cópia manual.
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/convite/${inviteToken}`;

  return NextResponse.json({ familyMember, inviteUrl }, { status: 201 });
}
