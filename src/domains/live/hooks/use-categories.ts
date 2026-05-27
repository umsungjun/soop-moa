"use client";

import useSWR from "swr";
import type { Category } from "@/domains/live/types";

const fetcher = (url: string): Promise<{ list: Category[] }> =>
  fetch(url).then((res) => res.json());

export function useCategories() {
  const { data, isLoading } = useSWR<{ list: Category[] }>(
    "/api/soop/broad/category",
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 3_600_000 },
  );

  return { categories: data?.list ?? [], isLoading };
}
