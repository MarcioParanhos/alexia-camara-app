"use client";

import { ReactNode, useState } from "react";

export type AbaMes = {
  chave: string;
  rotulo: string;
  total: number;
  conteudo: ReactNode;
};

export function AbasMes({ abas, chaveAtual }: { abas: AbaMes[]; chaveAtual: string }) {
  const [ativa, setAtiva] = useState<string | undefined>(
    abas.some((a) => a.chave === chaveAtual) ? chaveAtual : abas[0]?.chave,
  );
  const aba = abas.find((a) => a.chave === ativa);

  return (
    <div className="min-w-0">
      <div
        role="tablist"
        className="flex items-center gap-2 mb-5 overflow-x-auto pb-1"
        style={{ scrollbarWidth: "none" }}
      >
        {abas.map((a) => {
          const selecionada = a.chave === ativa;
          const eAtual = a.chave === chaveAtual;
          return (
            <button
              key={a.chave}
              role="tab"
              aria-selected={selecionada}
              onClick={() => setAtiva(a.chave)}
              className="flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-full shrink-0 whitespace-nowrap transition-colors box-shadow-card"
              style={{
                background: selecionada ? "#3F6B58" : "#fff",
                color: selecionada ? "#fff" : "#5B6157",
                border: `1px solid ${selecionada ? "#3F6B58" : "#DDD5C4"}`,
              }}
            >
              {eAtual && (
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: selecionada ? "#fff" : "#8EA66B" }}
                />
              )}
              {a.rotulo}
              <span
                className="text-[10px] px-1.5 rounded-full"
                style={{
                  background: selecionada ? "rgba(255,255,255,0.2)" : "#F1EEE4",
                  color: selecionada ? "#fff" : "#8A8F7F",
                }}
              >
                {a.total}
              </span>
            </button>
          );
        })}
      </div>

      <div role="tabpanel">{aba?.conteudo}</div>
    </div>
  );
}