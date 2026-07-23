import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
} from "node:crypto";

const FORMAT_VERSION = "v1";
const IV_LENGTH_BYTES = 12;
const AUTH_TAG_LENGTH_BYTES = 16;

function decodeRootKey(): Buffer {
  const encodedKey = process.env.TOKEN_ENCRYPTION_KEY;

  if (!encodedKey) {
    throw new Error("TOKEN_ENCRYPTION_KEY is required for secret encryption.");
  }

  const rootKey = Buffer.from(encodedKey, "base64");

  if (rootKey.length !== 32) {
    throw new Error("TOKEN_ENCRYPTION_KEY must be a base64-encoded 32-byte key.");
  }

  return rootKey;
}

function deriveKey(purpose: "encryption" | "fingerprint"): Buffer {
  return createHmac("sha256", decodeRootKey())
    .update(`lunarlogic-quickbooks-${purpose}-v1`)
    .digest();
}

export function encryptSecret(plaintext: string): string {
  if (!plaintext) {
    throw new Error("Cannot encrypt an empty secret.");
  }

  const iv = randomBytes(IV_LENGTH_BYTES);
  const cipher = createCipheriv("aes-256-gcm", deriveKey("encryption"), iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [
    FORMAT_VERSION,
    iv.toString("base64url"),
    authTag.toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(".");
}

export function decryptSecret(payload: string): string {
  const [version, encodedIv, encodedAuthTag, encodedCiphertext, ...extra] =
    payload.split(".");

  if (
    version !== FORMAT_VERSION ||
    !encodedIv ||
    !encodedAuthTag ||
    !encodedCiphertext ||
    extra.length > 0
  ) {
    throw new Error("Encrypted secret has an invalid format.");
  }

  const iv = Buffer.from(encodedIv, "base64url");
  const authTag = Buffer.from(encodedAuthTag, "base64url");
  const ciphertext = Buffer.from(encodedCiphertext, "base64url");

  if (iv.length !== IV_LENGTH_BYTES || authTag.length !== AUTH_TAG_LENGTH_BYTES) {
    throw new Error("Encrypted secret has invalid metadata.");
  }

  const decipher = createDecipheriv("aes-256-gcm", deriveKey("encryption"), iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString("utf8");
}

/**
 * Produces a deterministic, non-reversible lookup value for encrypted realm IDs.
 */
export function fingerprintSecret(value: string): string {
  if (!value) {
    throw new Error("Cannot fingerprint an empty value.");
  }

  return createHmac("sha256", deriveKey("fingerprint"))
    .update(value, "utf8")
    .digest("hex");
}
