"use client";

import { useActionState } from "react";
import { login, type FormState } from "@/app/admin/actions";
import type { Captcha } from "@/lib/captcha";

const initial: FormState = {};

export function LoginForm({ captcha }: { captcha: Captcha }) {
  const [state, action, pending] = useActionState(login, initial);

  // After a failed attempt the action hands back a fresh challenge; fall back to
  // the one rendered by the page on first load.
  const challenge = state.captcha ?? captcha;

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm font-medium">
        Password
        <input
          type="password"
          name="password"
          autoFocus
          required
          className="rounded-md border border-black/15 bg-transparent px-3 py-2 text-base outline-none focus:border-foreground dark:border-white/20"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        {challenge.question}
        <input
          // Remount (clearing the field) whenever a new challenge arrives.
          key={challenge.token}
          type="text"
          name="captcha"
          inputMode="numeric"
          autoComplete="off"
          required
          className="rounded-md border border-black/15 bg-transparent px-3 py-2 text-base outline-none focus:border-foreground dark:border-white/20"
        />
        <input type="hidden" name="captcha_token" value={challenge.token} />
      </label>

      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
