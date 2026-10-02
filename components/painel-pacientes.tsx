"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Calendar, ArrowRight } from "lucide-react";
import { Avatar } from "@/components/avatar";

export type PacienteResumo = {
  id: string;
  name: string;
  diagnosis: string | null;
  idade: number | null;
  adesao: number | null;
  ultima: Date | null;
};

const FILTROS = [
  { key: "todos", label: "Todos", labelCurto: "Todos" },
  { key: "dia", label: "Em dia", labelCurto: "Em dia" },
  { key: "atencao", label: "Atenção necessária", labelCurto: "Atenção" },
] as const;

function corStatus(adesao: number | null) {
  if (adesao === null) return "#C7CBC0";
  if (adesao >= 85) return "#3F6B58";
  if (adesao >= 60) return "#B9812F";
  return "#A94A3D";
}

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

  const contagens = useMemo(
    () => ({
      todos: pacientes.length,
      dia: pacientes.filter((p) => p.adesao !== null && p.adesao >= 80).length,
      atencao: pacientes.filter((p) => p.adesao !== null && p.adesao < 80).length,
    }),
    [pacientes],
  );

  return (
    <div className="w-full min-w-0">
      <div className="flex items-center gap-2 rounded-lg px-3.5 py-2.5 mb-4 box-shadow-card bg-white border border-line transition-colors focus-within:border-primary">
        <Search size={15} className="text-inkFaint shrink-0" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar paciente pelo nome..."
          className="bg-transparent outline-none w-full text-sm min-w-0"
        />
      </div>

      <div className="grid grid-cols-3 gap-2 mb-6 sm:flex sm:items-center sm:gap-2">
  {FILTROS.map((f) => (
    <button
      key={f.key}
      onClick={() => setFiltro(f.key)}
      className="flex items-center justify-center gap-1.5 text-xs px-2 sm:px-3.5 py-1.5 rounded-full whitespace-nowrap transition-colors box-shadow-card"
      style={{
        background: filtro === f.key ? "#3F6B58" : "#fff",
        color: filtro === f.key ? "#fff" : "#5B6157",
        border: `1px solid ${filtro === f.key ? "#3F6B58" : "#DDD5C4"}`,
      }}
    >
      <span className="truncate">
        <span className="sm:hidden">{f.labelCurto}</span>
        <span className="hidden sm:inline">{f.label}</span>
      </span>
      <span
        className="text-[10px] px-1.5 rounded-full shrink-0"
        style={{
          background: filtro === f.key ? "rgba(255,255,255,0.2)" : "#F1EEE4",
          color: filtro === f.key ? "#fff" : "#8A8F7F",
        }}
      >
        {contagens[f.key]}
      </span>
    </button>
  ))}
</div>

      {filtrados.length === 0 ? (
        <div className="rounded-xl p-10 text-center bg-white border border-dashed border-line box-shadow-card">
          <Search size={18} className="mx-auto mb-3 text-inkFaint" />
          <p className="text-sm text-inkFaint">
            {pacientes.length === 0 ? "Nenhum paciente cadastrado ainda." : "Nenhum paciente encontrado com esses filtros."}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4 w-full min-w-0">
          {filtrados.map((p) => {
            const cor = corStatus(p.adesao);
            const progresso = p.adesao ?? 0;
            return (
              <Link
                key={p.id}
                href={`/dashboard/pacientes/${p.id}`}
                className="group relative text-left rounded-xl p-5 transition-all hover:-translate-y-0.5 bg-white border block box-shadow-card w-full min-w-0 overflow-hidden"
                style={{ borderColor: "#E4E7DE" }}
              >
                <div className="flex items-start flex-wrap gap-y-2 gap-x-3.5 mb-4">
                  {/* anel de progresso ao redor do avatar — a trilha, em miniatura */}
                  <div
                    className="relative shrink-0 rounded-full p-[3px]"
                    style={{
                      background:
                        p.adesao === null
                          ? "#E4E7DE"
                          : `conic-gradient(${cor} ${progresso * 3.6}deg, #E9E6DA ${progresso * 3.6}deg)`,
                    }}
                  >
                    <div className="rounded-full bg-white p-[2px]">
                      <Avatar nome={p.name} />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 pt-0.5 basis-[140px]">
                    <p className="text-[15px] truncate font-display font-semibold text-ink">{p.name}</p>
                    <p className="text-xs mt-0.5 text-inkFaint">
                      {p.idade !== null ? `${p.idade} anos` : "Idade não informada"}
                    </p>
                  </div>

                  {p.adesao !== null && p.adesao < 80 && (
                    <span className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full shrink-0 bg-attention-soft text-attention ml-auto">
                      <span className="w-1 h-1 rounded-full bg-attention shrink-0" /> Atenção
                    </span>
                  )}
                </div>

                <p className="text-[13px] leading-relaxed mb-4 line-clamp-2 text-inkSoft break-words">
                  {p.diagnosis || "Diagnóstico não informado"}
                </p>

                <div className="flex items-center justify-between gap-3 pt-3 border-t border-line">
                  <span className="flex items-center gap-1.5 text-[11px] shrink-0 text-inkFaint">
                    <Calendar size={11} />
                    {p.ultima ? formatarData(p.ultima) : "Sem registros"}
                  </span>

                  <div className="flex items-center gap-2 shrink-0">
                    {p.adesao !== null && (
                      <span className="text-xs font-mono tabular-nums" style={{ color: cor }}>
                        {p.adesao}%
                      </span>
                    )}
                    <ArrowRight
                      size={13}
                      className="text-inkFaint transition-transform group-hover:translate-x-0.5 group-hover:text-ink"
                    />
                  </div>
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