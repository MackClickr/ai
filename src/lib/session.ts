import { cookies } from "next/headers";

export const SESSION_COOKIE = "session";

export type Session = { username: string };

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function secret(): string {
  const value = process.env.SESSION_SECRET;
  if (!value) {
    throw new Error("SESSION_SECRET is not set");
  }
  return value;
}

function bytesToBase64url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function base64urlToBytes(value: string): Uint8Array {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/");
  const padLength = (4 - (padded.length % 4)) % 4;
  const binary = atob(padded + "=".repeat(padLength));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function hmacKey(): Promise<CryptoKey> {
  return globalThis.crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

async function sign(payload: string): Promise<string> {
  const signature = await globalThis.crypto.subtle.sign(
    "HMAC",
    await hmacKey(),
    textEncoder.encode(payload),
  );
  return bytesToBase64url(new Uint8Array(signature));
}

function signaturesEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function serializeSession(username: string): Promise<string> {
  const payload = bytesToBase64url(textEncoder.encode(JSON.stringify({ username })));
  return `${payload}.${await sign(payload)}`;
}

export async function parseSession(
  cookieValue: string | undefined,
): Promise<Session | null> {
  if (!cookieValue) {
    return null;
  }
  secret();
  try {
    const dot = cookieValue.lastIndexOf(".");
    if (dot <= 0) {
      return null;
    }
    const payload = cookieValue.slice(0, dot);
    const signature = cookieValue.slice(dot + 1);
    if (!signaturesEqual(await sign(payload), signature)) {
      return null;
    }
    const parsed: unknown = JSON.parse(
      textDecoder.decode(base64urlToBytes(payload)),
    );
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof (parsed as Session).username !== "string"
    ) {
      return null;
    }
    return { username: (parsed as Session).username };
  } catch {
    return null;
  }
}

export function sessionCookieOptions(): {
  httpOnly: true;
  secure: boolean;
  sameSite: "lax";
  path: string;
} {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };
}

export async function createSession(username: string): Promise<void> {
  const jar = await cookies();
  jar.set(
    SESSION_COOKIE,
    await serializeSession(username),
    sessionCookieOptions(),
  );
}

export async function readSession(): Promise<Session | null> {
  const jar = await cookies();
  return parseSession(jar.get(SESSION_COOKIE)?.value);
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}
