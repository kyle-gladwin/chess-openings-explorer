"use client";

import dynamic from "next/dynamic";

const Chessboard = dynamic(
  () => import("react-chessboard").then((m) => m.Chessboard),
  { ssr: false, loading: () => <div className="w-full h-full bg-[#8B6914]" /> }
);

const BOARD_OPTIONS = {
  allowDragging: false,
  allowDrawingArrows: false,
  showNotation: false,
  darkSquareStyle: { backgroundColor: "#8B6914" },
  lightSquareStyle: { backgroundColor: "#F0D9A0" },
  boardStyle: { borderRadius: 0 },
};

export default function ClientHomeBoard({ orientation = "white" }: { orientation?: "white" | "black" }) {
  return (
    <div className="pointer-events-none select-none absolute inset-0">
      <Chessboard
        options={{
          ...BOARD_OPTIONS,
          position: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
          boardOrientation: orientation,
        }}
      />
    </div>
  );
}
