"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import * as ChannelService from "@channel.io/channel-web-sdk-loader";
import { useTheme } from "next-themes";

// 채널톡 문의 채팅. 키가 없으면 아무것도 로드하지 않는다.
// 외부 출처(*.channel.io 등)는 next.config.ts의 CSP에 화이트리스트되어 있어야 동작한다.
const PLUGIN_KEY = process.env.NEXT_PUBLIC_CHANNEL_PLUGIN_KEY;

export const CHANNEL_TALK_ENABLED = Boolean(PLUGIN_KEY);

// 멀티뷰는 우하단 런처가 오른쪽 아래 패널의 SOOP 채팅 입력창을 가린다. 런처를 숨기고 SDK도 툴바의 문의 버튼을 누를 때 로드한다.
const isLauncherHidden = (pathname: string) =>
  pathname.startsWith("/multiview");

let booted = false;

const ensureBooted = () => {
  if (booted || !PLUGIN_KEY) return;
  booted = true;
  ChannelService.loadScript();
  ChannelService.boot({
    pluginKey: PLUGIN_KEY,
    language: "ko",
    // 런처 표시는 아래 effect가 경로에 따라 정한다. 부팅 직후 멀티뷰에서 깜빡이지 않도록 숨긴 채로 시작한다.
    hideChannelButtonOnBoot: true,
    appearance: document.documentElement.classList.contains("dark")
      ? "dark"
      : "light",
  });
};

export const openChannelTalk = () => {
  ensureBooted();
  ChannelService.showMessenger();
};

export default function ChannelTalk() {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const hidden = isLauncherHidden(pathname);

  useEffect(() => {
    if (!PLUGIN_KEY) return;
    if (!hidden) {
      ensureBooted();
      ChannelService.showChannelButton();
    } else if (booted) {
      ChannelService.hideChannelButton();
    }
  }, [hidden]);

  // 헤더의 테마 토글을 메신저 색에도 반영한다.
  useEffect(() => {
    if (booted && resolvedTheme) {
      ChannelService.setAppearance(resolvedTheme === "dark" ? "dark" : "light");
    }
  }, [resolvedTheme]);

  return null;
}
