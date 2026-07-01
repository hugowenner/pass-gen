/**
 * Geração de senhas usando exclusivamente crypto.getRandomValues (nunca Math.random).
 */

export interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  symbolsCharset: string;
}

const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";

export const MIN_PASSWORD_LENGTH = 4;
export const MAX_PASSWORD_LENGTH = 64;

/**
 * Retorna um índice aleatório sem viés de módulo, usando rejeição de amostras.
 */
function randomInt(max: number): number {
  if (max <= 0) return 0;
  const range = 256 - (256 % max);
  let rand: number;
  do {
    rand = crypto.getRandomValues(new Uint8Array(1))[0];
  } while (rand >= range);
  return rand % max;
}

function randomChar(charset: string): string {
  return charset[randomInt(charset.length)];
}

export function generatePassword(options: PasswordOptions): string {
  const { uppercase, lowercase, numbers, symbols, symbolsCharset } = options;
  const length = Math.min(Math.max(options.length, MIN_PASSWORD_LENGTH), MAX_PASSWORD_LENGTH);

  const categories: string[] = [];
  if (uppercase) categories.push(UPPERCASE);
  if (lowercase) categories.push(LOWERCASE);
  if (numbers) categories.push(NUMBERS);
  if (symbols && symbolsCharset.length > 0) categories.push(symbolsCharset);

  if (categories.length === 0) {
    throw new Error("Selecione ao menos uma categoria de caracteres.");
  }

  const allChars = categories.join("");
  const passwordChars: string[] = [];

  // Garante que ao menos um caractere de cada categoria selecionada esteja presente.
  for (const category of categories) {
    passwordChars.push(randomChar(category));
  }

  const remaining = Math.max(length - passwordChars.length, 0);
  for (let i = 0; i < remaining; i++) {
    passwordChars.push(randomChar(allChars));
  }

  // Embaralha (Fisher-Yates) usando o mesmo gerador criptográfico.
  for (let i = passwordChars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
  }

  return passwordChars.slice(0, length).join("");
}
