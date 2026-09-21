import { randomBytes } from "node:crypto";

const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export function generateCardCode(length = 6) {
  const bytes = randomBytes(length);
  return Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join("");
}

export function generateActivationPin() {
  return randomBytes(4).toString("hex").toUpperCase();
}
