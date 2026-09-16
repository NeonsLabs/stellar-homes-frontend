/**
 * Document digests.
 *
 * The registry never stores a title deed, survey or site photo, only a 32-byte
 * digest of it. The file is hashed here, in the browser, and never uploaded.
 */

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function sha256File(file: Blob): Promise<string> {
  return toHex(await crypto.subtle.digest("SHA-256", await file.arrayBuffer()));
}

export async function sha256Text(text: string): Promise<string> {
  return toHex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)));
}

/** A 32-byte digest as 64 hex characters, with or without `0x`. */
export function normalizeHash(value: string): string | null {
  const hex = value.trim().replace(/^0x/, "");
  return /^[0-9a-fA-F]{64}$/.test(hex) ? hex.toLowerCase() : null;
}

/** A Stellar account (G…) or contract (C…) address, by shape only. */
export function looksLikeAddress(value: string): boolean {
  return /^[GC][A-Z2-7]{55}$/.test(value.trim());
}
