import { requireFamily } from "@/lib/session";
import { TopNav } from "@/components/top-nav";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await requireFamily();

  return (
    <div className="min-h-screen bg-surface">
      <TopNav links={[{ href: "/portal", label: "Acompanhamento" }]} userName={session.user.name ?? ""} role={session.user.role} />
      <main className="max-w-6xl mx-auto px-3 sm:px-6 py-5 sm:py-8">{children}</main>
    </div>
  );
}
