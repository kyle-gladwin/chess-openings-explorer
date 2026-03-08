import { NextRequest, NextResponse } from "next/server";

function parseDurationSeconds(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  return (
    parseInt(match[1] ?? "0") * 3600 +
    parseInt(match[2] ?? "0") * 60 +
    parseInt(match[3] ?? "0")
  );
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const key = process.env.YOUTUBE_API_KEY;

  if (!key) return NextResponse.json({ videos: [] });

  // Fetch more than needed so we have enough after filtering Shorts
  const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
  searchUrl.searchParams.set("part", "snippet");
  searchUrl.searchParams.set("q", `${q} tutorial`);
  searchUrl.searchParams.set("type", "video");
  searchUrl.searchParams.set("order", "relevance");
  searchUrl.searchParams.set("maxResults", "10");
  searchUrl.searchParams.set("key", key);

  const searchRes = await fetch(searchUrl.toString());
  if (!searchRes.ok) return NextResponse.json({ videos: [] });

  const searchData = await searchRes.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items: any[] = searchData.items ?? [];
  if (items.length === 0) return NextResponse.json({ videos: [] });

  // Fetch durations to filter out Shorts (≤ 60 seconds)
  const ids = items.map((item) => item.id.videoId).join(",");
  const detailUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
  detailUrl.searchParams.set("part", "contentDetails");
  detailUrl.searchParams.set("id", ids);
  detailUrl.searchParams.set("key", key);

  const detailRes = await fetch(detailUrl.toString());
  const detailData = detailRes.ok ? await detailRes.json() : { items: [] };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const detailMap: Record<string, number> = Object.fromEntries(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (detailData.items ?? []).map((d: any) => [
      d.id,
      parseDurationSeconds(d.contentDetails.duration),
    ])
  );

  const videos = items
    .filter((item) => (detailMap[item.id.videoId] ?? 0) > 60)
    .slice(0, 4)
    .map((item) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.medium.url,
    }));

  return NextResponse.json({ videos });
}
