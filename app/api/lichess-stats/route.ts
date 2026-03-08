import { NextRequest, NextResponse } from "next/server";

interface RawStats {
  white: number;
  draws: number;
  black: number;
}

interface StatRow {
  label: string;
  white: number;
  draws: number;
  black: number;
  total: number;
}

const LEVELS: { label: string; url: (p: string) => string }[] = [
  {
    label: "1800+",
    url: (p) => `https://explorer.lichess.org/lichess?play=${p}&ratings=1800,2000,2200,2500`,
  },
  {
    label: "1600–1799",
    url: (p) => `https://explorer.lichess.org/lichess?play=${p}&ratings=1600`,
  },
  {
    label: "1400–1599",
    url: (p) => `https://explorer.lichess.org/lichess?play=${p}&ratings=1400`,
  },
  {
    label: "1200–1399",
    url: (p) => `https://explorer.lichess.org/lichess?play=${p}&ratings=1200`,
  },
  {
    label: "0–999",
    url: (p) => `https://explorer.lichess.org/lichess?play=${p}&ratings=0,400,600,800,1000`,
  },
];

function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "User-Agent": "chess-openings-explorer/1.0 (educational)",
  };
  const token = process.env.LICHESS_TOKEN;
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

function pct(n: number, total: number) {
  return total === 0 ? 0 : (n / total) * 100;
}

export async function GET(req: NextRequest) {
  const play = req.nextUrl.searchParams.get("play") ?? "";
  if (!play) return NextResponse.json({ rows: [] });

  const headers = buildHeaders();

  const results = await Promise.all(
    LEVELS.map(async ({ label, url }) => {
      try {
        const res = await fetch(url(encodeURIComponent(play)), {
          headers,
          next: { revalidate: 86400 },
        });
        if (!res.ok) return null;
        const d: RawStats = await res.json();
        const w = d.white ?? 0;
        const dr = d.draws ?? 0;
        const b = d.black ?? 0;
        const total = w + dr + b;
        return { label, white: pct(w, total), draws: pct(dr, total), black: pct(b, total), total } satisfies StatRow;
      } catch {
        return null;
      }
    })
  );

  const rows = results.filter((r): r is StatRow => r !== null && r.total > 0);
  return NextResponse.json({ rows, noToken: !process.env.LICHESS_TOKEN });
}
