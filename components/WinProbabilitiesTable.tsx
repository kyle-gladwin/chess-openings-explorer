"use client";

import { useEffect, useState } from "react";
import { Chess } from "chess.js";

interface StatRow {
  label: string;
  white: number;
  draws: number;
  black: number;
  total: number;
}

interface ApiResponse {
  rows: StatRow[];
  noToken?: boolean;
}

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

function formatTotal(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return n.toString();
}

function MiniBar({ white, draws, black }: { white: number; draws: number; black: number }) {
  return (
    <div className="flex h-2 rounded overflow-hidden w-24 shrink-0">
      <div style={{ width: `${white}%` }} className="bg-zinc-200" />
      <div style={{ width: `${draws}%` }} className="bg-zinc-500" />
      <div style={{ width: `${black}%` }} className="bg-zinc-800 border-l border-zinc-600" />
    </div>
  );
}

export default function WinProbabilitiesTable({ pgn }: { pgn: string }) {
  const [rows, setRows] = useState<StatRow[]>([]);
  const [noToken, setNoToken] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const play = pgnToUci(pgn);
    if (!play) {
      setLoading(false);
      return;
    }

    fetch(`/api/lichess-stats?play=${encodeURIComponent(play)}`)
      .then((r) => r.json())
      .then((d: ApiResponse) => {
        setRows(d.rows ?? []);
        setNoToken(d.noToken ?? false);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [pgn]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 bg-zinc-800 rounded" />
        ))}
      </div>
    );
  }

  if (noToken && rows.length === 0) {
    return (
      <div className="space-y-1.5">
        <p className="text-zinc-500 text-sm italic">Requires a Lichess API token.</p>
        <p className="text-zinc-600 text-xs">
          Add{" "}
          <code className="bg-zinc-800 px-1 rounded text-zinc-400">LICHESS_TOKEN=…</code> to{" "}
          <code className="bg-zinc-800 px-1 rounded text-zinc-400">.env.local</code> — create
          one at{" "}
          <a
            href="https://lichess.org/account/oauth/token"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300"
          >
            lichess.org/account/oauth/token
          </a>
          .
        </p>
      </div>
    );
  }

  if (rows.length === 0) {
    return <p className="text-zinc-500 text-sm italic">No data available.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="border-b border-zinc-800">
            <th className="text-left text-zinc-500 uppercase tracking-widest pb-2 pr-4 font-normal">
              Rating
            </th>
            <th className="pb-2 px-2 hidden sm:table-cell" />
            <th className="text-center text-zinc-400 uppercase tracking-widest pb-2 px-2 font-normal">
              White
            </th>
            <th className="text-center text-zinc-500 uppercase tracking-widest pb-2 px-2 font-normal">
              Draw
            </th>
            <th className="text-center text-zinc-400 uppercase tracking-widest pb-2 px-2 font-normal">
              Black
            </th>
            <th className="text-right text-zinc-600 uppercase tracking-widest pb-2 pl-4 font-normal hidden sm:table-cell">
              Games
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.label} className={i === 0 ? "border-t border-zinc-700" : "border-t border-zinc-900"}>
              <td className="py-2.5 pr-4 text-zinc-400 whitespace-nowrap font-mono"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {row.label}
              </td>
              <td className="py-2.5 px-2 hidden sm:table-cell">
                <MiniBar white={row.white} draws={row.draws} black={row.black} />
              </td>
              <td className="py-2.5 px-2 text-center text-zinc-200 font-medium">
                {row.white.toFixed(1)}%
              </td>
              <td className="py-2.5 px-2 text-center text-zinc-500">
                {row.draws.toFixed(1)}%
              </td>
              <td className="py-2.5 px-2 text-center text-zinc-200 font-medium">
                {row.black.toFixed(1)}%
              </td>
              <td className="py-2.5 pl-4 text-right text-zinc-600 hidden sm:table-cell">
                {formatTotal(row.total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
