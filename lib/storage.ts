import { randomUUID } from "crypto";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { r2, R2_BUCKET } from "@/lib/r2";

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
 * Envia o arquivo para o bucket R2 em patients/{patientId}/{uuid-extensao}
 * e retorna a "key" do objeto (guardada em Attachment.url) e o nome
 * original (guardado em Attachment.fileName).
 *
 * O bucket é PRIVADO — arquivos só são acessíveis via URL assinada
 * temporária, gerada em /api/files/[attachmentId] após checar a sessão.
 */
export async function salvarArquivo(file: File, patientId: string) {
  const extensao = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")) : "";
  const nomeArmazenado = `${randomUUID()}${extensao}`;
  const key = `patients/${patientId}/${nomeArmazenado}`;

  const bytes = Buffer.from(await file.arrayBuffer());

  await r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: bytes,
      ContentType: file.type || "application/octet-stream",
    }),
  );

  return {
    relativePath: key,
    fileName: file.name,
    fileType: file.type || "application/octet-stream",
  };
}

export async function removerArquivo(key: string) {
  try {
    await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
  } catch {
    // se o objeto já não existe no bucket, ainda assim seguimos removendo o registro
  }
}