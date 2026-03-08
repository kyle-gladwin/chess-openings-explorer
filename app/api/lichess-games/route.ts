import { NextRequest, NextResponse } from "next/server";

interface LichessGame {
  id: string;
  white: { name: string; rating: number };
  black: { name: string; rating: number };
  winner?: string;
  year?: number;
  month?: string;
}

function extractYear(g: LichessGame): number {
  if (typeof g.year === "number") return g.year;
  if (typeof g.month === "string") return parseInt(g.month.slice(0, 4), 10);
  return 0;
}

function normaliseWinner(w: string | undefined): "white" | "black" | null {
  if (w === "white") return "white";
  if (w === "black") return "black";
  return null;
}

function mapGame(g: LichessGame, source: "masters" | "lichess") {
  return {
    id: g.id,
    white: g.white,
    black: g.black,
    winner: normaliseWinner(g.winner),
    year: extractYear(g),
    source,
  };
}

function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "User-Agent": "chess-openings-explorer/1.0 (educational)",
  };
  const token = process.env.LICHESS_TOKEN;
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export async function GET(req: NextRequest) {
  const play = req.nextUrl.searchParams.get("play") ?? "";
  if (!play) return NextResponse.json({ games: [] });

  const headers = buildHeaders();

  try {
    // 1. Try masters database
    const mastersRes = await fetch(
      `https://explorer.lichess.ovh/masters?play=${encodeURIComponent(play)}&topGames=5`,
      { headers, next: { revalidate: 3600 } }
    );

    if (mastersRes.ok) {
      const data = await mastersRes.json();
      const topGames: LichessGame[] = data.topGames ?? [];
      if (topGames.length > 0) {
        return NextResponse.json({
          games: topGames.map((g) => mapGame(g, "masters")),
          source: "masters",
        });
      }
    }

    // 2. Fall back to high-rated Lichess games
    const lichessRes = await fetch(
      `https://explorer.lichess.ovh/lichess?play=${encodeURIComponent(play)}&ratings=2000,2200,2500&speeds=classical,rapid&recentGames=5`,
      { headers, next: { revalidate: 3600 } }
    );

    if (lichessRes.ok) {
      const data = await lichessRes.json();
      const recentGames: LichessGame[] = data.recentGames ?? [];
      return NextResponse.json({
        games: recentGames.map((g) => mapGame(g, "lichess")),
        source: "lichess",
      });
    }

    return NextResponse.json({ games: [], source: "masters", noToken: !process.env.LICHESS_TOKEN });
  } catch {
    return NextResponse.json({ games: [], source: "masters", noToken: !process.env.LICHESS_TOKEN });
  }
}
