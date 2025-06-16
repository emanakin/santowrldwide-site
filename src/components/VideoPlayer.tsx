"use client";
import React, { forwardRef } from "react";

interface VideoPlayerProps {
  videoKey?: "hero" | "background";
  src?: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  playsInline?: boolean;
  poster?: string;
  width?: number;
  height?: number;
}

const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  (
    {
      videoKey,
      src,
      className,
      autoPlay = true,
      muted = true,
      loop = true,
      controls = false,
      playsInline = true,
      poster,
      width,
      height,
    },
    ref
  ) => {
    // Get video URL from environment variables or use provided src
    const getVideoUrl = () => {
      // If direct src is provided, use it
      if (src) {
        // Check if it's a local video path that should be replaced with cloud URL
        if (src === "/videos/santo-live.mp4") {
          const cloudUrl = process.env.NEXT_PUBLIC_HERO_VIDEO_URL;
          return cloudUrl || src;
        }
        if (src === "/videos/background.mp4") {
          const cloudUrl = process.env.NEXT_PUBLIC_BACKGROUND_VIDEO_URL;
          return cloudUrl || src;
        }
        return src;
      }

      // Use videoKey to determine URL
      if (videoKey) {
        const envKey = `NEXT_PUBLIC_${videoKey.toUpperCase()}_VIDEO_URL`;
        const cloudUrl = process.env[envKey];

        if (cloudUrl) {
          return cloudUrl;
        }

        // Fallback to local files for development
        const localFiles = {
          hero: "/videos/santo-live.mp4",
          background: "/videos/background.mp4",
        };

        return localFiles[videoKey] || "/videos/santo-live.mp4";
      }

      return "/videos/santo-live.mp4";
    };

    const videoUrl = getVideoUrl();

    return (
      <video
        ref={ref}
        className={className}
        src={videoUrl}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        controls={controls}
        playsInline={playsInline}
        poster={poster}
        width={width}
        height={height}
      >
        Your browser does not support the video tag.
      </video>
    );
  }
);

VideoPlayer.displayName = "VideoPlayer";

export default VideoPlayer;
