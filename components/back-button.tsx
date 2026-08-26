"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="group  inline-flex items-center text-white bg-[#3F6B58] gap-1.5 rounded-md px-2 py-2 text-xs font-medium  transition-colors hover:text-ink hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10"
    >
      <ArrowLeft
        className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5"
        strokeWidth={2}
      />
     Voltar
    </button>
  );
}
