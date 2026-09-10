import { AlertTriangle } from "lucide-react";

export function BadgesRisco({ riscos }: { riscos: string[] }) {
  if (riscos.length === 0) return null;

  return (
    <div className="rounded-lg p-3 mb-5" style={{ background: "#FBEAE5", border: "1px solid #E8B4A8" }}>
      <div className="flex items-center gap-1.5 mb-2">
        <AlertTriangle size={13} color="#B8452F" strokeWidth={2.5} />
        <p className="text-[11px] uppercase tracking-wide font-medium" style={{ color: "#B8452F" }}>
          Atenção
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {riscos.map((risco) => (
          <span
            key={risco}
            className="text-xs px-2.5 py-1 rounded-full"
            style={{ background: "#F3D5CC", color: "#8A3520" }}
          >
            {risco}
          </span>
        ))}
      </div>
    </div>
  );
}