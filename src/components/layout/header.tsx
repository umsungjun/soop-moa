"use client";

import { usePathname } from "next/navigation";
import { LayoutGrid, Radio } from "lucide-react";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "@/domains/auth/components/user-menu";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/live", label: "라이브", icon: Radio },
  { href: "/multiview", label: "멀티뷰", icon: LayoutGrid },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-background/70 border-border/60 sticky top-0 z-40 border-b backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <a href="/" className="shrink-0">
          <Logo />
        </a>

        <nav className="flex items-center gap-1">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <item.icon className="size-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </a>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
