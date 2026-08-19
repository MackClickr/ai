import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "session";

export type Session = { username: string };

function secret(): string {
  const value = process.env.SESSION_SECRET;
  if (!value) {
    throw new Error("SESSION_SECRET is not set");
  }
  return value;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function signaturesEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    return false;
  }
  return timingSafeEqual(left, right);
}

export function serializeSession(username: string): string {
  const payload = Buffer.from(JSON.stringify({ username }), "utf8").toString(
    "base64url",
  );
  return `${payload}.${sign(payload)}`;
}

export function parseSession(
  cookieValue: string | undefined,
): Session | null {
  if (!cookieValue) {
    return null;
  }
  try {
    const dot = cookieValue.lastIndexOf(".");
    if (dot <= 0) {
      return null;
    }
    const payload = cookieValue.slice(0, dot);
    const signature = cookieValue.slice(dot + 1);
    if (!signaturesEqual(sign(payload), signature)) {
      return null;
    }
    const parsed: unknown = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
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
  jar.set(SESSION_COOKIE, serializeSession(username), sessionCookieOptions());
}

export async function readSession(): Promise<Session | null> {
  const jar = await cookies();
  return parseSession(jar.get(SESSION_COOKIE)?.value);
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}
