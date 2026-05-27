"use client";

import { useCategories } from "@/domains/live/hooks/use-categories";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  value?: string;
  onChange: (categoryNo?: string) => void;
}

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  const { categories } = useCategories();

  const chip = (active: boolean) =>
    cn(
      "shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
      active
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
    );

  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <button
        type="button"
        className={chip(!value)}
        onClick={() => onChange(undefined)}
      >
        전체
      </button>
      {categories.map((c) => (
        <button
          key={c.no}
          type="button"
          className={chip(value === c.no)}
          onClick={() => onChange(c.no)}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
