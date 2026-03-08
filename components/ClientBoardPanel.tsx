"use client";

import dynamic from "next/dynamic";

const InteractiveBoardPanel = dynamic(
  () => import("./InteractiveBoardPanel"),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col gap-5">
        <div className="w-full max-w-[480px] mx-auto aspect-square bg-zinc-900 rounded animate-pulse" />
        <div className="flex items-center justify-center gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-9 h-9 rounded bg-zinc-800 animate-pulse" />
          ))}
        </div>
      </div>
    ),
  }
);

export default function ClientBoardPanel({
  pgn,
  orientation,
}: {
  pgn: string;
  orientation?: "white" | "black";
}) {
  return <InteractiveBoardPanel pgn={pgn} orientation={orientation} />;
}
