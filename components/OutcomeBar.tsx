"use client";

import { useEffect, useState } from "react";
import { Chess } from "chess.js";

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

interface BarData {
  white: number;
  draws: number;
  black: number;
  total: number;
}

export default function OutcomeBar({ pgn, rating }: { pgn: string; rating: string }) {
  const [data, setData] = useState<BarData | null>(null);

  useEffect(() => {
    const play = pgnToUci(pgn);
    if (!play) return;

    fetch(`/api/win-rate?play=${encodeURIComponent(play)}&rating=${encodeURIComponent(rating)}`)
      .then((r) => r.json())
      .then((d: BarData) => { if (d.total > 0) setData(d); })
      .catch(() => {});
  }, [pgn, rating]);

  if (!data) {
    return (
      <div className="px-3 pb-2 pt-1 space-y-1">
        <div className="h-2 bg-zinc-800/60 rounded animate-pulse w-3/4" />
        <div className="h-1.5 bg-zinc-800/60 animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="px-3 pb-2 pt-1 space-y-1">
      <div className="flex justify-between text-[10px] text-indigo-400 leading-none">
        <span>W {data.white.toFixed(1)}%</span>
        <span>D {data.draws.toFixed(1)}%</span>
        <span>B {data.black.toFixed(1)}%</span>
      </div>
      <div className="flex h-1.5 rounded overflow-hidden">
        <div style={{ width: `${data.white}%` }} className="bg-zinc-300" />
        <div style={{ width: `${data.draws}%` }} className="bg-zinc-600" />
        <div style={{ width: `${data.black}%` }} className="bg-zinc-800" />
      </div>
    </div>
  );
}
