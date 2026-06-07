import { z } from "zod";

/**
 * Server-side environment variables.
 * NEXT_PUBLIC_* must be referenced statically so Next.js can inline them.
 */
const serverSchema = z.object({
  SOOP_CLIENT_SECRET: z.string().min(8, "SOOP_CLIENT_SECRET is required"),
  IRON_SESSION_PASSWORD: z
    .string()
    .min(32, "IRON_SESSION_PASSWORD must be at least 32 characters"),
});

const publicSchema = z.object({
  NEXT_PUBLIC_SOOP_CLIENT_ID: z
    .string()
    .min(8, "NEXT_PUBLIC_SOOP_CLIENT_ID is required"),
  NEXT_PUBLIC_SOOP_REDIRECT_URI: z.url("Invalid redirect URI"),
  NEXT_PUBLIC_SITE_URL: z.url("Invalid site URL"),
});

// Public vars referenced statically (build-time inlined).
const publicEnv = publicSchema.parse({
  NEXT_PUBLIC_SOOP_CLIENT_ID: process.env.NEXT_PUBLIC_SOOP_CLIENT_ID,
  NEXT_PUBLIC_SOOP_REDIRECT_URI: process.env.NEXT_PUBLIC_SOOP_REDIRECT_URI,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});

/**
 * Lazily validate server-only secrets. Calling this on the client throws,
 * which protects against accidental import of secrets into the bundle.
 */
let cachedServerEnv: z.infer<typeof serverSchema> | null = null;

export function getServerEnv() {
  if (typeof window !== "undefined") {
    throw new Error("getServerEnv() must not be called on the client");
  }
  if (!cachedServerEnv) {
    cachedServerEnv = serverSchema.parse({
      SOOP_CLIENT_SECRET: process.env.SOOP_CLIENT_SECRET,
      IRON_SESSION_PASSWORD: process.env.IRON_SESSION_PASSWORD,
    });
  }
  return cachedServerEnv;
}

export const publicConfig = publicEnv;
