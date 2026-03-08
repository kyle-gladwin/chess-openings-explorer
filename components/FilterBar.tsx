"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import type { Style, Character, Complexity } from "@/lib/types";

const STYLES: Style[] = ["classical", "modern", "hypermodern"];

const SORT_RATING_OPTIONS = [
  { value: "0-999",     label: "0–999" },
  { value: "1000-1199", label: "1000–1199" },
  { value: "1200-1399", label: "1200–1399" },
  { value: "1400-1599", label: "1400–1599" },
  { value: "1600-1799", label: "1600–1799" },
  { value: "1800+",     label: "1800+" },
];
const CHARACTERS: Character[] = [
  "solid",
  "positional",
  "aggressive",
  "tactical",
  "dynamic",
];
const COMPLEXITIES: Complexity[] = ["beginner", "intermediate", "advanced"];

interface FilterBarProps {
  families: string[];
}

function useToggleParam(key: string) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const existing = params.getAll(key);
      if (existing.includes(value)) {
        params.delete(key);
        existing.filter((v) => v !== value).forEach((v) => params.append(key, v));
      } else {
        params.append(key, value);
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams, key]
  );
}

function TagButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded text-xs font-semibold uppercase tracking-wide transition-all border ${
        active
          ? "bg-indigo-500 border-indigo-500 text-white"
          : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
      }`}
    >
      {children}
    </button>
  );
}

export default function FilterBar({ families }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const toggleStyle = useToggleParam("style");
  const toggleCharacter = useToggleParam("character");
  const toggleComplexity = useToggleParam("complexity");

  const activeStyles = searchParams.getAll("style");
  const activeCharacters = searchParams.getAll("character");
  const activeComplexities = searchParams.getAll("complexity");
  const activeFamily = searchParams.get("family") ?? "";
  const searchQuery = searchParams.get("q") ?? "";
  const activeSortRating = searchParams.get("sortRating") ?? "";

  const setFamily = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("family", value);
    } else {
      params.delete("family");
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const setSearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("q", value);
    } else {
      params.delete("q");
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const clearAll = () => {
    router.push(pathname, { scroll: false });
  };

  const activeColor = searchParams.get("color") ?? "";

  const setColor = (value: string) => {
    // Switching color clears all other filters
    const params = new URLSearchParams();
    if (value && activeColor !== value) {
      params.set("color", value);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const setSortRating = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("sortRating", value);
    } else {
      params.delete("sortRating");
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const hasFilters =
    activeStyles.length > 0 ||
    activeCharacters.length > 0 ||
    activeComplexities.length > 0 ||
    activeFamily ||
    searchQuery ||
    !!activeColor ||
    !!activeSortRating;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-4">
      {/* Search */}
      <input
        type="text"
        placeholder="Search openings…"
        value={searchQuery}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/60"
      />

      {/* Color */}
      <div>
        <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">
          Color
        </p>
        <div className="flex gap-2">
          <TagButton active={activeColor === "white"} onClick={() => setColor("white")}>
            White
          </TagButton>
          <TagButton active={activeColor === "black"} onClick={() => setColor("black")}>
            Black
          </TagButton>
        </div>
      </div>

      {/* Sort by win rate — only when a side is selected */}
      {(activeColor === "white" || activeColor === "black") && (
        <div>
          <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">
            Sort by win rate (ELO)
          </p>
          <select
            value={activeSortRating}
            onChange={(e) => setSortRating(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/60"
          >
            <option value="overall">All</option>
            {SORT_RATING_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Family */}
      <div>
        <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">
          Family
        </p>
        <select
          value={activeFamily}
          onChange={(e) => setFamily(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/60"
        >
          <option value="">All families</option>
          {families.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      {/* Style */}
      <div>
        <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">
          Style
        </p>
        <div className="flex flex-wrap gap-2">
          {STYLES.map((s) => (
            <TagButton
              key={s}
              active={activeStyles.includes(s)}
              onClick={() => toggleStyle(s)}
            >
              {s}
            </TagButton>
          ))}
        </div>
      </div>

      {/* Character */}
      <div>
        <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">
          Character
        </p>
        <div className="flex flex-wrap gap-2">
          {CHARACTERS.map((c) => (
            <TagButton
              key={c}
              active={activeCharacters.includes(c)}
              onClick={() => toggleCharacter(c)}
            >
              {c}
            </TagButton>
          ))}
        </div>
      </div>

      {/* Complexity */}
      <div>
        <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">
          Complexity
        </p>
        <div className="flex flex-wrap gap-2">
          {COMPLEXITIES.map((c) => (
            <TagButton
              key={c}
              active={activeComplexities.includes(c)}
              onClick={() => toggleComplexity(c)}
            >
              {c}
            </TagButton>
          ))}
        </div>
      </div>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={clearAll}
          className="text-xs text-zinc-500 hover:text-indigo-400 transition-colors underline underline-offset-2"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
