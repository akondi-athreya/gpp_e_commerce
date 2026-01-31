import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Layout({ children }) {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-semibold">
            SwiftCart
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/cart" className="text-sm font-medium">
              Cart
            </Link>
            {status !== "loading" && session ? (
              <button
                type="button"
                onClick={() => signOut()}
                data-testid="signout-button"
                className="rounded bg-gray-900 px-3 py-2 text-sm text-white"
              >
                Sign out
              </button>
            ) : (
              <button
                type="button"
                onClick={() => signIn("github")}
                data-testid="signin-button"
                className="rounded bg-gray-900 px-3 py-2 text-sm text-white"
              >
                Sign in
              </button>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
