import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seedando banco de dados...");

  // ---------------------------------------------------------------
  // Admin (pode ser a própria Alexia, com dois papéis se preferir
  // mais tarde — aqui um usuário admin separado, e a Alexia como
  // profissional)
  // ---------------------------------------------------------------
  const senhaAdmin = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@alexiacamara.com.br" },
    update: {},
    create: {
      name: "Administração",
      email: "admin@alexiacamara.com.br",
      passwordHash: senhaAdmin,
      role: "ADMIN",
    },
  });

  // ---------------------------------------------------------------
  // Profissional — Alexia Câmara
  // ---------------------------------------------------------------
  const senhaAlexia = await bcrypt.hash("alexia123", 10);
  const userAlexia = await prisma.user.upsert({
    where: { email: "alexia@alexiacamara.com.br" },
    update: {},
    create: {
      name: "Alexia Câmara",
      email: "alexia@alexiacamara.com.br",
      passwordHash: senhaAlexia,
      role: "PROFISSIONAL",
    },
  });

  const alexia = await prisma.professional.upsert({
    where: { userId: userAlexia.id },
    update: {},
    create: {
      userId: userAlexia.id,
      crefito: "12345-F",
      specialty: "Ortopedia e traumatologia",
      bio: "Fisioterapeuta especializada em reabilitação ortopédica e esportiva, com foco em recuperação funcional.",
      clinicName: "Estúdio Alexia Câmara — Fisioterapia",
      brandColor: "#3F6B58",
    },
  });

  // ---------------------------------------------------------------
  // Paciente — Marina (mesma da prévia visual)
  // ---------------------------------------------------------------
  const marina = await prisma.patient.create({
    data: {
      professionalId: alexia.id,
      name: "Marina Souza Lima",
      birthDate: new Date("1992-05-14"),
      phone: "(71) 99123-4567",
      email: "marina.souza@email.com",
      diagnosis: "Reabilitação de LCA — joelho direito",
      referredBy: "Dr. Ricardo Nunes — Ortopedia",
      clinicalHistory: "Cirurgia de reconstrução de LCA em fev/2026. Sem comorbidades relevantes.",
      startDate: new Date("2026-03-12"),
      status: "EM_TRATAMENTO",
    },
  });

  // Fases da trilha
  const [faseDor, faseForca, faseFuncional] = await Promise.all([
    prisma.treatmentPhase.create({
      data: {
        patientId: marina.id,
        name: "Redução da dor e edema",
        objective: "Controlar inflamação e dor aguda",
        order: 1,
        plannedSessions: 6,
        color: "#3F6B58",
      },
    }),
    prisma.treatmentPhase.create({
      data: {
        patientId: marina.id,
        name: "Ganho de amplitude e força",
        objective: "Recuperar ADM completa e força de quadríceps",
        order: 2,
        plannedSessions: 10,
        color: "#B9812F",
      },
    }),
    prisma.treatmentPhase.create({
      data: {
        patientId: marina.id,
        name: "Retorno funcional",
        objective: "Marcha, escadas e atividades do dia a dia",
        order: 3,
        plannedSessions: 8,
        color: "#6B5B95",
      },
    }),
  ]);

  // Evoluções de exemplo
  await prisma.evolution.createMany({
    data: [
      {
        patientId: marina.id,
        phaseId: faseForca.id,
        authorId: userAlexia.id,
        title: "Sessão 24 — Fortalecimento",
        note: "Boa evolução na flexão de joelho. Paciente relata menos instabilidade ao subir escadas. Mantido protocolo de fortalecimento de quadríceps.",
        painLevel: 2,
        romDegrees: 118,
        highlighted: true,
        sessionDate: new Date("2026-08-10"),
      },
      {
        patientId: marina.id,
        phaseId: faseForca.id,
        authorId: userAlexia.id,
        title: "Sessão 23 — Propriocepção",
        note: "Introduzidos exercícios em superfície instável. Leve desconforto ao final da sessão, dentro do esperado.",
        painLevel: 3,
        romDegrees: 112,
        sessionDate: new Date("2026-08-05"),
      },
      {
        patientId: marina.id,
        phaseId: faseForca.id,
        authorId: userAlexia.id,
        title: "Sessão 21 — Reavaliação mensal",
        note: "Reavaliação com ganho de 15° de amplitude desde o mês anterior. Força de quadríceps grau 4/5.",
        painLevel: 3,
        romDegrees: 105,
        sessionDate: new Date("2026-07-29"),
      },
    ],
  });

  // Familiar já ativo (Carla, mãe da Marina)
  const senhaCarla = await bcrypt.hash("familia123", 10);
  const userCarla = await prisma.user.upsert({
    where: { email: "carla.souza@email.com" },
    update: {},
    create: {
      name: "Carla Souza Lima",
      email: "carla.souza@email.com",
      passwordHash: senhaCarla,
      role: "FAMILIAR",
    },
  });

  await prisma.familyMember.upsert({
    where: { patientId_email: { patientId: marina.id, email: "carla.souza@email.com" } },
    update: {},
    create: {
      patientId: marina.id,
      userId: userCarla.id,
      name: "Carla Souza Lima",
      relationship: "Mãe",
      email: "carla.souza@email.com",
      status: "ATIVO",
    },
  });

  console.log("Seed concluído.");
  console.log("Login admin:        admin@alexiacamara.com.br / admin123");
  console.log("Login profissional: alexia@alexiacamara.com.br / alexia123");
  console.log("Login familiar:     carla.souza@email.com / familia123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
