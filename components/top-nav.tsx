"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut, ChevronDown, UserCog, Sprout, Menu, X, DoorOpen } from "lucide-react";
import { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";

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
  const filteredLinks = links.filter((l) =>
    l.href === "/admin" ? role === "ADMIN" : true,
  );

  const activeIndex = filteredLinks.findIndex(
    (l) => pathname === l.href || (l.href !== "/dashboard" && pathname.startsWith(l.href)),
  );

  const [open, setOpen] = useState(false);
  const [menuMobileOpen, setMenuMobileOpen] = useState(false);
  const [confirmSairAberto, setConfirmSairAberto] = useState(false);
  const [saindo, setSaindo] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const mobileRef = useRef<HTMLDivElement | null>(null);
  const trailRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const [marker, setMarker] = useState<{ left: number; width: number } | null>(null);

  const medirTrilha = useCallback(() => {
    const container = trailRef.current;
    const ativo = activeIndex >= 0 ? itemRefs.current[activeIndex] : null;
    if (!container || !ativo) {
      setMarker(null);
      return;
    }
    const cBox = container.getBoundingClientRect();
    const aBox = ativo.getBoundingClientRect();
    setMarker({ left: aBox.left - cBox.left, width: aBox.width });
  }, [activeIndex]);

  useLayoutEffect(() => {
    medirTrilha();
  }, [medirTrilha, pathname]);

  useEffect(() => {
    window.addEventListener("resize", medirTrilha);
    return () => window.removeEventListener("resize", medirTrilha);
  }, [medirTrilha]);

  useEffect(() => {
    setMenuMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (confirmSairAberto) {
          setConfirmSairAberto(false);
          return;
        }
        setOpen(false);
        setMenuMobileOpen(false);
      }
    }
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
      if (mobileRef.current && !mobileRef.current.contains(e.target as Node)) setMenuMobileOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [confirmSairAberto]);

  function pedirConfirmacaoSair() {
    setOpen(false);
    setMenuMobileOpen(false);
    setConfirmSairAberto(true);
  }

  function confirmarSaida() {
    setSaindo(true);
    signOut({ callbackUrl: "/login" });
  }

  const iniciais = userName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <div className="relative border-b border-line bg-white">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 flex items-center justify-between gap-4">
        <Link
          href="/dashboard"
          className="group flex items-center gap-2 shrink-0 transition-opacity hover:opacity-80"
        >
          <span
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:rotate-[12deg]"
            style={{ background: "#DCE5DA" }}
          >
            <Sprout size={14} color="#2C4B3E" strokeWidth={2.25} />
          </span>
          <span className="font-display italic font-semibold text-primary-dark text-lg">
            Alexia Câmara
          </span>
        </Link>

        {/* trilha de navegação — só desktop */}
        <div ref={trailRef} className="hidden md:flex relative items-center gap-1">
          <span aria-hidden className="absolute left-0 right-0 bottom-0 h-px" style={{ background: "#E4E7DE" }} />
          {marker && (
            <span
              aria-hidden
              className="absolute bottom-0 h-[2px] rounded-full transition-all duration-300 ease-out"
              style={{ left: marker.left, width: marker.width, background: "#3F6B58" }}
            />
          )}
          {filteredLinks.map((l, i) => {
            const ativo = i === activeIndex;
            return (
              <Link
                key={l.href}
                href={l.href}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                className="relative text-xs px-3 py-2.5 shrink-0 whitespace-nowrap transition-colors"
                style={{ color: ativo ? "#22291F" : "#8A8F7F" }}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        {/* menu de usuário — só desktop */}
        <div className="hidden md:flex items-center gap-2 shrink-0" ref={menuRef}>
          <div className="relative">
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full transition-colors hover:bg-surface"
              aria-expanded={open}
              aria-haspopup="menu"
              title="Abrir menu"
            >
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0"
                style={{ background: "#3F6B58", color: "#fff" }}
              >
                {iniciais || "?"}
              </span>
              <span className="text-xs text-inkFaint max-w-[120px] truncate">{userName}</span>
              <ChevronDown
                size={13}
                color="#8A8F7F"
                className="transition-transform duration-200"
                style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
              />
            </button>

            {open && (
              <div role="menu" className="absolute right-0 mt-2 w-44 rounded-lg bg-white border border-line shadow-lg z-50 overflow-hidden origin-top-right">
                <ul className="py-1">
                  <li>
                    <button
                      onClick={() => (window.location.href = "/dashboard/perfil")}
                      className="w-full text-left px-3.5 py-2.5 text-sm text-ink hover:bg-surface flex items-center gap-2.5"
                    >
                      <UserCog size={14} color="#5B6157" /> Meu perfil
                    </button>
                  </li>
                  <li className="border-t border-line">
                    <button
                      onClick={pedirConfirmacaoSair}
                      className="w-full text-left px-3.5 py-2.5 text-sm text-attention hover:bg-surface flex items-center gap-2.5"
                    >
                      <LogOut size={14} /> Sair
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* botão hambúrguer — só mobile */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuMobileOpen((v) => !v)}
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors hover:bg-surface"
            aria-expanded={menuMobileOpen}
            aria-haspopup="menu"
            title="Abrir menu"
          >
            {menuMobileOpen ? <X size={17} color="#22291F" /> : <Menu size={17} color="#22291F" />}
          </button>
        </div>
      </div>

      {/* painel mobile — mesma linguagem visual do dropdown desktop */}
      {menuMobileOpen && (
        <div ref={mobileRef} role="menu" className="md:hidden absolute left-0 right-0 top-full bg-white border-t border-line shadow-lg z-50">
          <div className="max-w-6xl mx-auto px-3 py-3">
            <div className="flex items-center gap-2.5 px-1 py-2.5 mb-1">
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                style={{ background: "#3F6B58", color: "#fff" }}
              >
                {iniciais || "?"}
              </span>
              <span className="text-sm text-ink truncate">{userName}</span>
            </div>

            <ul className="border-t border-line pt-1">
              {filteredLinks.map((l, i) => {
                const ativo = i === activeIndex;
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="flex items-center gap-2.5 px-2.5 py-2.5 text-sm rounded-md"
                      style={{ color: ativo ? "#22291F" : "#5B6157" }}
                    >
                      <span className="w-1 h-1 rounded-full shrink-0" style={{ background: ativo ? "#3F6B58" : "transparent" }} />
                      {l.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <ul className="border-t border-line pt-1 mt-1">
              <li>
                <button
                  onClick={() => (window.location.href = "/dashboard/perfil")}
                  className="w-full text-left px-2.5 py-2.5 text-sm text-ink hover:bg-surface rounded-md flex items-center gap-2.5"
                >
                  <UserCog size={14} color="#5B6157" /> Meu perfil
                </button>
              </li>
              <li>
                <button
                  onClick={pedirConfirmacaoSair}
                  className="w-full text-left px-2.5 py-2.5 text-sm text-attention hover:bg-surface rounded-md flex items-center gap-2.5"
                >
                  <LogOut size={14} /> Sair
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* modal de confirmação de saída */}
      {confirmSairAberto && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-confirmar-saida"
        >
          <div
            className="absolute inset-0 transition-opacity"
            style={{ background: "rgba(34, 41, 31, 0.35)", backdropFilter: "blur(2px)" }}
            onClick={() => !saindo && setConfirmSairAberto(false)}
          />

          <div className="relative w-full max-w-sm rounded-2xl bg-white border border-line shadow-xl p-6 sm:p-7">
            <span
              className="w-11 h-11 rounded-full flex items-center justify-center mb-4"
              style={{ background: "#F6E7C6" }}
            >
              <DoorOpen size={19} color="#9A6A1E" strokeWidth={2.25} />
            </span>

            <h3 id="titulo-confirmar-saida" className="text-lg font-display font-semibold text-ink mb-1.5">
              Encerrar sessão?
            </h3>
            <p className="text-sm leading-relaxed text-inkFaint mb-6">
              Você precisará entrar novamente com seu e-mail e senha para acessar o painel.
            </p>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setConfirmSairAberto(false)}
                disabled={saindo}
                className="flex-1 text-sm font-medium px-4 py-2.5 rounded-lg border border-line text-inkSoft transition-colors hover:bg-surface disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarSaida}
                disabled={saindo}
                className="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-lg text-white transition-colors disabled:opacity-70"
                style={{ background: "#B8452F" }}
              >
                <LogOut size={14} /> {saindo ? "Saindo..." : "Sim, sair"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}