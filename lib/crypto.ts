/**
 * Ghost Chat — Cryptographic Utilities
 *
 * Phase 1: SHA-256 hashing for secret codes
 * Phase 2: E2E encryption with Web Crypto API (stubs below)
 */

/**
 * Hash a secret code using SHA-256 via the Web Crypto API.
 * Returns a hex-encoded string.
 */
export async function hashSecretCode(code: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(code);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

// ============================================================
// Phase 2 — E2E Encryption Stubs (Web Crypto API)
// These will be implemented when encryption is added.
// ============================================================

/**
 * Generate an RSA-OAEP key pair for E2E encryption.
 * @stub Phase 2
 */
export async function generateKeyPair(): Promise<{
  publicKey: string;
  privateKey: string;
}> {
  // TODO: Phase 2 — Implement with Web Crypto API
  // const keyPair = await crypto.subtle.generateKey(
  //   { name: "RSA-OAEP", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
  //   true,
  //   ["encrypt", "decrypt"]
  // );
  throw new Error("generateKeyPair is not yet implemented (Phase 2)");
}

/**
 * Encrypt a message with the recipient's public key.
 * @stub Phase 2
 */
export async function encryptMessage(
  _plaintext: string,
  _publicKey: string
): Promise<string> {
  // TODO: Phase 2 — Implement with Web Crypto API
  throw new Error("encryptMessage is not yet implemented (Phase 2)");
}

/**
 * Decrypt a message with the user's private key.
 * @stub Phase 2
 */
export async function decryptMessage(
  _ciphertext: string,
  _privateKey: string
): Promise<string> {
  // TODO: Phase 2 — Implement with Web Crypto API
  throw new Error("decryptMessage is not yet implemented (Phase 2)");
}
