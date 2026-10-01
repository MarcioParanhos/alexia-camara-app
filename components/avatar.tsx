const PALETA_AVATAR = [
  { from: "#DCE5DA", to: "#B9D4C4", text: "#2C4B3E" }, // pinho
  { from: "#F1E2C2", to: "#E6C98A", text: "#8A5A1E" }, // ocre
  { from: "#E3DCF0", to: "#C7B8E0", text: "#4A3A6B" }, // ameixa
  { from: "#F3D5CC", to: "#E6AC9A", text: "#8A3520" }, // terracota
  { from: "#D4E6EA", to: "#A8CDD4", text: "#1E5A66" }, // petróleo
];

function corParaNome(nome: string) {
  let hash = 0;
  for (let i = 0; i < nome.length; i++) {
    hash = nome.charCodeAt(i) + ((hash << 5) - hash);
  }
  const indice = Math.abs(hash) % PALETA_AVATAR.length;
  return PALETA_AVATAR[indice];
}

export function Avatar({ nome, size = 44 }: { nome: string; size?: number }) {
  const iniciais = nome
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const cor = corParaNome(nome);

  return (
    <div
      className="flex items-center justify-center rounded-full shrink-0 font-display font-semibold select-none"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(155deg, ${cor.from}, ${cor.to})`,
        color: cor.text,
        fontSize: size * 0.36,
      }}
    >
      {iniciais}
    </div>
  );
}