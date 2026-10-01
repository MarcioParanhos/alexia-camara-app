import { AlertTriangle } from "lucide-react";

export function BadgesRisco({ riscos }: { riscos: string[] }) {
  if (riscos.length === 0) return null;

  return (
    <div
      className="relative rounded-xl mb-5 overflow-hidden"
      style={{ background: "#FFF9F7", border: "1px solid #E8B4A8" }}
    >
      {/* textura diagonal sutil — sinaliza "atenção" sem ser literal demais */}
      <svg
        aria-hidden
        className="absolute inset-0 w-full h-full opacity-[0.05] pointer-events-none"
        preserveAspectRatio="none"
      >
        <pattern id="riscoHachura" width="10" height="10" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="10" stroke="#B8452F" strokeWidth="4" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#riscoHachura)" />
      </svg>

      <div className="relative p-4">
        <div className="flex items-center gap-2.5 mb-3">
          <span className="relative flex items-center justify-center w-7 h-7 rounded-full shrink-0" style={{ background: "#B8452F" }}>
            <span className="absolute inline-flex h-full w-full rounded-full opacity-40 animate-ping" style={{ background: "#B8452F" }} />
            <AlertTriangle size={13} color="#fff" strokeWidth={2.5} className="relative" />
          </span>
          <p className="text-[11px] uppercase tracking-[0.14em] font-semibold" style={{ color: "#8A3520" }}>
            Atenção clínica
          </p>
        </div>

        <ul className="space-y-1.5">
          {riscos.map((risco) => (
            <li
              key={risco}
              className="flex items-center gap-2 text-[13px] leading-snug font-medium"
              style={{ color: "#8A3520" }}
            >
              <span className="w-1 h-1 rounded-full shrink-0" style={{ background: "#B8452F" }} />
              {risco}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}