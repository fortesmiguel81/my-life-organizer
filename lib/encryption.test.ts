import { beforeAll, describe, expect, it } from "vitest";

import {
  decryptField,
  decryptFields,
  encryptField,
  encryptFields,
} from "./encryption";

// getCryptoKey() reads process.env.ENCRYPTION_KEY lazily on first use and
// memoizes the derived CryptoKey, so the env var must be set before any
// encrypt/decrypt call in this file — importing the module doesn't trigger it.
beforeAll(() => {
  process.env.ENCRYPTION_KEY =
    "0823378c32a589efa75b5e3b0523c410f8258b6373d4db66db504e51e7175665";
});

describe("encryptField / decryptField", () => {
  it("round-trips a plaintext value", async () => {
    const encrypted = await encryptField("4111 1111 1111 1111");
    expect(encrypted).not.toBeNull();
    expect(encrypted).not.toBe("4111 1111 1111 1111");
    expect(encrypted?.startsWith("enc:")).toBe(true);

    const decrypted = await decryptField(encrypted);
    expect(decrypted).toBe("4111 1111 1111 1111");
  });

  it("produces different ciphertext for the same value on each call (random IV)", async () => {
    const a = await encryptField("same value");
    const b = await encryptField("same value");
    expect(a).not.toBe(b);
    expect(await decryptField(a)).toBe("same value");
    expect(await decryptField(b)).toBe("same value");
  });

  it("passes null and undefined through unchanged", async () => {
    expect(await encryptField(null)).toBeNull();
    expect(await encryptField(undefined)).toBeNull();
    expect(await decryptField(null)).toBeNull();
    expect(await decryptField(undefined)).toBeNull();
  });

  it("passes an empty string through unchanged rather than encrypting it", async () => {
    expect(await encryptField("")).toBe("");
    expect(await decryptField("")).toBe("");
  });

  it("returns legacy plaintext rows as-is (rolling migration fallback)", async () => {
    // A row written before encryption was enabled has no "enc:" prefix.
    expect(await decryptField("Legacy Payee Name")).toBe("Legacy Payee Name");
  });
});

describe("encryptFields / decryptFields", () => {
  it("encrypts and decrypts multiple named fields", async () => {
    const encrypted = await encryptFields({
      payee: "Acme Corp",
      description: "Invoice #42",
    });

    expect(encrypted.payee?.startsWith("enc:")).toBe(true);
    expect(encrypted.description?.startsWith("enc:")).toBe(true);

    const decrypted = await decryptFields(encrypted);
    expect(decrypted).toEqual({
      payee: "Acme Corp",
      description: "Invoice #42",
    });
  });

  it("preserves null fields alongside encrypted ones", async () => {
    const encrypted = await encryptFields({ holder: "Jane Doe", number: null });
    expect(encrypted.holder?.startsWith("enc:")).toBe(true);
    expect(encrypted.number).toBeNull();

    const decrypted = await decryptFields(encrypted);
    expect(decrypted.holder).toBe("Jane Doe");
    expect(decrypted.number).toBeNull();
  });
});
