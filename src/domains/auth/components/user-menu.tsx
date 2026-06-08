"use client";

import Image from "next/image";
import { LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useLogout } from "@/domains/auth/hooks/use-logout";
import { useSession } from "@/domains/auth/hooks/use-session";
import { LoginButton } from "./login-button";

export function UserMenu() {
  const { user, isAuthenticated, isLoading } = useSession();
  const logout = useLogout();

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
        {/* GroupLabel(Base UI)은 Group 안에 있어야 한다 — Group으로 감싼다. */}
        <DropdownMenuGroup>
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
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<a href="/me" />}>
          <User />내 프로필
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={logout}>
          <LogOut />
          로그아웃
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
