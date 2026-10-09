import { R2_PUBLIC_BASE } from "@/lib/media";

const base = R2_PUBLIC_BASE.replace(/\/$/, "");

export const portfolioMedia = {
  sebastian: "/production/sebastian-vagara.jpg",
  v2StillOne: `${base}/v2-still-01.png`,
  v2StillTwo: `${base}/v2-still-02.png`,
  stopThisPoster: "/production/stopthis.jpg",
  caponePoster: "/production/capone.jpg",
  v2FiveMins: `${base}/v2-5-mins-music-video.mov`,
  v2Alive: `${base}/v2-alive-music-video.mov`,
  v2EuroSummer: `${base}/v2-euro-summer-music-video.mov`,
  stopThis: `${base}/stopthis-music-video.mp4`,
  capone: `${base}/capone-chain-video.mp4`,
} as const;

export type PortfolioMediaId = keyof typeof portfolioMedia;
export function portfolioMediaUrl(id: PortfolioMediaId) {
  return portfolioMedia[id];
}
