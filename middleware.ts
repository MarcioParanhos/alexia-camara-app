import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * Regras de acesso por área:
 * - /admin        -> só ADMIN (gestão de usuários, profissionais)
 * - /dashboard    -> ADMIN e PROFISSIONAL (painel, pacientes, evoluções, relatórios)
 * - /portal       -> FAMILIAR (visão somente-leitura do paciente vinculado)
 * - /acesso/[token] -> público, validado à parte via AccessLink (não passa por aqui)
 * - /login        -> público
 */
export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role;

    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/nao-autorizado", req.url));
    }

    if (pathname.startsWith("/dashboard") && role !== "ADMIN" && role !== "PROFISSIONAL") {
      return NextResponse.redirect(new URL("/nao-autorizado", req.url));
    }

    if (pathname.startsWith("/portal") && role !== "FAMILIAR" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/nao-autorizado", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Só exige estar logado — as regras de papel acima decidem o resto
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/portal/:path*"],
};
