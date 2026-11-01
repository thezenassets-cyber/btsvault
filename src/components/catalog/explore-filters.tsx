"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import type { EraId, FilterState, MemberId, ProductType, Rarity } from "@/lib/types";
import { filterProducts, productTypes, rarityOptions } from "@/lib/catalog";
import { eras } from "@/data/eras";
import { members } from "@/data/members";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function ExploreFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const filters: FilterState = useMemo(
    () => ({
      query: searchParams.get("q") ?? "",
      era: (searchParams.get("era") as EraId | "all") ?? "all",
      member: (searchParams.get("member") as MemberId | "all") ?? "all",
      type: (searchParams.get("type") as ProductType | "all") ?? "all",
      rarity: (searchParams.get("rarity") as Rarity | "all") ?? "all",
      inStockOnly: searchParams.get("stock") === "1",
      format: (searchParams.get("format") as "online" | "in-person" | "all") ?? "all",
    }),
    [searchParams]
  );

  const resultCount = filterProducts(filters).length;

  const updateParams = useCallback(
    (updates: Partial<Record<string, string | null>>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "" || value === "all") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      router.push(`/explore?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <aside className="space-y-6">
      <div>
        <label className="mb-2 block text-xs font-medium tracking-wider text-cream/50 uppercase">
          Search
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cream/40" />
          <Input
            defaultValue={filters.query}
            placeholder="Search catalog..."
            className="pl-10"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateParams({ q: (e.target as HTMLInputElement).value || null });
              }
            }}
          />
        </div>
      </div>

      <FilterGroup
        label="Era"
        value={filters.era}
        options={[{ id: "all", label: "All Eras" }, ...eras.map((e) => ({ id: e.id, label: e.name }))]}
        onChange={(v) => updateParams({ era: v })}
      />

      <FilterGroup
        label="Member"
        value={filters.member}
        options={[{ id: "all", label: "All Members" }, ...members.map((m) => ({ id: m.id, label: m.stageName }))]}
        onChange={(v) => updateParams({ member: v })}
      />

      <FilterGroup
        label="Type"
        value={filters.type}
        options={productTypes.map((t) => ({ id: t.id, label: t.label }))}
        onChange={(v) => updateParams({ type: v })}
      />

      <FilterGroup
        label="Experience format"
        value={filters.format ?? "all"}
        options={[
          { id: "all", label: "All formats" },
          { id: "online", label: "Online" },
          { id: "in-person", label: "In Person" },
        ]}
        onChange={(v) => updateParams({ format: v })}
      />

      <FilterGroup
        label="Rarity"
        value={filters.rarity}
        options={rarityOptions.map((r) => ({ id: r.id, label: r.label }))}
        onChange={(v) => updateParams({ rarity: v })}
      />

      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 px-4 py-3 transition-colors hover:border-purple-light/30">
        <input
          type="checkbox"
          checked={filters.inStockOnly}
          onChange={(e) => updateParams({ stock: e.target.checked ? "1" : null })}
          className="h-4 w-4 rounded accent-purple-main"
        />
        <span className="text-sm text-cream/80">In stock only</span>
      </label>

      <p className="text-sm text-cream/40">{resultCount} items found</p>
    </aside>
  );
}

function FilterGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { id: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium tracking-wider text-cream/50 uppercase">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-charcoal-soft px-4 py-2.5 text-sm text-cream outline-none focus:border-purple-light/50"
      >
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function useExploreFilters() {
  const searchParams = useSearchParams();
  const filters: FilterState = useMemo(
    () => ({
      query: searchParams.get("q") ?? "",
      era: (searchParams.get("era") as EraId | "all") ?? "all",
      member: (searchParams.get("member") as MemberId | "all") ?? "all",
      type: (searchParams.get("type") as ProductType | "all") ?? "all",
      rarity: (searchParams.get("rarity") as Rarity | "all") ?? "all",
      inStockOnly: searchParams.get("stock") === "1",
      format: (searchParams.get("format") as "online" | "in-person" | "all") ?? "all",
    }),
    [searchParams]
  );
  return { filters, products: filterProducts(filters) };
}
