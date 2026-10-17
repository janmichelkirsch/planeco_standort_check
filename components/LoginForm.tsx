"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/login/actions";

const INITIAL_STATE: LoginState = { error: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, INITIAL_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">E-Mail</span>
        <input name="email" type="email" autoComplete="username" required className="rounded border border-zinc-400 px-3 py-3 text-base" />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Passwort</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="rounded border border-zinc-400 px-3 py-3 text-base"
        />
      </label>
      {state.error && <p className="text-sm text-red-700">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-zinc-900 px-4 py-3 text-base font-semibold text-white disabled:opacity-50"
      >
        {pending ? "Anmelden …" : "Anmelden"}
      </button>
    </form>
  );
}
