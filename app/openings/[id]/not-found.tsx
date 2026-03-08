import Link from "next/link";

export default function EcoNotFound() {
  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-4xl font-bold text-white mb-3">
        Opening Not Found
      </h1>
      <p className="text-zinc-400 mb-8 max-w-sm">
        This ECO code isn&apos;t in the dataset. It may be an unofficial
        variation or a typo.
      </p>
      <Link
        href="/openings"
        className="px-6 py-3 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-lg hover:bg-indigo-500/20 transition-colors"
      >
        Browse all openings
      </Link>
    </div>
  );
}
