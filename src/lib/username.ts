export const USERNAME_MAX_LENGTH = 32;

export type UsernameError = "empty" | "too_long";

export type UsernameResult =
  | { ok: true; username: string }
  | { ok: false; error: UsernameError };

export function validateUsername(raw: string): UsernameResult {
  const username = raw.trim();
  if (username.length === 0) {
    return { ok: false, error: "empty" };
  }
  if (username.length > USERNAME_MAX_LENGTH) {
    return { ok: false, error: "too_long" };
  }
  return { ok: true, username };
}

export function usernameErrorMessage(error: UsernameError): string {
  return error === "empty" ? "Enter a name" : "Name is too long";
}
