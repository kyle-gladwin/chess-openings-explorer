"use client";

import { useState } from "react";

export default function AboutSite() {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-block">
      <button
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="text-indigo-400 hover:text-indigo-300 transition-colors underline underline-offset-2 decoration-indigo-400/40 cursor-default"
      >
        About this site.
      </button>

      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-64 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-zinc-300 shadow-xl z-50 text-left">
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-zinc-900 border-l border-t border-zinc-700 rotate-45" />
          I wanted to get better at chess by learning openings and specifically which work best at different ELO rankings.
          <br /><br />
          This web app is built with Next.js (App Router), a dataset of 3,600+ openings sourced from the Lichess ECO database, and the Lichess opening explorer API for live win-rate data. The interactive boards use react-chessboard and chess.js.
        </div>
      )}
    </span>
  );
}
