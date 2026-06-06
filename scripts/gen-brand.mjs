// 로고 엠블럼으로부터 브랜드 에셋을 생성한다.
// 1) 가장자리 flood-fill로 배경 제거(누끼): 바깥 흰 배경은 지우되 안쪽에
//    감싸인 흰색 재생 삼각형은 보존한다. 2) 여백 trim → 가운데 정렬.
// 소스: EDSR로 초해상화한 마스터(public/brand/source-hd.png, 2048px, 실제
//    학습 기반 디테일 — scripts/upscale-source.py 참고)를 우선 사용한다. 마스터가
//    없으면 1024 원본을 2x lanczos로 슈퍼샘플링해 대체한다.
//    어느 경로든 누끼를 고해상도에서 처리하므로 이진 flood-fill 마스크가 축소
//    과정에서 안티에일리어싱된다(엣지 깔끔, 흰 테두리 없음). 모든 출력은
//    lanczos3로 리사이즈 + 표시 크기에서 약하게 샤프닝한다.
import sharp from "sharp";
import { existsSync } from "node:fs";

const HD = "public/brand/source-hd.png"; // EDSR x4 마스터 (이미 엠블럼만 크롭됨)
const SRC = "public/brand/source.png";
// 1024 원본에서 메인 엠블럼 주변 영역 (대체 경로 전용)
const CROP = { left: 130, top: 30, width: 780, height: 640 };
const SS = 2; // 대체 경로의 슈퍼샘플 배율 — 깔끔한 안티에일리어싱 엣지용
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };

// ── flood-fill로 배경 제거 → 여백을 trim한 투명 엠블럼 ──
async function makeCutout() {
  // HD 마스터는 엠블럼만 미리 크롭됨; 원본은 extract + 슈퍼샘플이 필요.
  const base = existsSync(HD)
    ? sharp(HD)
    : sharp(SRC)
        .extract(CROP)
        .resize(CROP.width * SS, CROP.height * SS, { kernel: "lanczos3" });
  const { data, info } = await base
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const Wd = info.width, Ht = info.height;
  const at = (x, y) => (y * Wd + x) * 4;
  const isBg = (i) => {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const mn = Math.min(r, g, b), mx = Math.max(r, g, b);
    return mn > 200 && mx - mn < 26; // 밝고 채도 낮음
  };
  const visited = new Uint8Array(Wd * Ht);
  const stack = [];
  const seed = (x, y) => {
    const p = y * Wd + x;
    if (!visited[p] && isBg(at(x, y))) {
      visited[p] = 1;
      data[at(x, y) + 3] = 0;
      stack.push(x, y);
    }
  };
  for (let x = 0; x < Wd; x++) { seed(x, 0); seed(x, Ht - 1); }
  for (let y = 0; y < Ht; y++) { seed(0, y); seed(Wd - 1, y); }
  while (stack.length) {
    const y = stack.pop(), x = stack.pop();
    if (x > 0) seed(x - 1, y);
    if (x < Wd - 1) seed(x + 1, y);
    if (y > 0) seed(x, y - 1);
    if (y < Ht - 1) seed(x, y + 1);
  }
  const png = await sharp(data, { raw: { width: Wd, height: Ht, channels: 4 } })
    .png()
    .toBuffer();
  // 투명 여백을 trim → 가운데 정렬 가능한 빡빡한 bbox
  return sharp(png).trim({ threshold: 5 }).png().toBuffer();
}

const cut = await makeCutout();

// (투명) 엠블럼을 캔버스 가운데에 배치한다.
// lanczos3 = 최고 품질의 리샘플링 커널; 약한 샤프닝으로 최종 표시 해상도에서
// 선명함을 되살린다(슈퍼샘플된 누끼는 축소 시 깔끔하게 떨어진다).
async function place(size, padFrac, bg) {
  const inner = Math.round(size * (1 - padFrac * 2));
  const logo = await sharp(cut)
    .resize(inner, inner, {
      fit: "contain",
      background: TRANSPARENT,
      kernel: "lanczos3",
      withoutEnlargement: false,
    })
    .sharpen({ sigma: 0.6, m1: 1, m2: 2 })
    .toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: bg } })
    .composite([{ input: logo, gravity: "center" }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

// ── favicon (투명) + apple/PWA (흰 배경, 불투명) ──
// favicon은 컨테이너가 없어 엠블럼이 캔버스를 꽉 채운다. 고해상도(DPI) 대응 512px.
await sharp(await place(512, 0.02, TRANSPARENT)).toFile("src/app/icon.png");
await sharp(await place(180, 0.1, WHITE)).toFile("src/app/apple-icon.png");
await sharp(await place(192, 0.1, WHITE)).toFile("public/icon-192.png");
await sharp(await place(512, 0.1, WHITE)).toFile("public/icon-512.png");

// ── 단독 로고 (엠블럼만, 투명, 고해상도) ──
await sharp(await place(1024, 0.05, TRANSPARENT)).toFile("public/logo.png");

// ── OG 이미지: 흰 배경 + 은은한 그라데이션 + 가운데 엠블럼 (텍스트 없음) ──
const W = 1200, H = 630, emblemPx = 460;
const emX = Math.round((W - emblemPx) / 2);
const emY = Math.round((H - emblemPx) / 2);
const cx = W / 2, cy = H / 2;
const ogEmblem = await place(emblemPx, 0.04, TRANSPARENT);
const ogBg = Buffer.from(`<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#EEF3FC"/></linearGradient>
    <radialGradient id="halo" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#D6E4FA" stop-opacity="0.5"/><stop offset="1" stop-color="#D6E4FA" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <circle cx="${cx}" cy="${cy}" r="320" fill="url(#halo)"/>
</svg>`);
await sharp(await sharp(ogBg).png().toBuffer())
  .composite([{ input: ogEmblem, left: emX, top: emY }])
  .png({ compressionLevel: 9 })
  .toFile("src/app/opengraph-image.png");

console.log(
  existsSync(HD)
    ? "brand assets generated (EDSR x4 HD master + sharpen)."
    : "brand assets generated (2x supersampled cutout + sharpen).",
);
