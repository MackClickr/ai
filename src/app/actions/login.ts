"use server";

import { redirect } from "next/navigation";
import { createSession } from "@/lib/session";
import { usernameErrorMessage, validateUsername } from "@/lib/username";

export async function loginAction(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const raw = String(formData.get("username") ?? "");
  const result = validateUsername(raw);
  if (!result.ok) {
    return { error: usernameErrorMessage(result.error) };
  }
  await createSession(result.username);
  redirect("/chat");
}
