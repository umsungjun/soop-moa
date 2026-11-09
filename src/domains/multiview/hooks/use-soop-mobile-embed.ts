"use client";

import { useSyncExternalStore } from "react";
import { isSoopMobileUA } from "@/domains/multiview/utils/embed-url";

// UA는 바뀌지 않으므로 구독할 이벤트가 없다.
const subscribe = () => () => {};

/** SOOP가 이 기기에 채팅 없는 모바일 임베드를 주는지. 서버 스냅샷은 false(PC)다. */
export const useSoopMobileEmbed = (): boolean =>
  useSyncExternalStore(
    subscribe,
    () => isSoopMobileUA(navigator.userAgent),
    () => false,
  );
