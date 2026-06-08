export const SOOP_API_BASE = "https://openapi.sooplive.com";

export const SOOP_ENDPOINTS = {
  authCode: "/auth/code",
  authToken: "/auth/token",
  broadList: "/broad/list",
  broadCategoryList: "/broad/category/list",
  userStationInfo: "/user/stationinfo",
} as const;

/** SOOP live broadcast watch page (used for iframe embed). */
export const SOOP_PLAY_BASE = "https://play.sooplive.com";

/** SOOP 방송국(채널) 페이지 — `${SOOP_STATION_BASE}/{userId}`. */
export const SOOP_STATION_BASE = "https://www.sooplive.com/station";
