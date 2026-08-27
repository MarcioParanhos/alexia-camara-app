-- CreateEnum
CREATE TYPE "ProfessionalInviteStatus" AS ENUM ('PENDENTE', 'ACEITO');

-- CreateTable
CREATE TABLE "professional_invites" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" "ProfessionalInviteStatus" NOT NULL DEFAULT 'PENDENTE',
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),

    CONSTRAINT "professional_invites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "professional_invites_email_key" ON "professional_invites"("email");

-- CreateIndex
CREATE UNIQUE INDEX "professional_invites_token_key" ON "professional_invites"("token");
