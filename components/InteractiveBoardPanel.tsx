"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";

interface InteractiveBoardPanelProps {
  pgn: string;
  orientation?: "white" | "black";
}

const BOARD_OPTIONS_BASE = {
  darkSquareStyle: { backgroundColor: "#8B6914" },
  lightSquareStyle: { backgroundColor: "#F0D9A0" },
  boardStyle: {
    borderRadius: "4px",
    boxShadow: "0 4px 32px rgba(0,0,0,0.6)",
  },
  allowDragging: false,
  allowDrawingArrows: false,
};

export default function InteractiveBoardPanel({
  pgn,
  orientation = "white",
}: InteractiveBoardPanelProps) {
  const [moves, setMoves] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fen, setFen] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  const [lastMove, setLastMove] = useState<[string, string] | null>(null);

  useEffect(() => {
    const chess = new Chess();
    try {
      chess.loadPgn(pgn);
      setMoves(chess.history());
    } catch {
      setMoves([]);
    }
    setCurrentIndex(0);
    setFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    setLastMove(null);
  }, [pgn]);

  const goTo = useCallback(
    (index: number) => {
      const chess = new Chess();
      let lastMoveInfo: [string, string] | null = null;
      try {
        for (let i = 0; i < index; i++) {
          const m = chess.move(moves[i]);
          if (i === index - 1 && m) {
            lastMoveInfo = [m.from, m.to];
          }
        }
      } catch {
        // ignore move errors
      }
      setFen(chess.fen());
      setCurrentIndex(index);
      setLastMove(lastMoveInfo);
    },
    [moves]
  );

  const goBack = useCallback(() => {
    if (currentIndex > 0) goTo(currentIndex - 1);
  }, [currentIndex, goTo]);

  const goForward = useCallback(() => {
    if (currentIndex < moves.length) goTo(currentIndex + 1);
  }, [currentIndex, moves.length, goTo]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      if (e.key === "ArrowLeft") goBack();
      if (e.key === "ArrowRight") goForward();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goBack, goForward]);

  const squareStyles: Record<string, React.CSSProperties> = {};
  if (lastMove) {
    const highlight = { backgroundColor: "rgba(245,158,11,0.3)" };
    squareStyles[lastMove[0]] = highlight;
    squareStyles[lastMove[1]] = highlight;
  }

  // Pair moves: [[white, black?], ...]
  const pairs: [string, string | null][] = [];
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push([moves[i], moves[i + 1] ?? null]);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Board */}
      <div className="w-full max-w-[480px] mx-auto">
        <Chessboard
          options={{
            ...BOARD_OPTIONS_BASE,
            position: fen,
            squareStyles,
            boardOrientation: orientation,
          }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => goTo(0)}
          disabled={currentIndex === 0}
          className="board-btn"
          aria-label="Go to start"
        >
          ⟪
        </button>
        <button
          onClick={goBack}
          disabled={currentIndex === 0}
          className="board-btn"
          aria-label="Previous move"
        >
          ◀
        </button>
        <span
          className="text-sm text-zinc-400 min-w-[90px] text-center"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {currentIndex === 0
            ? "Start"
            : `Move ${Math.ceil(currentIndex / 2)}${currentIndex % 2 === 0 ? ".." : "."}`}
        </span>
        <button
          onClick={goForward}
          disabled={currentIndex === moves.length}
          className="board-btn"
          aria-label="Next move"
        >
          ▶
        </button>
        <button
          onClick={() => goTo(moves.length)}
          disabled={currentIndex === moves.length}
          className="board-btn"
          aria-label="Go to end"
        >
          ⟫
        </button>
      </div>

      {/* Move list */}
      <div className="overflow-y-auto max-h-56 rounded border border-zinc-800 bg-zinc-950 p-3">
        {moves.length === 0 ? (
          <p className="text-zinc-600 text-xs italic">No moves available.</p>
        ) : (
          <div
            className="grid gap-y-0.5 text-sm"
            style={{
              gridTemplateColumns: "1.8rem 1fr 1fr",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {pairs.map(([white, black], pairIdx) => {
              const whiteIdx = pairIdx * 2 + 1;
              const blackIdx = pairIdx * 2 + 2;

              return (
                <React.Fragment key={pairIdx}>
                  <span className="text-zinc-600 text-right pr-2 py-0.5 select-none text-xs">
                    {pairIdx + 1}.
                  </span>
                  <button
                    onClick={() => goTo(whiteIdx)}
                    className={`text-left px-2 py-0.5 rounded transition-colors text-xs ${
                      currentIndex === whiteIdx
                        ? "bg-indigo-500/20 text-indigo-400"
                        : "text-zinc-300 hover:text-white hover:bg-zinc-800"
                    }`}
                  >
                    {white}
                  </button>
                  {black ? (
                    <button
                      onClick={() => goTo(blackIdx)}
                      className={`text-left px-2 py-0.5 rounded transition-colors text-xs ${
                        currentIndex === blackIdx
                          ? "bg-indigo-500/20 text-indigo-400"
                          : "text-zinc-300 hover:text-white hover:bg-zinc-800"
                      }`}
                    >
                      {black}
                    </button>
                  ) : (
                    <span />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      <p
        className="text-xs text-zinc-600 text-center"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        ← → arrow keys to navigate
      </p>
    </div>
  );
}
