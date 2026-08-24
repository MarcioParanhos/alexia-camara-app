"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function TopNav({
  links,
  userName,
  role,
}: {
  links: { href: string; label: string }[];
  userName: string;
  role?: string | null;
}) {
  const pathname = usePathname();
  const filteredLinks = links.filter((l) => (l.href === "/admin" ? role === "ADMIN" : true));
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, []);

  return (
    <div className="border-b border-line bg-white">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 flex items-center justify-between gap-4">
        <span className="font-display italic font-semibold text-primary-dark text-lg shrink-0">Alexia Câmara</span>

        <div className="flex items-center gap-1 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {filteredLinks.map((l) => {
            const ativo = pathname === l.href || (l.href !== "/dashboard" && pathname.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                className="text-xs px-3 py-2 rounded-full shrink-0 whitespace-nowrap"
                style={{
                  background: ativo ? "#3F6B58" : "transparent",
                  color: ativo ? "#fff" : "#5B6157",
                }}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3 shrink-0" ref={menuRef}>
          <span className="text-xs text-inkFaint hidden sm:inline">{userName}</span>

          <div className="relative">
            <button
              onClick={() => setOpen((v) => !v)}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-surface"
              aria-expanded={open}
              aria-haspopup="menu"
              title="Abrir menu"
            >
              <ChevronDown size={14} color="#5B6157" />
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-40 rounded-md bg-white border border-line shadow-sm z-50">
                <ul className="py-1">
                  <li>
                    <button
                      onClick={() => signOut({ callbackUrl: "/login" })}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-surface flex items-center gap-2"
                    >
                      <LogOut size={14} /> Sair
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
