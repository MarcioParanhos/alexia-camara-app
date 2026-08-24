import { requireAdmin } from "@/lib/session";
import { TopNav } from "@/components/top-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  const links = [{ href: "/admin", label: "Administração" }];

  return (
    <div className="min-h-screen bg-surface">
      <TopNav links={links} userName={session.user.name ?? ""} role={session.user.role} />
      <main className="max-w-6xl mx-auto px-3 sm:px-6 py-5 sm:py-8">{children}</main>
    </div>
  );
}
