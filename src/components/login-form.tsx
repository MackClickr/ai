"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions/login";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, null);

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-3">
      <label htmlFor="username" className="text-sm font-medium">
        Name
      </label>
      <input
        id="username"
        name="username"
        type="text"
        autoComplete="username"
        autoFocus
        className="rounded border border-zinc-300 px-3 py-2"
      />
      {state?.error ? (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-zinc-900 px-3 py-2 text-white disabled:opacity-60"
      >
        Continue
      </button>
    </form>
  );
}
