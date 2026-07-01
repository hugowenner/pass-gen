/**
 * Toda a criptografia acontece exclusivamente no navegador usando a Web Crypto API.
 * Nenhuma senha, chave de proteção ou payload decifrado é enviado a um servidor.
 */

const PBKDF2_ITERATIONS = 250_000;
const SALT_LENGTH = 16; // bytes
const IV_LENGTH = 12; // bytes recomendado para AES-GCM

export interface ShareMetadata {
  empresa: string;
  data: string;
  hora: string;
}

interface EncryptedToken extends ShareMetadata {
  salt: string; // base64
  iv: string; // base64
  ciphertext: string; // base64 (contém apenas a senha criptografada)
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
 * Cria o objeto que representa o compartilhamento (sem a senha em si,
 * que é criptografada separadamente e nunca fica em texto puro no token).
 */
export function createSecurePayload(empresa: string): ShareMetadata {
  const now = new Date();
  const data = now.toLocaleDateString("pt-BR");
  const hora = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return { empresa: empresa.trim(), data, hora };
}

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase) as BufferSource,
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Criptografa a senha com AES-256-GCM usando uma chave derivada via PBKDF2.
 * Retorna um token Base64 (URL-safe) pronto para ir no fragmento da URL.
 * A empresa/data/hora ficam legíveis para identificar o compartilhamento,
 * mas a senha em si nunca é exposta sem a chave de proteção correta.
 */
export async function encryptPayload(
  senha: string,
  meta: ShareMetadata,
  passphrase: string
): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await deriveKey(passphrase, salt);

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    new TextEncoder().encode(senha) as BufferSource
  );

  const token: EncryptedToken = {
    empresa: meta.empresa,
    data: meta.data,
    hora: meta.hora,
    salt: bufferToBase64(salt),
    iv: bufferToBase64(iv),
    ciphertext: bufferToBase64(ciphertext),
  };

  const json = JSON.stringify(token);
  const jsonBytes = new TextEncoder().encode(json);
  return toUrlSafeBase64(bufferToBase64(jsonBytes));
}

/**
 * Lê apenas os metadados (empresa/data/hora) do token, sem exigir a chave
 * de proteção. A senha permanece criptografada até a etapa de revelação.
 */
export function readShareMetadata(token: string): ShareMetadata {
  const jsonBytes = base64ToBuffer(fromUrlSafeBase64(token));
  const json = new TextDecoder().decode(jsonBytes);
  const parsed = JSON.parse(json) as EncryptedToken;
  return { empresa: parsed.empresa, data: parsed.data, hora: parsed.hora };
}

/**
 * Descriptografa a senha a partir do token e da chave de proteção informada.
 * Lança erro se a chave estiver incorreta ou os dados estiverem corrompidos.
 */
export async function decryptPayload(token: string, passphrase: string): Promise<string> {
  const jsonBytes = base64ToBuffer(fromUrlSafeBase64(token));
  const json = new TextDecoder().decode(jsonBytes);
  const parsed = JSON.parse(json) as EncryptedToken;

  const salt = base64ToBuffer(parsed.salt);
  const iv = base64ToBuffer(parsed.iv);
  const ciphertext = base64ToBuffer(parsed.ciphertext);

  const key = await deriveKey(passphrase, salt);

  try {
    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv as BufferSource },
      key,
      ciphertext as BufferSource
    );
    return new TextDecoder().decode(plaintext);
  } catch {
    throw new Error("Chave incorreta ou link corrompido.");
  }
}

/**
 * Gera uma chave de proteção aleatória e legível, no formato XXXX-XXXX-XXXX-XXXX,
 * usando apenas crypto.getRandomValues (nunca Math.random).
 */
export function generateKey(): string {
  const charset = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sem caracteres ambíguos (O, 0, I, 1)
  const groups = 4;
  const groupLength = 4;
  const parts: string[] = [];

  for (let g = 0; g < groups; g++) {
    let part = "";
    const randomValues = crypto.getRandomValues(new Uint8Array(groupLength));
    for (let i = 0; i < groupLength; i++) {
      part += charset[randomValues[i] % charset.length];
    }
    parts.push(part);
  }

  return parts.join("-");
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
