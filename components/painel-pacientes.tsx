"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { MiniTrilha } from "@/components/mini-trilha";

export type PacienteResumo = {
  id: string;
  name: string;
  diagnosis: string | null;
  idade: number | null;
  adesao: number | null;
  ultima: Date | null;
};

const FILTROS = [
  { key: "todos", label: "Todos" },
  { key: "dia", label: "Em dia" },
  { key: "atencao", label: "Atenção necessária" },
] as const;

export function PainelPacientes({ pacientes }: { pacientes: PacienteResumo[] }) {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<(typeof FILTROS)[number]["key"]>("todos");

  const filtrados = useMemo(() => {
    return pacientes
      .filter((p) => p.name.toLowerCase().includes(busca.trim().toLowerCase()))
      .filter((p) => {
        if (filtro === "todos") return true;
        if (p.adesao === null) return false;
        return filtro === "dia" ? p.adesao >= 80 : p.adesao < 80;
      });
  }, [pacientes, busca, filtro]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
        <div className="flex items-center gap-2 rounded-lg px-3.5 py-2.5 flex-1 bg-white border border-line">
          <Search size={15} className="text-inkFaint shrink-0" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar paciente pelo nome..."
            className="bg-transparent outline-none w-full text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {FILTROS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFiltro(f.key)}
            className="text-xs px-3.5 py-1.5 rounded-full shrink-0 whitespace-nowrap"
            style={{
              background: filtro === f.key ? "#3F6B58" : "#fff",
              color: filtro === f.key ? "#fff" : "#5B6157",
              border: `1px solid ${filtro === f.key ? "#3F6B58" : "#DDD5C4"}`,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtrados.length === 0 ? (
        <div className="rounded-xl p-10 text-center bg-white border border-dashed border-line">
          <Search size={18} className="mx-auto mb-3 text-inkFaint" />
          <p className="text-sm text-inkFaint">
            {pacientes.length === 0 ? "Nenhum paciente cadastrado ainda." : "Nenhum paciente encontrado com esses filtros."}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtrados.map((p) => {
            const cor = p.adesao === null ? "#8A8F7F" : p.adesao >= 85 ? "#3F6B58" : p.adesao >= 60 ? "#B9812F" : "#A94A3D";
            return (
              <Link
                key={p.id}
                href={`/dashboard/pacientes/${p.id}`}
                className="relative text-left rounded-xl p-5 pl-6 overflow-hidden transition-shadow hover:shadow-lg bg-white border border-line block"
              >
                <span className="absolute left-0 top-0 bottom-0 w-1.5" style={{ background: cor }} />
                <div className="flex items-start gap-3 mb-3.5">
                  <Avatar nome={p.name} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] truncate font-display font-semibold text-ink">{p.name}</p>
                    <p className="text-xs mt-0.5 text-inkFaint">{p.idade !== null ? `${p.idade} anos` : "Idade não informada"}</p>
                  </div>
                  {p.adesao !== null && p.adesao < 80 && (
                    <span className="text-[10px] px-2 py-1 rounded-full shrink-0 bg-attention-soft text-attention">Atenção</span>
                  )}
                </div>
                <p className="text-[13px] leading-relaxed mb-4 line-clamp-2 text-inkSoft">{p.diagnosis || "Diagnóstico não informado"}</p>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] shrink-0 text-inkFaint">
                    {p.ultima ? `Última sessão: ${formatarData(p.ultima)}` : "Sem registros ainda"}
                  </span>
                  {p.adesao !== null && (
                    <div className="flex items-center gap-2">
                      <MiniTrilha nivel={p.adesao} />
                      <span className="text-xs shrink-0 font-mono text-ink">{p.adesao}%</span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatarData(data: Date) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(data));
}
