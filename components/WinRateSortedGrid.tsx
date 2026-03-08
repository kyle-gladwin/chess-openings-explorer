"use client";

import { useEffect, useState } from "react";
import { Chess } from "chess.js";
import ClientOpeningCard from "@/components/ClientOpeningCard";
import type { Opening } from "@/lib/types";

function pgnToUci(pgn: string): string {
  try {
    const chess = new Chess();
    chess.loadPgn(pgn);
    return chess
      .history({ verbose: true })
      .map((m) => m.from + m.to + (m.promotion ?? ""))
      .join(",");
  } catch {
    return "";
  }
}

interface Props {
  openings: Opening[];
  sortRating: string;
  color: "white" | "black";
}

export default function WinRateSortedGrid({ openings, sortRating, color }: Props) {
  const [winRates, setWinRates] = useState<(number | null)[]>(() =>
    openings.map(() => null)
  );
  const [sortedIndices, setSortedIndices] = useState<number[]>(() =>
    openings.map((_, i) => i)
  );
  const [loading, setLoading] = useState(true);

  // Stable key so the effect fires when openings or sort config actually changes
  const openingsKey = openings.map((o) => o.id).join(",");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setWinRates(openings.map(() => null));
    setSortedIndices(openings.map((_, i) => i));

    Promise.all(
      openings.map(async (opening, i) => {
        const play = pgnToUci(opening.pgn);
        if (!play) return { i, pct: null as number | null };
        try {
          const res = await fetch(
            `/api/win-rate?play=${encodeURIComponent(play)}&rating=${encodeURIComponent(sortRating)}`
          );
          if (!res.ok) return { i, pct: null as number | null };
          const d = await res.json();
          const pct: number | null = d.total > 0
            ? (color === "black" ? d.black : d.white)
            : null;
          return { i, pct };
        } catch {
          return { i, pct: null as number | null };
        }
      })
    ).then((results) => {
      if (cancelled) return;
      const rates = openings.map(() => null as number | null);
      for (const { i, pct } of results) rates[i] = pct;

      const indices = openings.map((_, i) => i).sort((a, b) => {
        const pa = rates[a], pb = rates[b];
        if (pa === null && pb === null) return 0;
        if (pa === null) return 1;
        if (pb === null) return -1;
        return pb - pa;
      });

      setWinRates(rates);
      setSortedIndices(indices);
      setLoading(false);
    });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openingsKey, sortRating, color]);

  const displayIndices = loading ? openings.map((_, i) => i) : sortedIndices;

  return (
    <div>
      {loading && (
        <p className="text-xs text-zinc-500 mb-3 animate-pulse">
          Fetching win rates for {openings.length} openings…
        </p>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
        {displayIndices.map((idx) => {
          const opening = openings[idx];
          const pct = winRates[idx];
          return (
            <div key={opening.id}>
              <ClientOpeningCard opening={opening} rating={sortRating} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
