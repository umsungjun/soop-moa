"use client";

import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LoginButtonProps {
  className?: string;
  size?: "default" | "sm" | "lg";
  label?: string;
}

export function LoginButton({
  className,
  size = "default",
  label = "SOOP 로그인",
}: LoginButtonProps) {
  return (
    <Button
      size={size}
      className={cn("gap-1.5", className)}
      render={<a href="/api/auth/login" />}
    >
      <LogIn />
      {label}
    </Button>
  );
}
