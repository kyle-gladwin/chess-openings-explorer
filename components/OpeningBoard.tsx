"use client";

import { useState, useEffect, useCallback } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";

interface OpeningBoardProps {
  pgn: string;
}

export default function OpeningBoard({ pgn }: OpeningBoardProps) {
  const [moves, setMoves] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fen, setFen] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

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
  }, [pgn]);

  const goTo = useCallback(
    (index: number) => {
      const chess = new Chess();
      for (let i = 0; i < index; i++) {
        chess.move(moves[i]);
      }
      setFen(chess.fen());
      setCurrentIndex(index);
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
      if (e.key === "ArrowLeft") goBack();
      if (e.key === "ArrowRight") goForward();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goBack, goForward]);

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full max-w-[480px] mx-auto">
        <Chessboard
          options={{
            position: fen,
            allowDragging: false,
            allowDrawingArrows: false,
            boardStyle: {
              borderRadius: "4px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
            },
            darkSquareStyle: { backgroundColor: "#8B6914" },
            lightSquareStyle: { backgroundColor: "#F0D9A0" },
          }}
        />
      </div>

      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => goTo(0)}
          disabled={currentIndex === 0}
          className="board-btn"
        >
          ⟪
        </button>
        <button
          onClick={goBack}
          disabled={currentIndex === 0}
          className="board-btn"
        >
          ◀
        </button>
        <span className="text-sm font-mono text-zinc-400 min-w-[80px] text-center">
          {currentIndex === 0 ? "Start" : `Move ${Math.ceil(currentIndex / 2)}`}
        </span>
        <button
          onClick={goForward}
          disabled={currentIndex === moves.length}
          className="board-btn"
        >
          ▶
        </button>
        <button
          onClick={() => goTo(moves.length)}
          disabled={currentIndex === moves.length}
          className="board-btn"
        >
          ⟫
        </button>
      </div>
    </div>
  );
}
