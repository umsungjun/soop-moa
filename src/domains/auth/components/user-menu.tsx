"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/domains/auth/hooks/use-session";
import { LoginButton } from "./login-button";

export function UserMenu() {
  const { user, isAuthenticated, isLoading, mutate } = useSession();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    await mutate();
    router.refresh();
  }

  if (isLoading) {
    return <Skeleton className="size-8 rounded-full" />;
  }

  if (!isAuthenticated || !user) {
    return <LoginButton size="sm" />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="focus-visible:ring-ring/50 flex items-center gap-2 rounded-full outline-none focus-visible:ring-3"
        aria-label="사용자 메뉴"
      >
        <span className="ring-border relative inline-flex size-8 overflow-hidden rounded-full ring-1">
          {user.profileImage ? (
            <Image
              src={user.profileImage}
              alt={user.userNick}
              fill
              sizes="32px"
              className="object-cover"
            />
          ) : (
            <span className="bg-muted text-muted-foreground flex size-full items-center justify-center">
              <User className="size-4" />
            </span>
          )}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="truncate text-sm font-semibold">
              {user.userNick}
            </span>
            <span className="text-muted-foreground truncate text-xs font-normal">
              {user.stationName}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<a href="/me" />}>
          <User />내 프로필
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={handleLogout}>
          <LogOut />
          로그아웃
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
