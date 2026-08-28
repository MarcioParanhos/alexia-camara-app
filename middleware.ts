import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * Regras de acesso por área:
 * - /admin        -> só ADMIN (gestão de usuários, profissionais)
 * - /dashboard    -> só PROFISSIONAL (painel, pacientes, evoluções, relatórios)
 * - /portal       -> só FAMILIAR (visão somente-leitura do paciente vinculado)
 * - /acesso/[token] -> público, validado à parte via AccessLink (não passa por aqui)
 * - /login        -> público
 *
 * ADMIN não navega pelas áreas operacionais — é redirecionado direto para /admin.
 */
export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role;

    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/nao-autorizado", req.url));
    }

    if (pathname.startsWith("/dashboard")) {
      if (role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      if (role !== "PROFISSIONAL") {
        return NextResponse.redirect(new URL("/nao-autorizado", req.url));
      }
    }

    if (pathname.startsWith("/portal")) {
      if (role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      if (role !== "FAMILIAR") {
        return NextResponse.redirect(new URL("/nao-autorizado", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
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