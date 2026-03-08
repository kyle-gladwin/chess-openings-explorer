"use client";

import { useEffect, useState } from "react";

interface Video {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
}

export default function YouTubeWidget({ name }: { name: string }) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/youtube?q=${encodeURIComponent(name)}`)
      .then((r) => r.json())
      .then((d) => setVideos(d.videos ?? []))
      .catch(() => setVideos([]))
      .finally(() => setLoading(false));
  }, [name]);

  if (loading) {
    return (
      <div className="animate-pulse grid grid-cols-2 gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-zinc-800 rounded aspect-video" />
        ))}
      </div>
    );
  }

  if (videos.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-2">
      {videos.map((v) => (
        <a
          key={v.id}
          href={`https://www.youtube.com/watch?v=${v.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group rounded overflow-hidden border border-zinc-800 hover:border-indigo-500/40 transition-all"
        >
          <img
            src={v.thumbnail}
            alt={v.title}
            className="w-full aspect-video object-cover"
          />
          <div className="p-2">
            <p className="text-xs text-zinc-200 font-medium line-clamp-2 group-hover:text-white transition-colors">
              {v.title}
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">{v.channel}</p>
          </div>
        </a>
      ))}
    </div>
  );
}
