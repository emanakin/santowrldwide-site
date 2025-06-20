"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "@/styles/about/About.module.css";

export default function AboutPage() {
  const video1Ref = useRef<HTMLVideoElement>(null);
  const video2Ref = useRef<HTMLVideoElement>(null);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [currentPhase, setCurrentPhase] = useState<
    "typing" | "static1" | "video1" | "static2" | "video2" | "static3"
  >("typing");
  const [typingKey, setTypingKey] = useState(0);

  // Helper function to safely play video
  const safePlayVideo = async (video: HTMLVideoElement) => {
    try {
      if (video.paused) {
        await video.play();
      }
    } catch (error) {
      console.log("Video play interrupted:", error);
    }
  };

  // Helper function to safely pause video
  const safePauseVideo = (video: HTMLVideoElement) => {
    try {
      if (!video.paused) {
        video.pause();
      }
    } catch (error) {
      console.log("Video pause error:", error);
    }
  };

  // Clear all timeouts
  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    timeoutsRef.current = [];
  };

  useEffect(() => {
    const video1 = video1Ref.current;
    const video2 = video2Ref.current;

    if (!video1 || !video2) return;

    const startCycle = () => {
      // Clear any existing timeouts
      clearAllTimeouts();

      // Reset everything
      safePauseVideo(video1);
      safePauseVideo(video2);
      video1.currentTime = 0;
      video2.currentTime = 0;

      // Restart typing animation
      setCurrentPhase("typing");
      setTypingKey((prev) => prev + 1);

      // Phase 1: Typing (0-12.5s) - wait for last line to finish
      const timeout1 = setTimeout(() => {
        setCurrentPhase("static1");
      }, 12500);
      timeoutsRef.current.push(timeout1);

      // Phase 2: Static transition (12.5-14s)
      const timeout2 = setTimeout(() => {
        setCurrentPhase("video1");
        safePlayVideo(video1);
      }, 14000);
      timeoutsRef.current.push(timeout2);

      // Phase 3: First video ends, static transition (26-27.5s)
      const timeout3 = setTimeout(() => {
        safePauseVideo(video1);
        setCurrentPhase("static2");
      }, 26000);
      timeoutsRef.current.push(timeout3);

      const timeout4 = setTimeout(() => {
        setCurrentPhase("video2");
        safePlayVideo(video2);
      }, 27500);
      timeoutsRef.current.push(timeout4);

      // Phase 4: Second video ends, static transition (39.5-41s)
      const timeout5 = setTimeout(() => {
        safePauseVideo(video2);
        setCurrentPhase("static3");
      }, 39500);
      timeoutsRef.current.push(timeout5);
    };

    // Start the first cycle immediately
    startCycle();

    // Repeat every 41 seconds
    intervalRef.current = setInterval(startCycle, 41000);

    return () => {
      // Cleanup on unmount
      clearAllTimeouts();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      safePauseVideo(video1);
      safePauseVideo(video2);
    };
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.tvSection}>
        <div className={styles.tvContainer}>
          <div className={styles.screenContent}>
            {currentPhase === "typing" && (
              <div key={typingKey} className={styles.typingText}>
                <div className={styles.line}>Toronto Canada</div>
                <div className={styles.line}>Creative Collective</div>
                <div className={styles.line}>Founded by Zeb</div>
                <div className={styles.line}>Site developed by Emmanuel</div>
              </div>
            )}

            {(currentPhase === "static1" ||
              currentPhase === "static2" ||
              currentPhase === "static3") && (
              <div className={styles.staticNoise}></div>
            )}

            <video
              ref={video1Ref}
              className={`${styles.screenVideo} ${currentPhase === "video1" ? styles.videoActive : ""}`}
              src="https://pub-9c5280bc16f841f2848160de54fa0828.r2.dev/background.mp4"
              loop={false}
              muted
              playsInline
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>

            <video
              ref={video2Ref}
              className={`${styles.screenVideo} ${currentPhase === "video2" ? styles.videoActive : ""}`}
              src="https://pub-9c5280bc16f841f2848160de54fa0828.r2.dev/santo-live.mp4"
              loop={false}
              muted
              playsInline
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
          </div>
          <Image
            src="/images/about/retro-tv.png"
            alt="Retro TV"
            fill
            className={styles.tvImage}
            priority
          />
        </div>
      </div>
    </div>
  );
}
