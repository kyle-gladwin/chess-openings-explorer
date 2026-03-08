"use client";

import Link from "next/link";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { useMemo } from "react";
import type { Opening } from "@/lib/types";
import OutcomeBar from "@/components/OutcomeBar";

const CHAR_COLORS: Record<string, string> = {
  solid: "bg-blue-900/40 text-blue-300 border-blue-800",
  positional: "bg-emerald-900/40 text-emerald-300 border-emerald-800",
  aggressive: "bg-red-900/40 text-red-300 border-red-800",
  tactical: "bg-orange-900/40 text-orange-300 border-orange-800",
  dynamic: "bg-purple-900/40 text-purple-300 border-purple-800",
};

const STYLE_COLORS: Record<string, string> = {
  classical: "bg-sky-900/40 text-sky-300 border-sky-800",
  modern: "bg-violet-900/40 text-violet-300 border-violet-800",
  hypermodern: "bg-rose-900/40 text-rose-300 border-rose-800",
};

const COMPLEXITY_COLORS: Record<string, string> = {
  beginner: "bg-green-900/40 text-green-300 border-green-800",
  intermediate: "bg-amber-900/40 text-amber-300 border-amber-800",
  advanced: "bg-red-900/40 text-red-300 border-red-800",
};

function getPositionAfterFirstMoves(pgn: string): string {
  try {
    const chess = new Chess();
    chess.loadPgn(pgn);
    const history = chess.history();
    const preview = new Chess();
    const limit = Math.min(4, history.length);
    for (let i = 0; i < limit; i++) {
      preview.move(history[i]);
    }
    return preview.fen();
  } catch {
    return "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  }
}

const MINI_BOARD_OPTIONS = {
  allowDragging: false,
  allowDrawingArrows: false,
  showNotation: false,
  darkSquareStyle: { backgroundColor: "#8B6914" },
  lightSquareStyle: { backgroundColor: "#F0D9A0" },
  boardStyle: { borderRadius: 0 },
};

export default function OpeningCard({ opening, rating = "overall" }: { opening: Opening; rating?: string }) {
  const fen = useMemo(
    () => getPositionAfterFirstMoves(opening.pgn),
    [opening.pgn]
  );

  return (
    <Link
      href={`/openings/${opening.id}`}
      className="group flex flex-col bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden hover:border-indigo-500/40 hover:-translate-y-0.5 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/5"
    >
      {/* Mini board */}
      <div className="pointer-events-none select-none">
        <Chessboard
          options={{
            ...MINI_BOARD_OPTIONS,
            position: fen,
            boardOrientation: opening.color === "black" ? "black" : "white",
          }}
        />
      </div>

      {/* Info */}
      <div className="p-3 space-y-2 flex-1">

        {/* Name */}
        <p className="text-sm font-semibold text-zinc-200 leading-tight group-hover:text-white transition-colors line-clamp-2">
          {opening.name}
        </p>

        {/* Badges */}
        <div className="flex flex-wrap gap-1">
          <span
            className={`text-xs px-2 py-0.5 rounded border font-medium ${STYLE_COLORS[opening.style] ?? ""}`}
          >
            {opening.style}
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded border font-medium ${CHAR_COLORS[opening.character] ?? ""}`}
          >
            {opening.character}
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded border font-medium ${COMPLEXITY_COLORS[opening.complexity] ?? ""}`}
          >
            {opening.complexity}
          </span>
        </div>
      </div>

      {/* Outcome bar */}
      <OutcomeBar pgn={opening.pgn} rating={rating} />
    </Link>
  );
}
