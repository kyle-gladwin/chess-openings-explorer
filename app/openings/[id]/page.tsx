import { notFound } from "next/navigation";
import Link from "next/link";
import { getOpeningById, getVariations } from "@/lib/openings";
import ClientBoardPanel from "@/components/ClientBoardPanel";
import WinProbabilitiesTable from "@/components/WinProbabilitiesTable";
import YouTubeWidget from "@/components/YouTubeWidget";

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

export const dynamic = "force-dynamic";

export default async function OpeningDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const opening = getOpeningById(parseInt(id, 10));

  if (!opening) notFound();

  const variations = getVariations(opening);

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4">
          {/* Breadcrumb */}
          <nav
            className="flex items-center gap-2 text-xs text-zinc-500"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            <Link href="/" className="hover:text-indigo-400 transition-colors">
              Home
            </Link>
            <span>›</span>
            <Link
              href="/openings"
              className="hover:text-indigo-400 transition-colors"
            >
              Openings
            </Link>
            <span>›</span>
            <span className="text-zinc-300 truncate max-w-[200px]">
              {opening.name}
            </span>
          </nav>
        </div>
      </header>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col xl:flex-row gap-8">
          {/* Left: Board */}
          <div className="w-full xl:w-[520px] shrink-0">
            {/* Title area */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
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
              <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                {opening.name}
              </h1>
            </div>

            {/* Board */}
            <ClientBoardPanel
              pgn={opening.pgn}
              orientation={opening.color === "black" ? "black" : "white"}
            />
          </div>

          {/* Right: Details */}
          <div className="flex-1 min-w-0 space-y-8">

            {/* Win Probabilities */}
            <section>
              <h2 className="text-xs uppercase tracking-widest text-zinc-500 mb-3">
                Win Probabilities
              </h2>
              <WinProbabilitiesTable pgn={opening.pgn} />
            </section>

            {/* YouTube */}
            <section>
              <h2 className="text-xs uppercase tracking-widest text-zinc-500 mb-3">
                Video Tutorials
              </h2>
              <YouTubeWidget name={opening.name} />
            </section>

            {/* Variations */}
            {variations.length > 0 && (
              <section>
                <h2 className="text-xs uppercase tracking-widest text-zinc-500 mb-3">
                  Variations ({variations.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {variations.slice(0, 20).map((v) => (
                    <Link
                      key={v.id}
                      href={`/openings/${v.id}`}
                      className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded p-3 hover:border-indigo-500/30 hover:bg-zinc-800 transition-all group"
                    >
                      <span
                        className="text-xs shrink-0"
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          color: "#6366f199",
                        }}
                      >
                        {v.eco}
                      </span>
                      <span className="text-xs text-zinc-400 group-hover:text-zinc-200 transition-colors truncate">
                        {v.name}
                      </span>
                    </Link>
                  ))}
                </div>
                {variations.length > 20 && (
                  <p className="text-xs text-zinc-600 mt-2">
                    + {variations.length - 20} more variations
                  </p>
                )}
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-800 mt-12">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 text-center">
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
      </footer>
    </div>
  );
}
