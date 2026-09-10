"use client";

import { useState } from "react";
import { AlertTriangle, Plus, X } from "lucide-react";
import { RISCOS_PREDEFINIDOS } from "@/lib/patient-risks";

export function SeletorRiscos({
  riscos,
  onChange,
}: {
  riscos: string[];
  onChange: (novos: string[]) => void;
}) {
  const [personalizado, setPersonalizado] = useState("");

  function alternar(risco: string) {
    if (riscos.includes(risco)) {
      onChange(riscos.filter((r) => r !== risco));
    } else {
      onChange([...riscos, risco]);
    }
  }

  function adicionarPersonalizado() {
    const valor = personalizado.trim();
    if (!valor || riscos.includes(valor)) return;
    onChange([...riscos, valor]);
    setPersonalizado("");
  }

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-3">
        <AlertTriangle size={14} color="#B8452F" />
        <h3 className="text-lg font-display font-semibold text-ink">Riscos e alertas</h3>
      </div>
      <p className="text-sm text-inkSoft mb-4">
        Marque riscos que devem aparecer em destaque na ficha deste paciente para toda a equipe.
      </p>

      <div className="flex flex-wrap gap-2 mb-3">
        {RISCOS_PREDEFINIDOS.map((risco) => {
          const ativo = riscos.includes(risco);
          return (
            <button
              key={risco}
              type="button"
              onClick={() => alternar(risco)}
              className="text-xs px-3 py-1.5 rounded-full border transition-colors"
              style={
                ativo
                  ? { background: "#FBEAE5", borderColor: "#E8B4A8", color: "#B8452F" }
                  : { background: "transparent", borderColor: "#E4E7DE", color: "#8A8F7F" }
              }
            >
              {risco}
            </button>
          );
        })}
      </div>

      {riscos.filter((r) => !(RISCOS_PREDEFINIDOS as readonly string[]).includes(r)).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {riscos
            .filter((r) => !(RISCOS_PREDEFINIDOS as readonly string[]).includes(r))
            .map((risco) => (
              <span
                key={risco}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
                style={{ background: "#FBEAE5", color: "#B8452F" }}
              >
                {risco}
                <button type="button" onClick={() => onChange(riscos.filter((r) => r !== risco))}>
                  <X size={12} />
                </button>
              </span>
            ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          value={personalizado}
          onChange={(e) => setPersonalizado(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              adicionarPersonalizado();
            }
          }}
          placeholder="Outro risco específico..."
          className="flex-1 rounded-lg px-3.5 py-2.5 text-sm outline-none bg-surface border border-line"
        />
        <button
          type="button"
          onClick={adicionarPersonalizado}
          className="p-2.5 rounded-lg text-primary bg-primary-soft shrink-0"
        >
          <Plus size={15} />
        </button>
      </div>
    </div>
  );
}