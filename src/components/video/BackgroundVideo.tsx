"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "@/styles/video/BackgroundVideo.module.css";

interface BackgroundVideoProps {
  src: string;
  /** Darkness of the overlay sitting between the video and page content. */
  overlayOpacity?: number;
  showMuteButton?: boolean;
  videoClassName?: string;
  overlayClassName?: string;
}

export default function BackgroundVideo({
  src,
  overlayOpacity = 0.7,
  showMuteButton = true,
  videoClassName,
  overlayClassName,
}: BackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    // Always start muted so autoplay is allowed by the browser
    setIsMuted(true);

    const attemptPlay = async () => {
      if (!videoRef.current) return;

      try {
        videoRef.current.controls = false;
        await videoRef.current.play();
      } catch (error) {
        console.error("Video autoplay failed:", error);

        // Some mobile browsers only allow playback slightly after load
        setTimeout(() => {
          videoRef.current
            ?.play()
            .catch((e) => console.error("Retry autoplay failed:", e));
        }, 300);
      }
    };

    attemptPlay();

    window.addEventListener("focus", attemptPlay);
    document.addEventListener("touchstart", attemptPlay, { once: true });

    return () => {
      window.removeEventListener("focus", attemptPlay);
    };
  }, [src]);

  const toggleMute = () => {
    if (!videoRef.current) return;

    const newMuteState = !isMuted;
    videoRef.current.muted = newMuteState;
    setIsMuted(newMuteState);

    if (!newMuteState) {
      videoRef.current.play().catch(console.error);
    }
  };

  return (
    <>
      <video
        ref={videoRef}
        className={`${styles.backgroundVideo} ${videoClassName || ""}`}
        src={src}
        loop
        muted={isMuted}
        playsInline
        autoPlay
        controls={false}
        preload="metadata"
      >
        Your browser does not support the video tag.
      </video>

      <div
        className={`${styles.overlay} ${overlayClassName || ""}`}
        style={{ backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` }}
      />

      {showMuteButton && (
        <button
          onClick={toggleMute}
          className={styles.muteButton}
          aria-label={isMuted ? "Unmute" : "Mute"}
          type="button"
        >
          <span className={styles.muteIcon}>{isMuted ? "🔇" : "🔊"}</span>
        </button>
      )}
    </>
  );
}
