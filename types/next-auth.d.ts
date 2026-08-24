import { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

type Role = "ADMIN" | "PROFISSIONAL" | "FAMILIAR";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      professionalId: string | null;
      /** IDs dos pacientes que este usuário (familiar) pode acompanhar */
      patientIds: string[];
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: Role;
    professionalId: string | null;
    patientIds: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: Role;
    professionalId: string | null;
    patientIds: string[];
  }
}
