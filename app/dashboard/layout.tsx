import Link from "next/link";
import { requireStaff } from "@/lib/session";
import { TopNav } from "@/components/top-nav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireStaff();

  const links = [
    { href: "/dashboard", label: "Painel" },
    { href: "/dashboard/pacientes/novo", label: "Cadastrar paciente" },
    { href: "/dashboard/perfil", label: "Meu perfil" },
    ...(session.user.role === "ADMIN" ? [{ href: "/admin", label: "Administração" }] : []),
  ];

  return (
    <div className="min-h-screen bg-surface">
      <TopNav links={links} userName={session.user.name ?? ""} />
      <main className="max-w-6xl mx-auto px-3 sm:px-6 py-5 sm:py-8">{children}</main>
    </div>
  );
}
