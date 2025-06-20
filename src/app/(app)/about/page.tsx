"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "@/styles/about/About.module.css";

export default function AboutPage() {
  const video1Ref = useRef<HTMLVideoElement>(null);
  const video2Ref = useRef<HTMLVideoElement>(null);
  const [currentPhase, setCurrentPhase] = useState<
    "typing" | "static1" | "video1" | "static2" | "video2" | "static3"
  >("typing");
  const [typingKey, setTypingKey] = useState(0);

  useEffect(() => {
    const video1 = video1Ref.current;
    const video2 = video2Ref.current;

    if (!video1 || !video2) return;

    const startCycle = () => {
      // Reset everything
      video1.pause();
      video2.pause();
      video1.currentTime = 0;
      video2.currentTime = 0;

      // Restart typing animation
      setCurrentPhase("typing");
      setTypingKey((prev) => prev + 1);

      // Phase 1: Typing (0-12.5s) - wait for last line to finish
      setTimeout(() => {
        setCurrentPhase("static1");
      }, 12500);

      // Phase 2: Static transition (12.5-14s)
      setTimeout(() => {
        setCurrentPhase("video1");
        video1.play();
      }, 14000);

      // Phase 3: First video ends, static transition (26-27.5s)
      setTimeout(() => {
        video1.pause();
        setCurrentPhase("static2");
      }, 26000);

      setTimeout(() => {
        setCurrentPhase("video2");
        video2.play();
      }, 27500);

      // Phase 4: Second video ends, static transition (39.5-41s)
      setTimeout(() => {
        video2.pause();
        setCurrentPhase("static3");
      }, 39500);
    };

    // Start the first cycle immediately
    startCycle();

    // Repeat every 41 seconds
    const interval = setInterval(startCycle, 41000);

    return () => {
      clearInterval(interval);
      video1.pause();
      video2.pause();
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
