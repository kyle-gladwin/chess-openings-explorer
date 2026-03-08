"use client";

import { useEffect, useState } from "react";
import { Chess } from "chess.js";

interface Stats {
  white: number;
  draws: number;
  black: number;
  total: number;
}

interface LichessStatsProps {
  pgn: string;
}

function pgnToUciPlay(pgn: string): string {
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

export default function LichessStats({ pgn }: LichessStatsProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!pgn) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);

    const play = pgnToUciPlay(pgn);

    fetch(`https://explorer.lichess.ovh/masters?play=${play}`)
      .then((r) => {
        if (!r.ok) throw new Error("API error");
        return r.json();
      })
      .then((data) => {
        const w = data.white ?? 0;
        const d = data.draws ?? 0;
        const b = data.black ?? 0;
        const total = w + d + b;
        setStats({ white: w, draws: d, black: b, total });
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [pgn]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-4 bg-stone-800 rounded w-1/3" />
        <div className="h-6 bg-stone-800 rounded" />
      </div>
    );
  }

  if (error || !stats || stats.total === 0) {
    return (
      <p className="text-stone-500 text-sm italic">
        {error ? "Could not load Lichess stats." : "No master games on record."}
      </p>
    );
  }

  const wp = ((stats.white / stats.total) * 100).toFixed(1);
  const dp = ((stats.draws / stats.total) * 100).toFixed(1);
  const bp = ((stats.black / stats.total) * 100).toFixed(1);

  return (
    <div className="space-y-2">
      <p className="text-xs text-stone-500 uppercase tracking-widest">
        {stats.total.toLocaleString()} master games
      </p>
      {/* Bar */}
      <div className="flex h-7 rounded overflow-hidden text-xs font-bold">
        <div
          className="flex items-center justify-center bg-stone-200 text-stone-900 transition-all"
          style={{ width: `${wp}%` }}
          title={`White wins: ${wp}%`}
        >
          {parseFloat(wp) > 8 ? `${wp}%` : ""}
        </div>
        <div
          className="flex items-center justify-center bg-stone-600 text-stone-200 transition-all"
          style={{ width: `${dp}%` }}
          title={`Draws: ${dp}%`}
        >
          {parseFloat(dp) > 8 ? `${dp}%` : ""}
        </div>
        <div
          className="flex items-center justify-center bg-stone-900 text-stone-200 border-l border-stone-700 transition-all"
          style={{ width: `${bp}%` }}
          title={`Black wins: ${bp}%`}
        >
          {parseFloat(bp) > 8 ? `${bp}%` : ""}
        </div>
      </div>
      {/* Legend */}
      <div className="flex justify-between text-xs text-stone-400">
        <span>
          <span className="text-stone-200 font-semibold">{wp}%</span> White
        </span>
        <span>
          <span className="text-stone-400 font-semibold">{dp}%</span> Draw
        </span>
        <span>
          Black <span className="text-stone-200 font-semibold">{bp}%</span>
        </span>
      </div>
    </div>
  );
}
