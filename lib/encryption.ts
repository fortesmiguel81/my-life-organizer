/**
 * AES-256-GCM field-level encryption using the Web Crypto API.
 * Compatible with Vercel Edge Runtime and Node.js.
 *
 * Required env var:
 *   ENCRYPTION_KEY — 64 hex characters (32 bytes).
 *   Generate one with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 *
 * Encrypted values are prefixed with "enc:" so existing plaintext rows are
 * transparently returned as-is during a rolling migration.
 */

const PREFIX = "enc:";

let _keyPromise: Promise<CryptoKey> | null = null;

function getCryptoKey(): Promise<CryptoKey> {
  if (_keyPromise) return _keyPromise;

  const hex = process.env.ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error(
      "ENCRYPTION_KEY must be a 64-character hex string. " +
        "Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    );
  }

  _keyPromise = crypto.subtle.importKey(
    "raw",
    Buffer.from(hex, "hex"),
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );

  return _keyPromise;
}

/**
 * Encrypts a string value. Returns null unchanged.
 * Output format: "enc:<base64(iv[12] + ciphertext + authTag[16])>"
 */
export async function encryptField(value: string | null | undefined): Promise<string | null> {
  if (value == null || value === "") return value ?? null;

  const key = await getCryptoKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(value);
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);

  const combined = new Uint8Array(12 + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), 12);

  return PREFIX + Buffer.from(combined).toString("base64");
}

/**
 * Decrypts a value previously encrypted with encryptField.
 * If the value does not start with "enc:", it is returned as-is (plaintext
 * migration fallback for rows that were written before encryption was enabled).
 */
export async function decryptField(value: string | null | undefined): Promise<string | null> {
  if (value == null || value === "") return value ?? null;

  // Unencrypted legacy row — return as-is
  if (!value.startsWith(PREFIX)) return value;

  const key = await getCryptoKey();
  const bytes = Buffer.from(value.slice(PREFIX.length), "base64");
  const iv = bytes.subarray(0, 12);
  const ciphertext = bytes.subarray(12);

  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
  return new TextDecoder().decode(decrypted);
}

/** Encrypt multiple named fields in parallel. */
export async function encryptFields<T extends Record<string, string | null | undefined>>(
  fields: T
): Promise<{ [K in keyof T]: string | null }> {
  const entries = await Promise.all(
    Object.entries(fields).map(async ([k, v]) => [k, await encryptField(v)])
  );
  return Object.fromEntries(entries) as { [K in keyof T]: string | null };
}

/** Decrypt multiple named fields in parallel. */
export async function decryptFields<T extends Record<string, string | null | undefined>>(
  fields: T
): Promise<{ [K in keyof T]: string | null }> {
  const entries = await Promise.all(
    Object.entries(fields).map(async ([k, v]) => [k, await decryptField(v)])
  );
  return Object.fromEntries(entries) as { [K in keyof T]: string | null };
}
