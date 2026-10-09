# Productions media map

The public `/productions` page reads these objects from the existing `santowrldwide-assets` Cloudflare R2 bucket. The keys are at the **bucket root**, exactly as uploaded on October 9, 2026. The configured public base is in `src/lib/media.ts`; the page maps IDs to keys in `src/lib/production/portfolioMedia.ts`.

| Object key | Used for |
| --- | --- |
| `v2-still-01.png` | V2 hero image |
| `v2-still-02.png` | V2 video poster |
| `v2-5-mins-music-video.mov` | 5 More Mins film |
| `v2-alive-music-video.mov` | Alive film |
| `v2-euro-summer-music-video.mov` | Euro Summer film |
| `stopthis-music-video.mp4` | Stop This film |
| `capone-chain-video.mp4` | Capone Chain film |

The Sebastian portrait and Stop This / Capone posters are compressed copies in `public/production/`. `chroma-crib-video.mp4` is present in R2 but is not featured on this page. The portrait, still, and film frames reserve their layout dimensions if an asset fails to load.

These R2 objects have public `r2.dev` URLs. Verify rights and credits before promoting the page. The `.mov` files use `video/quicktime`; browser playback depends on the codecs in each file. If a browser cannot play one, upload an H.264/AAC `.mp4` version and change its path in `portfolioMedia.ts`.
