import Link from "next/link";
import ClientHomeBoard from "@/components/ClientHomeBoard";
import AboutSite from "@/components/AboutSite";

export default function HomePage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#09090b]">
      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(99,102,241,0.08)_0%,_transparent_70%)]" />

      <div className="relative z-10 text-center px-6 w-full max-w-[1040px] mx-auto">
        {/* Title */}
        <h1 className="text-5xl sm:text-7xl font-bold text-white leading-[1.05] mb-4">
          Chess Opening
          <br />
          <span className="text-indigo-400">Explorer</span>
        </h1>

        {/* Subtitle */}
        <p className="text-zinc-400 text-lg sm:text-xl mb-8 leading-relaxed">
          Start better and win more! <AboutSite />
        </p>

        {/* Mobile: split single board */}
        <div className="lg:hidden relative w-[320px] h-[320px] sm:w-[480px] sm:h-[480px] mx-auto rounded-lg overflow-hidden shadow-2xl border border-indigo-500/10">
          <ClientHomeBoard orientation="white" />
          <Link
            href="/openings?color=black"
            className="absolute inset-x-0 top-0 h-1/2 flex flex-col items-center justify-center gap-2 bg-zinc-950/80 hover:bg-zinc-950/65 transition-colors duration-200 z-10"
          >
            <span className="text-xl font-semibold text-white">Playing Black</span>
            <span className="text-zinc-400 text-xs">React, counterattack, and equalise</span>
          </Link>
          <div className="absolute inset-x-0 top-1/2 h-px bg-indigo-500/50 z-20" />
          <Link
            href="/openings?color=white"
            className="absolute inset-x-0 bottom-0 h-1/2 flex flex-col items-center justify-center gap-2 bg-[#f0d9b5]/88 hover:bg-[#f0d9b5]/75 transition-colors duration-200 z-10"
          >
            <span className="text-xl font-semibold text-stone-900">Playing White</span>
            <span className="text-stone-600 text-xs">Control the centre from move one</span>
          </Link>
        </div>

        {/* Desktop: two side-by-side boards */}
        <div className="hidden lg:flex gap-8 justify-center">
          {/* White */}
          <Link
            href="/openings?color=white"
            className="relative w-[480px] h-[480px] rounded-lg overflow-hidden shadow-2xl border border-indigo-500/10 hover:border-indigo-500/30 transition-all duration-200 shrink-0"
          >
            <ClientHomeBoard orientation="white" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#f0d9b5]/85 hover:bg-[#f0d9b5]/70 transition-colors duration-200 z-10">
              <span className="text-2xl font-semibold text-stone-900">Playing White</span>
              <span className="text-stone-600 text-sm">Control the centre from move one</span>
            </div>
          </Link>

          {/* Black */}
          <Link
            href="/openings?color=black"
            className="relative w-[480px] h-[480px] rounded-lg overflow-hidden shadow-2xl border border-indigo-500/10 hover:border-indigo-500/30 transition-all duration-200 shrink-0"
          >
            <ClientHomeBoard orientation="black" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-zinc-950/80 hover:bg-zinc-950/65 transition-colors duration-200 z-10">
              <span className="text-2xl font-semibold text-white">Playing Black</span>
              <span className="text-zinc-400 text-sm">React, counterattack, and equalise</span>
            </div>
          </Link>
        </div>

        {/* Browse all link */}
        <div className="mt-8">
          <Link
            href="/openings"
            className="text-zinc-500 hover:text-indigo-400 text-sm transition-colors underline underline-offset-4 decoration-zinc-700 hover:decoration-indigo-500"
          >
            Explore all openings →
          </Link>
        </div>
      </div>

      {/* Bottom decoration */}
      <div className="absolute bottom-6 left-0 right-0 text-center">
        <p
          className="text-zinc-700 text-xs"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          Vibe coded by Kyle Gladwin using Claude and the lichess.org API. See my GitHub{" "}
          <a
            href="https://github.com/kyle-gladwin"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-indigo-400 underline underline-offset-2 transition-colors"
          >
            here
          </a>
          .
        </p>
      </div>
    </main>
  );
}
