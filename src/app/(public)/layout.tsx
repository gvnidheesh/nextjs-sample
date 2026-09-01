import Link from "next/link";
import { isAdmin } from "@/lib/auth";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await isAdmin();

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-black/10 dark:border-white/15">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Newsroom
          </Link>
          <nav className="flex items-center gap-5 text-sm font-medium">
            <Link href="/" className="hover:underline">
              Home
            </Link>
            <Link href="/gallery" className="hover:underline">
              Gallery
            </Link>
            <Link
              href="/admin"
              className="text-zinc-500 hover:text-foreground hover:underline dark:text-zinc-400"
            >
              {admin ? "Admin" : "Sign in"}
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        {children}
      </main>

      <footer className="border-t border-black/10 py-6 text-center text-xs text-zinc-500 dark:border-white/15 dark:text-zinc-400">
        Newsroom
      </footer>
    </div>
  );
}
