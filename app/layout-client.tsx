"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { InvestorLogin } from "@/components/investor-login";
import { useAuth } from "@/contexts/auth-context";
import { LogoutButton } from "@/components/logout-button";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <InvestorLogin />;
  }

  return <>{children}</>;
}

export function LayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full">
        <nav className="px-4 h-14 w-full flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <div className="relative">
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full overflow-hidden bg-white shadow-md">
                  <img
                    src="/logo.png"
                    alt="Ahavor Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <span className="hidden font-bold sm:inline-block">
                MaJay Transportation
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-10 text-sm font-medium">
            <Link
              href="/"
              className={`transition-colors hover:text-foreground/80 hover:underline ${
                usePathname() === "/"
                  ? "text-foreground border-b-2 border-primary"
                  : "text-foreground/60"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/tables"
              className={`transition-colors hover:text-foreground/80 hover:underline ${
                usePathname() === "/tables"
                  ? "text-foreground border-b-2 border-primary"
                  : "text-foreground/60"
              }`}
            >
              Tables
            </Link>

            <Link
              href="/setup"
              className={`transition-colors hover:text-foreground/80 hover:underline ${
                usePathname() === "/setup"
                  ? "text-foreground border-b-2 border-primary"
                  : "text-foreground/60"
              }`}
            >
              Setup
            </Link>
          </div>
          <div>
            <LogoutButton />
          </div>
        </nav>
      </header>

      <main className="container mx-auto">
        <AuthGuard>{children}</AuthGuard>
      </main>
    </div>
  );
}
