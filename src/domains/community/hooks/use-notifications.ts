"use client";

import { toast } from "sonner";
import useSWR from "swr";
import type { NotificationListResponse } from "../types";

const KEY = "/api/community/notifications";
const EMPTY: NotificationListResponse = { list: [], unreadCount: 0 };

const fetcher = async (url: string): Promise<NotificationListResponse> => {
  const res = await fetch(url, { cache: "no-store" });
  // 세션 만료로 401이 오면 에러 대신 빈 목록으로 다룬다. 다음 세션 재검증 때 종이 사라진다.
  if (res.status === 401) return EMPTY;
  if (!res.ok) throw new Error("알림을 불러오지 못했습니다.");
  return res.json();
};

const markLocal = (
  data: NotificationListResponse,
  ids?: string[],
): NotificationListResponse => {
  const target = ids ? new Set(ids) : null;
  let cleared = 0;
  const list = data.list.map((n) => {
    if (n.isRead || (target && !target.has(n.id))) return n;
    cleared += 1;
    return { ...n, isRead: true };
  });
  return {
    list,
    unreadCount: target ? Math.max(0, data.unreadCount - cleared) : 0,
  };
};

/** 내 알림 최근 20건 + 안 읽은 수. enabled가 false면 요청하지 않는다. */
export const useNotifications = (enabled: boolean) => {
  const { data, error, isLoading, mutate } = useSWR<NotificationListResponse>(
    enabled ? KEY : null,
    fetcher,
    // anon 키를 쓰지 않아 Supabase Realtime 구독이 없다. 60초 폴링과 탭 복귀 갱신으로 대신한다.
    {
      refreshInterval: 60_000,
      revalidateOnFocus: true,
      dedupingInterval: 10_000,
    },
  );

  /** ids가 없으면 전부 읽음. 배지·강조는 낙관적으로 먼저 지운다. */
  const markRead = (ids?: string[]) => {
    const request = fetch(KEY, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ids ? { ids } : {}),
      // 알림을 눌러 바로 다른 페이지로 넘어가도 요청이 끝까지 가게 한다.
      keepalive: true,
    }).then((res) => {
      if (!res.ok) throw new Error("읽음 처리에 실패했습니다.");
      return undefined;
    });
    mutate(request, {
      optimisticData: (prev) => markLocal(prev ?? EMPTY, ids),
      populateCache: false,
      rollbackOnError: true,
      revalidate: true,
    }).catch((err: unknown) => {
      toast.error(
        err instanceof Error ? err.message : "읽음 처리에 실패했습니다.",
      );
    });
  };

  return {
    list: data?.list ?? [],
    unreadCount: data?.unreadCount ?? 0,
    isLoading,
    error,
    markRead,
  };
};
