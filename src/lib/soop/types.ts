/** OAuth token response from POST /auth/token */
export interface SoopTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string | null;
}

/** Single live broadcast item from GET /broad/list (under the `broad` key). */
export interface SoopBroadcast {
  user_id: string;
  user_nick: string;
  broad_no: string;
  broad_title: string;
  broad_cate_no?: string;
  total_view_cnt?: string | number;
  broad_start?: string;
  broad_thumb?: string;
  profile_img?: string;
  is_password?: string;
  broad_grade?: string | number;
}

/** Category node from GET /broad/category/list (under `broad_category`). */
export interface SoopCategory {
  cate_no: string;
  cate_name: string;
  child?: SoopCategory[];
}

/** Profile from POST /user/stationinfo */
export interface SoopStationInfo {
  user_id?: string;
  user_nick: string;
  station_name: string;
  profile_image: string;
  lately_broad_date?: string;
  favorite_cnt?: number;
}

/** Normalized broadcast used across the app UI. */
export interface LiveBroadcast {
  bjId: string;
  bjNick: string;
  broadNo: string;
  title: string;
  categoryNo?: string;
  categoryName?: string;
  viewerCount: number;
  thumbnail?: string;
  profileImage?: string;
  startedAt?: string;
  adult: boolean;
}

export interface Category {
  no: string;
  name: string;
  image?: string;
}
