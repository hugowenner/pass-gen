/**
 * Criptografia e geração do link de compartilhamento.
 * Tudo acontece no navegador via Web Crypto API — não há backend, banco de
 * dados ou login. A senha só existe dentro do token criptografado do link.
 */

const IV_LENGTH = 12; // bytes recomendado para AES-GCM
const EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 horas

export interface SharedPassword {
  empresa: string;
  senha: string;
  createdAt: number; // epoch ms
}

export interface RevealResult {
  empresa: string;
  senha: string;
  expired: boolean;
}

function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function toUrlSafeBase64(base64: string): string {
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromUrlSafeBase64(input: string): string {
  let base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }
  return base64;
}

/**
 * Criptografa a senha (empresa + senha + data de criação) com AES-256-GCM
 * e retorna um token pronto para ir na URL (/view/TOKEN).
 */
export async function createShareLink(empresa: string, senha: string): Promise<string> {
  const payload: SharedPassword = {
    empresa: empresa.trim() || "Sem nome",
    senha,
    createdAt: Date.now(),
  };

  const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, [
    "encrypt",
    "decrypt",
  ]);
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const plaintext = new TextEncoder().encode(JSON.stringify(payload));

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    plaintext as BufferSource
  );
  const rawKey = await crypto.subtle.exportKey("raw", key);

  const token = {
    k: bufferToBase64(rawKey),
    iv: bufferToBase64(iv),
    c: bufferToBase64(ciphertext),
  };

  const json = new TextEncoder().encode(JSON.stringify(token));
  return toUrlSafeBase64(bufferToBase64(json));
}

/**
 * Descriptografa o token do link e verifica se passou de 24 horas.
 * Lança erro se o token estiver corrompido/inválido.
 */
export async function revealSharedPassword(token: string): Promise<RevealResult> {
  const jsonBytes = base64ToBuffer(fromUrlSafeBase64(token));
  const json = new TextDecoder().decode(jsonBytes);
  const parsed = JSON.parse(json) as { k: string; iv: string; c: string };

  const rawKey = base64ToBuffer(parsed.k);
  const iv = base64ToBuffer(parsed.iv);
  const ciphertext = base64ToBuffer(parsed.c);

  const key = await crypto.subtle.importKey("raw", rawKey as BufferSource, "AES-GCM", false, [
    "decrypt",
  ]);
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    ciphertext as BufferSource
  );
  const payload = JSON.parse(new TextDecoder().decode(plaintext)) as SharedPassword;

  const expired = Date.now() - payload.createdAt > EXPIRATION_MS;

  return {
    empresa: payload.empresa,
    senha: expired ? "" : payload.senha,
    expired,
  };
}

/**
 * Copia um texto para a área de transferência.
 */
export async function copyClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
