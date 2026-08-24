import { C } from "@/lib/design-tokens";

export function MiniTrilha({ nivel }: { nivel: number }) {
  const cor = nivel >= 85 ? C.primary : nivel >= 60 ? C.accent : C.attention;
  const x = 4 + (nivel / 100) * 112;
  return (
    <svg width="120" height="20" style={{ overflow: "visible" }}>
      <path d="M4,10 C 34,-4 54,24 84,10 C 96,5 108,10 116,10" fill="none" stroke={C.surfaceAlt} strokeWidth="3" strokeLinecap="round" />
      <path
        d="M4,10 C 34,-4 54,24 84,10 C 96,5 108,10 116,10"
        fill="none"
        stroke={cor}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="160"
        strokeDashoffset={160 - (nivel / 100) * 160}
      />
      <circle cx={x} cy="10" r="4.5" fill={C.card} stroke={cor} strokeWidth="2.5" />
    </svg>
  );
}
