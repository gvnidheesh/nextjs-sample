import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logout } from "../actions";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-black/10 dark:border-white/15">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-5">
            <Link href="/admin" className="text-lg font-semibold tracking-tight">
              Admin
            </Link>
            <nav className="flex items-center gap-4 text-sm font-medium">
              <Link href="/admin" className="hover:underline">
                Posts
              </Link>
              <Link href="/admin/images" className="hover:underline">
                Images
              </Link>
              <Link
                href="/"
                className="text-zinc-500 hover:text-foreground hover:underline dark:text-zinc-400"
              >
                View site
              </Link>
            </nav>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="text-sm font-medium text-zinc-500 hover:text-foreground hover:underline dark:text-zinc-400"
            >
              Log out
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
