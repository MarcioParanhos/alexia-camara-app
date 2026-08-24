import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/session";
import { PerfilForm } from "./form";

export const dynamic = "force-dynamic";

export default async function PerfilPage() {
  const session = await requireStaff();

  // Perfil de marca/profissional só existe para PROFISSIONAL — ADMIN puro não tem um
  if (session.user.role !== "PROFISSIONAL") {
    redirect("/dashboard");
  }

  const professional = await prisma.professional.findUnique({
    where: { userId: session.user.id },
    include: { user: { select: { name: true, email: true } } },
  });

  if (!professional) redirect("/dashboard");

  return <PerfilForm professional={professional} />;
}
