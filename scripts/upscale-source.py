#!/usr/bin/env python3
"""고해상도 브랜드 마스터(public/brand/source-hd.png)를 생성한다.

원본 public/brand/source.png는 1024px이고 엠블럼이 ~780px만 차지 → 실제
디테일 한계는 ~550px다. 이 스크립트는 엠블럼 영역에 EDSR x4 초해상화(보간이
아닌 실제 학습 기반 디테일)를 적용한 뒤 2048px 너비 마스터로 다운스케일한다.
gen-brand.mjs는 source-hd.png가 있으면 이를 사용한다.

이건 일회성 provenance 단계다 — 생성된 source-hd.png는 커밋되므로, 일반 빌드
(`node scripts/gen-brand.mjs`)에는 opencv 없이 sharp만 있으면 된다.

준비(일회성):
  python3 -m venv /tmp/srenv && /tmp/srenv/bin/pip install opencv-contrib-python numpy
  curl -L -o /tmp/EDSR_x4.pb \
    https://github.com/Saafke/EDSR_Tensorflow/raw/master/models/EDSR_x4.pb
실행:
  /tmp/srenv/bin/python scripts/upscale-source.py
"""
import cv2
from cv2 import dnn_superres

SRC = "public/brand/source.png"
OUT = "public/brand/source-hd.png"
MODEL = "/tmp/EDSR_x4.pb"
# 1024 원본에서의 엠블럼 영역 (gen-brand.mjs의 CROP과 동일)
L, T, W, H = 130, 30, 780, 640
MASTER_W = 2048  # 다운스케일 목표 — native ~550px보다 충분히 크고, 저장소도 가볍게 유지

img = cv2.imread(SRC)
crop = img[T:T + H, L:L + W]

sr = dnn_superres.DnnSuperResImpl_create()
sr.readModel(MODEL)
sr.setModel("edsr", 4)
hi = sr.upsample(crop)  # 780x640 -> 3120x2560 (EDSR x4, CPU에서 ~100초)

scale = MASTER_W / hi.shape[1]
master = cv2.resize(
    hi, (MASTER_W, round(hi.shape[0] * scale)), interpolation=cv2.INTER_AREA
)
cv2.imwrite(OUT, master, [cv2.IMWRITE_PNG_COMPRESSION, 9])
print(f"wrote {OUT}: {master.shape[1]}x{master.shape[0]} (EDSR x4 of {W}x{H} crop)")
