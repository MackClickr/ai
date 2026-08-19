import { beforeEach, describe, expect, it, vi } from "vitest";

const clearSession = vi.fn();

vi.mock("@/lib/session", () => ({
  clearSession: (...args: unknown[]) => clearSession(...args),
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  },
}));

import { leaveAction } from "./leave";

describe("leaveAction", () => {
  beforeEach(() => {
    clearSession.mockReset();
  });

  it("clears the session and redirects home", async () => {
    await expect(leaveAction()).rejects.toThrow("NEXT_REDIRECT:/");
    expect(clearSession).toHaveBeenCalledTimes(1);
  });
});
