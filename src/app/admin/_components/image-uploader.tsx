"use client";

import { useActionState, useRef } from "react";
import { uploadImages, type FormState } from "../actions";

const initial: FormState = {};

export function ImageUploader() {
  const [state, action, pending] = useActionState(uploadImages, initial);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await action(formData);
        formRef.current?.reset();
      }}
      className="flex flex-wrap items-center gap-3 rounded-md border border-dashed border-black/20 p-4 dark:border-white/20"
    >
      <input
        type="file"
        name="images"
        multiple
        accept="image/*"
        required
        className="text-sm"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-60"
      >
        {pending ? "Uploading…" : "Upload"}
      </button>
      {state.error && (
        <p className="w-full text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
    </form>
  );
}
