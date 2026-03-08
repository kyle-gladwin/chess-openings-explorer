"use client";

import dynamic from "next/dynamic";
import type { Opening } from "@/lib/types";

const OpeningCard = dynamic(() => import("./OpeningCard"), {
  ssr: false,
  loading: () => (
    <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden animate-pulse">
      <div className="w-full aspect-square bg-zinc-900" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-zinc-800 rounded w-16" />
        <div className="h-4 bg-zinc-800 rounded w-full" />
        <div className="h-4 bg-zinc-800 rounded w-3/4" />
      </div>
    </div>
  ),
});

export default function ClientOpeningCard({ opening, rating }: { opening: Opening; rating?: string }) {
  return <OpeningCard opening={opening} rating={rating} />;
}
