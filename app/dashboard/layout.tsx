import Link from "next/link";
import { requireStaff } from "@/lib/session";
import { TopNav } from "@/components/top-nav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireStaff();

  const links =
    session.user.role === "ADMIN"
      ? [{ href: "/admin", label: "Administração" }]
      : [
          { href: "/dashboard", label: "Painel" },
          { href: "/dashboard/pacientes/novo", label: "Cadastrar paciente" },
          { href: "/dashboard/pacientes/arquivados", label: "Pacientes arquivados" },
        ];

  return (
    <div className="min-h-screen bg-surface">
      <TopNav links={links} userName={session.user.name ?? ""} role={session.user.role} />
      <main className="max-w-[1600px] mx-auto px-4 sm:px-8 py-5 sm:py-8">{children}</main>
    </div>
  );
}