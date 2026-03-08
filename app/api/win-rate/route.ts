import { NextRequest, NextResponse } from "next/server";

const RATING_MAP: Record<string, string> = {
  "0-999":     "0,400,600,800,1000",
  "1000-1199": "1000",
  "1200-1399": "1200",
  "1400-1599": "1400",
  "1600-1799": "1600",
  "1800+":     "1800,2000,2200,2500",
};

function buildHeaders(): Record<string, string> {
  const h: Record<string, string> = {
    Accept: "application/json",
    "User-Agent": "chess-openings-explorer/1.0 (educational)",
  };
  const token = process.env.LICHESS_TOKEN;
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}

export async function GET(req: NextRequest) {
  const play   = req.nextUrl.searchParams.get("play")   ?? "";
  const rating = req.nextUrl.searchParams.get("rating") ?? "";

  const empty = { white: 0, draws: 0, black: 0, total: 0 };
  if (!play) return NextResponse.json(empty);

  // "overall" (or unrecognised) = no ratings filter → all games
  const ratingsClause = RATING_MAP[rating] ? `&ratings=${RATING_MAP[rating]}` : "";

  try {
    const res = await fetch(
      `https://explorer.lichess.org/lichess?play=${encodeURIComponent(play)}${ratingsClause}`,
      { headers: buildHeaders(), next: { revalidate: 86400 } }
    );
    if (!res.ok) return NextResponse.json(empty);
    const d = await res.json();
    const w = d.white ?? 0, dr = d.draws ?? 0, b = d.black ?? 0;
    const total = w + dr + b;
    return NextResponse.json({
      white: total ? (w  / total) * 100 : 0,
      draws: total ? (dr / total) * 100 : 0,
      black: total ? (b  / total) * 100 : 0,
      total,
    });
  } catch {
    return NextResponse.json(empty);
  }
}
