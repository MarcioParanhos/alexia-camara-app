import { C } from "@/lib/design-tokens";

export function Avatar({ nome, size = 44 }: { nome: string; size?: number }) {
  const iniciais = nome
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
  return (
    <div
      className="flex items-center justify-center rounded-full shrink-0 font-display font-semibold"
      style={{
        width: size,
        height: size,
        background: C.primarySoft,
        color: C.primaryDark,
        fontSize: size * 0.36,
      }}
    >
      {iniciais}
    </div>
  );
}
