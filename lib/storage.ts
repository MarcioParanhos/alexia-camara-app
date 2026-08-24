import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

// Guardado FORA de /public de propósito: dados de paciente são sensíveis,
// então o arquivo só é servido através de /api/files/[attachmentId],
// que confere a sessão antes de entregar qualquer coisa.
const UPLOAD_ROOT = path.join(process.cwd(), "uploads");

const TIPOS_PERMITIDOS = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const TAMANHO_MAXIMO_BYTES = 15 * 1024 * 1024; // 15MB

export function validarArquivo(file: File) {
  if (file.size > TAMANHO_MAXIMO_BYTES) {
    return "Arquivo maior que 15MB.";
  }
  if (file.type && !TIPOS_PERMITIDOS.includes(file.type)) {
    return "Tipo de arquivo não suportado. Envie imagem, PDF ou documento do Word.";
  }
  return null;
}

/**
 * Salva o arquivo em uploads/patients/{patientId}/{uuid-nome-original}
 * e retorna o caminho relativo (guardado em Attachment.url) e o nome
 * original (guardado em Attachment.fileName).
 */
export async function salvarArquivo(file: File, patientId: string) {
  const dir = path.join(UPLOAD_ROOT, "patients", patientId);
  await mkdir(dir, { recursive: true });

  const extensao = path.extname(file.name) || "";
  const nomeArmazenado = `${randomUUID()}${extensao}`;
  const caminhoAbsoluto = path.join(dir, nomeArmazenado);

  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(caminhoAbsoluto, bytes);

  const caminhoRelativo = path.join("patients", patientId, nomeArmazenado);

  return {
    relativePath: caminhoRelativo,
    fileName: file.name,
    fileType: file.type || "application/octet-stream",
  };
}

export async function removerArquivo(relativePath: string) {
  try {
    await unlink(path.join(UPLOAD_ROOT, relativePath));
  } catch {
    // se o arquivo já não existe em disco, ainda assim seguimos removendo o registro
  }
}

export function caminhoAbsoluto(relativePath: string) {
  return path.join(UPLOAD_ROOT, relativePath);
}
