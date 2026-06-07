export interface SessionUser {
  userNick: string;
  stationName: string;
  profileImage: string;
}

export interface SessionData {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number; // epoch ms
  user?: SessionUser;
  oauthState?: string;
  createdAt?: number;
}

export const defaultSession: SessionData = {};

export function isAuthenticated(session: SessionData): boolean {
  return Boolean(session.accessToken && session.user);
}
