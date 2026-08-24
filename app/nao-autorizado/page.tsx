import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function NaoAutorizado() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-surface">
      <div className="text-center max-w-sm">
        <ShieldAlert size={28} className="mx-auto mb-4 text-attention" />
        <h1 className="text-xl font-display font-semibold text-ink mb-2">Acesso não autorizado</h1>
        <p className="text-sm text-inkSoft mb-6">
          Sua conta não tem permissão para acessar esta área do sistema.
        </p>
        <Link href="/" className="text-sm text-primary underline">
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
