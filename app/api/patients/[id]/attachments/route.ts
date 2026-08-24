import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeAcessarPaciente, podeEditarPaciente } from "@/lib/patient-access";
import { salvarArquivo, validarArquivo } from "@/lib/storage";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const acesso = await podeAcessarPaciente(session, params.id);
  if (!acesso) return NextResponse.json({ error: "Sem permissão." }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const evolutionId = searchParams.get("evolutionId");
  const somenteGerais = searchParams.get("geral") === "true";

  const attachments = await prisma.attachment.findMany({
    where: {
      patientId: params.id,
      ...(evolutionId ? { evolutionId } : somenteGerais ? { evolutionId: null } : {}),
    },
    orderBy: { uploadedAt: "desc" },
  });

  return NextResponse.json({ attachments });
}

// Upload real — multipart/form-data com campo "file" (pode enviar vários
// campos "file") e opcionalmente "evolutionId" para vincular a uma sessão.
// Sem evolutionId, o anexo fica no nível do paciente (geral).
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !podeEditarPaciente(session)) {
    return NextResponse.json({ error: "Sem permissão para anexar arquivos." }, { status: 403 });
  }

  const acesso = await podeAcessarPaciente(session, params.id);
  if (!acesso) return NextResponse.json({ error: "Paciente não encontrado ou sem permissão." }, { status: 404 });

  const formData = await req.formData();
  const evolutionId = formData.get("evolutionId");
  const files = formData.getAll("file").filter((f): f is File => f instanceof File);

  if (files.length === 0) {
    return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
  }

  if (typeof evolutionId === "string" && evolutionId) {
    const evolution = await prisma.evolution.findUnique({ where: { id: evolutionId } });
    if (!evolution || evolution.patientId !== params.id) {
      return NextResponse.json({ error: "Registro de evolução não encontrado." }, { status: 404 });
    }
  }

  const criados = [];
  for (const file of files) {
    const erroValidacao = validarArquivo(file);
    if (erroValidacao) {
      return NextResponse.json({ error: `${file.name}: ${erroValidacao}` }, { status: 400 });
    }

    const salvo = await salvarArquivo(file, params.id);
    const attachment = await prisma.attachment.create({
      data: {
        patientId: params.id,
        evolutionId: typeof evolutionId === "string" && evolutionId ? evolutionId : null,
        fileName: salvo.fileName,
        url: salvo.relativePath,
        fileType: salvo.fileType,
      },
    });
    criados.push(attachment);
  }

  return NextResponse.json({ attachments: criados }, { status: 201 });
}
