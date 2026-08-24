import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export async function getSession() {
  return getServerSession(authOptions);
}

/** Usa em Server Components: redireciona para /login se não houver sessão */
export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

/** Usa em Server Components que só ADMIN e PROFISSIONAL podem ver */
export async function requireStaff() {
  const session = await requireSession();
  if (session.user.role !== "ADMIN" && session.user.role !== "PROFISSIONAL") {
    redirect("/nao-autorizado");
  }
  return session;
}

/** Usa em Server Components do portal da família */
export async function requireFamily() {
  const session = await requireSession();
  if (session.user.role !== "FAMILIAR" && session.user.role !== "ADMIN") {
    redirect("/nao-autorizado");
  }
  return session;
}

/** Usa em Server Components restritas ao administrador */
export async function requireAdmin() {
  const session = await requireSession();
  if (session.user.role !== "ADMIN") {
    redirect("/nao-autorizado");
  }
  return session;
}
