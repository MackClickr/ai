import { beforeEach, describe, expect, it, vi } from "vitest";

const createSession = vi.fn();

vi.mock("@/lib/session", () => ({
  createSession: (...args: unknown[]) => createSession(...args),
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  },
}));

import { loginAction } from "./login";

describe("loginAction", () => {
  beforeEach(() => {
    createSession.mockReset();
  });

  it("returns Enter a name for empty input", async () => {
    const formData = new FormData();
    formData.set("username", "   ");
    await expect(loginAction(null, formData)).resolves.toEqual({
      error: "Enter a name",
    });
    expect(createSession).not.toHaveBeenCalled();
  });

  it("returns Name is too long when over 32", async () => {
    const formData = new FormData();
    formData.set("username", "a".repeat(33));
    await expect(loginAction(null, formData)).resolves.toEqual({
      error: "Name is too long",
    });
    expect(createSession).not.toHaveBeenCalled();
  });

  it("creates a session and redirects on a valid name", async () => {
    const formData = new FormData();
    formData.set("username", "  Ada  ");
    await expect(loginAction(null, formData)).rejects.toThrow(
      "NEXT_REDIRECT:/chat",
    );
    expect(createSession).toHaveBeenCalledWith("Ada");
  });
});
