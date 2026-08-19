import { describe, expect, it } from "vitest";
import {
  USERNAME_MAX_LENGTH,
  usernameErrorMessage,
  validateUsername,
} from "./username";

describe("validateUsername", () => {
  it("rejects empty", () => {
    expect(validateUsername("")).toEqual({ ok: false, error: "empty" });
  });

  it("rejects whitespace-only", () => {
    expect(validateUsername("   ")).toEqual({ ok: false, error: "empty" });
  });

  it("rejects too long", () => {
    const raw = "a".repeat(USERNAME_MAX_LENGTH + 1);
    expect(validateUsername(raw)).toEqual({ ok: false, error: "too_long" });
  });

  it("accepts a normal name and trims it", () => {
    expect(validateUsername("  Ada  ")).toEqual({
      ok: true,
      username: "Ada",
    });
  });

  it("accepts a name of max length", () => {
    const username = "a".repeat(USERNAME_MAX_LENGTH);
    expect(validateUsername(username)).toEqual({ ok: true, username });
  });
});

describe("usernameErrorMessage", () => {
  it("returns spec copy", () => {
    expect(usernameErrorMessage("empty")).toBe("Enter a name");
    expect(usernameErrorMessage("too_long")).toBe("Name is too long");
  });
});
