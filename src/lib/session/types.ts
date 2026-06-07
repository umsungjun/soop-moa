export interface SessionUser {
  userNick: string;
  stationName: string;
  profileImage: string;
  // SOOP BJ ID. optional — SOOP가 누락하거나 이 필드 도입 이전 세션엔 없을 수 있다.
  userId?: string;
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
