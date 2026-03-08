import { Suspense } from "react";
import { getFirstPerFamily, ecoPopularityRank } from "@/lib/openings";
import type { Opening } from "@/lib/types";
import FilterBar from "@/components/FilterBar";
import ClientOpeningCard from "@/components/ClientOpeningCard";
import WinRateSortedGrid from "@/components/WinRateSortedGrid";
import Link from "next/link";

interface SearchParams {
  color?: string;
  style?: string | string[];
  character?: string | string[];
  complexity?: string | string[];
  family?: string;
  q?: string;
  sortRating?: string;
}

function asArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function filterOpenings(
  openings: Opening[],
  params: SearchParams
): Opening[] {
  const styles = asArray(params.style);
  const characters = asArray(params.character);
  const complexities = asArray(params.complexity);
  const query = params.q?.toLowerCase().trim() ?? "";

  return openings
    .filter((o) => {
      if (params.color && o.color !== params.color && o.color !== "both")
        return false;
      if (styles.length > 0 && !styles.includes(o.style)) return false;
      if (characters.length > 0 && !characters.includes(o.character))
        return false;
      if (complexities.length > 0 && !complexities.includes(o.complexity))
        return false;
      if (params.family && o.family !== params.family) return false;
      if (query && !o.name.toLowerCase().includes(query)) return false;
      return true;
    })
    .sort((a, b) => {
      const rankDiff = ecoPopularityRank(a.eco) - ecoPopularityRank(b.eco);
      if (rankDiff !== 0) return rankDiff;
      // Within same family, shorter lines first
      return a.pgn.split(" ").length - b.pgn.split(" ").length;
    });
}

export default async function OpeningsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const all = getFirstPerFamily();

  // Deduplicate families for filter
  const families = [...new Set(all.map((o) => o.family))].sort();

  const filtered = filterOpenings(all, params);

  const colorLabel =
    params.color === "white"
      ? "White"
      : params.color === "black"
      ? "Black"
      : null;

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="text-zinc-500 hover:text-indigo-400 transition-colors text-sm"
          >
            ← Home
          </Link>
          <div className="h-4 w-px bg-zinc-800" />
          <h1 className="text-lg font-semibold text-white">
            {colorLabel ? `${colorLabel} Openings` : "All Openings"}
          </h1>
          <span className="ml-auto text-xs text-zinc-500 font-mono">
            {filtered.length.toLocaleString()} openings
          </span>
        </div>
      </header>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar filters */}
          <aside className="w-full lg:w-64 shrink-0">
            <Suspense>
              <FilterBar families={families} />
            </Suspense>
          </aside>

          {/* Grid */}
          <main className="flex-1 min-w-0">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-zinc-500">
                <p className="text-lg">No openings match your filters.</p>
                <Link
                  href={`/openings${params.color ? `?color=${params.color}` : ""}`}
                  className="mt-4 text-indigo-400 hover:underline text-sm"
                >
                  Clear filters
                </Link>
              </div>
            ) : (() => {
              const sortColor =
                params.color === "white" || params.color === "black"
                  ? params.color
                  : null;
              const visible = filtered.slice(0, 200);
              return sortColor && params.sortRating ? (
                <WinRateSortedGrid
                  openings={visible}
                  sortRating={params.sortRating}
                  color={sortColor}
                />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                  {visible.map((opening, i) => (
                    <ClientOpeningCard key={i} opening={opening} rating={params.sortRating ?? "overall"} />
                  ))}
                </div>
              );
            })()}
            {filtered.length > 200 && (
              <p className="text-center text-zinc-500 text-sm mt-6">
                Showing first 200 of {filtered.length}. Use filters to narrow
                results.
              </p>
            )}
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-800 mt-12">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 text-center">
          <p
            className="text-zinc-700 text-xs"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            Vibe coded by Kyle Gladwin using Claude and the lichess.org API. See my GitHub{" "}
            <a
              href="https://github.com/kyle-gladwin"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-indigo-400 underline underline-offset-2 transition-colors"
            >
              here
            </a>
            .
          </p>
        </div>
      </footer>
    </div>
  );
}
