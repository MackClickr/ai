import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, expect, it, vi } from "vitest";

const set = vi.fn();
const get = vi.fn();
const del = vi.fn();

vi.mock("next/headers", () => ({
  cookies: async () => ({
    set,
    get,
    delete: del,
  }),
}));

import {
  SESSION_COOKIE,
  clearSession,
  createSession,
  parseSession,
  readSession,
  serializeSession,
  sessionCookieOptions,
} from "./session";

describe("serializeSession / parseSession", () => {
  it("does not import node:crypto", () => {
    const source = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), "session.ts"),
      "utf8",
    );
    expect(source).not.toMatch(/node:crypto/);
  });

  it("round-trips a username", async () => {
    const token = await serializeSession("Ada");
    await expect(parseSession(token)).resolves.toEqual({ username: "Ada" });
  });

  it("rejects a missing cookie", async () => {
    await expect(parseSession(undefined)).resolves.toBeNull();
  });

  it("rejects a tampered cookie", async () => {
    const token = await serializeSession("Ada");
    const tampered = token.slice(0, -1) + (token.endsWith("a") ? "b" : "a");
    await expect(parseSession(tampered)).resolves.toBeNull();
  });

  it("rejects garbage", async () => {
    await expect(parseSession("not-a-valid-token")).resolves.toBeNull();
  });
});

describe("sessionCookieOptions", () => {
  it("is httpOnly, Lax, no maxAge, Secure only in production", () => {
    const options = sessionCookieOptions();
    expect(options).toEqual({
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    expect("maxAge" in options).toBe(false);
  });
});

describe("createSession / readSession / clearSession", () => {
  beforeEach(() => {
    set.mockReset();
    get.mockReset();
    del.mockReset();
  });

  it("sets a signed session cookie", async () => {
    await createSession("Ada");
    expect(set).toHaveBeenCalledTimes(1);
    const [name, value, options] = set.mock.calls[0];
    expect(name).toBe(SESSION_COOKIE);
    await expect(parseSession(value)).resolves.toEqual({ username: "Ada" });
    expect(options).toMatchObject({
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
    expect(options.maxAge).toBeUndefined();
  });

  it("reads the current session", async () => {
    get.mockReturnValue({ value: await serializeSession("Ada") });
    await expect(readSession()).resolves.toEqual({ username: "Ada" });
    expect(get).toHaveBeenCalledWith(SESSION_COOKIE);
  });

  it("clears the session cookie", async () => {
    await clearSession();
    expect(del).toHaveBeenCalledWith(SESSION_COOKIE);
  });
});
