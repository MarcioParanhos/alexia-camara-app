import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credenciais",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Informe e-mail e senha.");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
          include: {
            professional: true,
            familyMemberships: {
              where: { status: "ATIVO" },
              select: { patientId: true },
            },
          },
        });

        if (!user || !user.active) {
          throw new Error("E-mail ou senha inválidos.");
        }

        const senhaValida = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!senhaValida) {
          throw new Error("E-mail ou senha inválidos.");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          professionalId: user.professional?.id ?? null,
          patientIds: user.familyMemberships.map((f) => f.patientId),
        };
      },
    }),
  ],
  callbacks: {
    // Roda no login e sempre que a sessão é lida — mantém o token enxuto
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.professionalId = user.professionalId ?? null;
        token.patientIds = user.patientIds ?? [];
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "PROFISSIONAL" | "FAMILIAR";
        session.user.professionalId = (token.professionalId as string) ?? null;
        session.user.patientIds = (token.patientIds as string[]) ?? [];
      }
      return session;
    },
  },
};
