"use client";

import { useEffect, useState } from "react";
import { Chess } from "chess.js";

interface Game {
  id: string;
  white: { name: string; rating: number };
  black: { name: string; rating: number };
  winner: "white" | "black" | null;
  year: number;
  source: "masters" | "lichess";
}

interface ApiResponse {
  games: Game[];
  source: "masters" | "lichess";
  noToken?: boolean;
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

function Result({ winner }: { winner: Game["winner"] }) {
  if (winner === "white")
    return <span className="text-zinc-200 font-semibold">1–0</span>;
  if (winner === "black")
    return <span className="text-zinc-200 font-semibold">0–1</span>;
  return <span className="text-zinc-400 font-semibold">½–½</span>;
}

export default function ClassicGamesWidget({ pgn }: { pgn: string }) {
  const [games, setGames] = useState<Game[]>([]);
  const [source, setSource] = useState<Game["source"]>("masters");
  const [noToken, setNoToken] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const play = pgnToUciPlay(pgn);
    if (!play) {
      setLoading(false);
      return;
    }

    fetch(`/api/lichess-games?play=${encodeURIComponent(play)}`)
      .then((r) => r.json())
      .then((d: ApiResponse) => {
        setGames(d.games ?? []);
        setSource(d.source ?? "masters");
        setNoToken(d.noToken ?? false);
      })
      .catch(() => setGames([]))
      .finally(() => setLoading(false));
  }, [pgn]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-10 bg-zinc-800 rounded" />
        ))}
      </div>
    );
  }

  if (games.length === 0) {
    if (noToken) {
      return (
        <div className="space-y-2">
          <p className="text-zinc-500 text-sm italic">
            Games require a Lichess API token.
          </p>
          <p className="text-zinc-600 text-xs">
            Add{" "}
            <code className="bg-zinc-900 px-1 rounded text-zinc-400">
              LICHESS_TOKEN=your_token
            </code>{" "}
            to{" "}
            <code className="bg-zinc-900 px-1 rounded text-zinc-400">
              .env.local
            </code>{" "}
            — create one at{" "}
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
    return <p className="text-zinc-500 text-sm italic">No games on record.</p>;
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-zinc-600 uppercase tracking-widest mb-3">
        {source === "masters" ? "Master games" : "High-rated Lichess games"}
      </p>
      {games.map((g) => (
        <a
          key={g.id}
          href={`https://lichess.org/${g.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded p-3 hover:border-indigo-500/30 hover:bg-zinc-800 transition-all group"
        >
          <div className="flex-1 min-w-0">
            <p className="text-xs text-zinc-200 truncate">
              <span className="font-medium">{g.white.name}</span>
              <span className="text-zinc-500"> ({g.white.rating})</span>
              <span className="text-zinc-600 mx-1">vs</span>
              <span className="font-medium">{g.black.name}</span>
              <span className="text-zinc-500"> ({g.black.rating})</span>
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 text-xs">
            <Result winner={g.winner} />
            {g.year > 0 && <span className="text-zinc-600">{g.year}</span>}
          </div>
          <span className="text-zinc-600 group-hover:text-indigo-400 transition-colors text-xs">
            ↗
          </span>
        </a>
      ))}
    </div>
  );
}
