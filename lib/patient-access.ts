import { Session } from "next-auth";
import { prisma } from "@/lib/prisma";

/**
 * Confere se o usuário da sessão pode acessar este paciente e retorna o
 * paciente (ou null se não tiver acesso / não existir).
 * - ADMIN: acesso total
 * - PROFISSIONAL: só pacientes do próprio professionalId
 * - FAMILIAR: só pacientes presentes em session.user.patientIds
 */
export async function podeAcessarPaciente(session: Session, patientId: string) {
  const paciente = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!paciente) return null;

  if (session.user.role === "ADMIN") return paciente;
  if (session.user.role === "PROFISSIONAL") {
    return paciente.professionalId === session.user.professionalId ? paciente : null;
  }
  if (session.user.role === "FAMILIAR") {
    return session.user.patientIds.includes(paciente.id) ? paciente : null;
  }
  return null;
}

export function podeEditarPaciente(session: Session) {
  return session.user.role === "ADMIN" || session.user.role === "PROFISSIONAL";
}
