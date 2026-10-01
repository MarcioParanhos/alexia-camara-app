"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="group inline-flex items-center gap-2 rounded-full pl-1.5 pr-4 py-1.5 text-xs font-medium text-white transition-all hover:gap-2.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#3F6B58]"
      style={{ background: "#3F6B58" }}
    >
      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/15 transition-transform group-hover:-translate-x-0.5">
        <ArrowLeft size={13} strokeWidth={2.5} />
      </span>
      Voltar
    </button>
  );
}