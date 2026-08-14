export const R2_PUBLIC_BASE =
  "https://pub-9c5280bc16f841f2848160de54fa0828.r2.dev";

export const VIDEOS = {
  santoLive: `${R2_PUBLIC_BASE}/santo-live.mp4`,
  background: `${R2_PUBLIC_BASE}/background.mp4`,
  feelAlive: `${R2_PUBLIC_BASE}/feel-alive-music-video.mp4`,
} as const;

/**
 * Pulls the video id out of the common YouTube URL shapes so we can render a
 * lightweight thumbnail instead of embedding an iframe up front.
 */
export function getYouTubeId(url?: string | null): string | null {
  if (!url) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=)([\w-]{11})/,
    /(?:youtu\.be\/)([\w-]{11})/,
    /(?:youtube\.com\/embed\/)([\w-]{11})/,
    /(?:youtube\.com\/shorts\/)([\w-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

// hqdefault is the largest size YouTube generates for every video;
// maxresdefault 404s on older uploads and falls back to a grey placeholder.
export function getYouTubeThumbnail(url?: string | null): string | null {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

export function getYouTubeEmbedUrl(url?: string | null): string | null {
  const id = getYouTubeId(url);
  return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : null;
}
