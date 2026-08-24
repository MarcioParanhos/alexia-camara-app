// Mesmos tokens usados na prévia visual e no tailwind.config.ts —
// centralizados aqui para uso em estilos inline (gradientes, SVGs).
export const C = {
  bg: "#FAF8F3",
  surface: "#F1ECE1",
  surfaceAlt: "#EBE6D9",
  card: "#FFFFFF",
  ink: "#22291F",
  inkSoft: "#5B6157",
  inkFaint: "#8A8F7F",
  primary: "#3F6B58",
  primaryDark: "#2C4B3E",
  primarySoft: "#DCE5DA",
  accent: "#B9812F",
  accentSoft: "#F1E2C2",
  attention: "#A94A3D",
  attentionSoft: "#F3DAD5",
  line: "#DDD5C4",
} as const;

export const CORES_FASE = [C.primary, C.accent, "#6B5B95", C.attention, "#3F7C8C"];
