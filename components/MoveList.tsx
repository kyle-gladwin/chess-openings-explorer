"use client";

import { useEffect, useRef } from "react";

interface MoveListProps {
  moves: string[];
  currentIndex: number;
  onSelect: (index: number) => void;
}

export default function MoveList({
  moves,
  currentIndex,
  onSelect,
}: MoveListProps) {
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [currentIndex]);

  // Pair moves into rows: [[white, black?], ...]
  const pairs: [string, string | null][] = [];
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push([moves[i], moves[i + 1] ?? null]);
  }

  return (
    <div className="overflow-y-auto max-h-64 rounded border border-zinc-800 bg-zinc-950 p-3">
      <div className="grid grid-cols-[2rem_1fr_1fr] gap-y-0.5 text-sm font-mono">
        {pairs.map(([white, black], pairIdx) => {
          const whiteIdx = pairIdx * 2 + 1; // 1-based for display; 0-based internal
          const blackIdx = pairIdx * 2 + 2;

          return [
            // Move number
            <span
              key={`n-${pairIdx}`}
              className="text-zinc-600 select-none text-right pr-2 py-0.5"
            >
              {pairIdx + 1}.
            </span>,
            // White move
            <button
              key={`w-${pairIdx}`}
              ref={currentIndex === whiteIdx ? activeRef : undefined}
              onClick={() => onSelect(whiteIdx)}
              className={`text-left px-2 py-0.5 rounded transition-colors ${
                currentIndex === whiteIdx
                  ? "bg-indigo-500/20 text-indigo-400"
                  : "text-zinc-300 hover:text-white hover:bg-zinc-800"
              }`}
            >
              {white}
            </button>,
            // Black move
            black ? (
              <button
                key={`b-${pairIdx}`}
                ref={currentIndex === blackIdx ? activeRef : undefined}
                onClick={() => onSelect(blackIdx)}
                className={`text-left px-2 py-0.5 rounded transition-colors ${
                  currentIndex === blackIdx
                    ? "bg-indigo-500/20 text-indigo-400"
                    : "text-zinc-300 hover:text-white hover:bg-zinc-800"
                }`}
              >
                {black}
              </button>
            ) : (
              <span key={`b-${pairIdx}`} />
            ),
          ];
        })}
      </div>
    </div>
  );
}
