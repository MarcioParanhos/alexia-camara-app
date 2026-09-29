"use client";

import { createContext, useCallback, useContext, useState, ReactNode } from "react";
import { CheckCircle2, AlertTriangle, XCircle, X } from "lucide-react";

type ToastTipo = "sucesso" | "erro" | "aviso";
type Toast = { id: string; mensagem: string; tipo: ToastTipo };

type ToastContextType = {
  mostrarToast: (mensagem: string, tipo?: ToastTipo) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

const ESTILOS: Record<ToastTipo, { bg: string; border: string; color: string; selo: string; Icon: typeof CheckCircle2 }> = {
  sucesso: { bg: "#FFFFFF", border: "#B9D4C4", color: "#2C4B3E", selo: "#DCE5DA", Icon: CheckCircle2 },
  erro: { bg: "#FFFFFF", border: "#E8B4A8", color: "#B8452F", selo: "#FBEAE5", Icon: XCircle },
  aviso: { bg: "#FFFFFF", border: "#EEDBA6", color: "#9A6A1E", selo: "#F6E7C6", Icon: AlertTriangle },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);

  const mostrarToast = useCallback((mensagem: string, tipo: ToastTipo = "sucesso") => {
    const id = Math.random().toString(36).slice(2);
    setToast({ id, mensagem, tipo });
    setTimeout(() => {
      setToast((atual) => (atual?.id === id ? null : atual));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ mostrarToast }}>
      {children}

      {toast && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 pointer-events-none"
          role="status"
          aria-live="polite"
        >
          <div
            className="pointer-events-auto relative w-full max-w-sm rounded-2xl bg-white border shadow-xl p-6 sm:p-7 text-center animate-in fade-in zoom-in-95 duration-200"
            style={{ borderColor: ESTILOS[toast.tipo].border }}
          >
            <button
              onClick={() => setToast(null)}
              className="absolute right-4 top-4 text-inkFaint hover:text-ink"
            >
              <X size={16} />
            </button>

            <span
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: ESTILOS[toast.tipo].selo }}
            >
              {(() => {
                const Icon = ESTILOS[toast.tipo].Icon;
                return <Icon size={26} color={ESTILOS[toast.tipo].color} strokeWidth={2.25} />;
              })()}
            </span>

            <p className="text-[15px] leading-relaxed font-display font-medium text-ink">
              {toast.mensagem}
            </p>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast precisa estar dentro de <ToastProvider>");
  return ctx.mostrarToast;
}