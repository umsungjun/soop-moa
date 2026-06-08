/**
 * SOOP 프로필 이미지 URL에서 BJ id를 추출한다.
 *
 * SOOP `/user/stationinfo`는 user_id(BJ id)를 응답에 포함하지 않으므로,
 * 로그인 사용자의 BJ id를 프로필 이미지 URL 경로에서 얻는다.
 *   https://profile.img.sooplive.com/LOGO/um/umseongjun/umseongjun.jpg → "umseongjun"
 *
 * 기본(미설정) 프로필 이미지처럼 패턴이 다르면 undefined를 반환한다.
 */
export const bjIdFromProfileImage = (
  url?: string | null,
): string | undefined => {
  if (!url) return undefined;
  // /LOGO/{앞2글자}/{bjId}/... 에서 bjId 캡처
  const match = url.match(/\/LOGO\/[^/]+\/([^/]+)\//i);
  return match?.[1] || undefined;
};
