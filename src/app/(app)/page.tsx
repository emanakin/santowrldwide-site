"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "@/styles/Home.module.css";

// Gallery Component
const CollectionGallery = ({
  mainMedia,
  alternativeMedia,
  decorativeElement,
}: {
  mainMedia: { src: string; alt: string; type: "image" | "video" };
  alternativeMedia: Array<{
    src: string;
    alt: string;
    type: "image" | "video";
  }>;
  decorativeElement?: React.ReactNode;
}) => {
  const [currentMedia, setCurrentMedia] = useState(mainMedia);

  const handleMediaSwitch = (media: typeof mainMedia) => {
    setCurrentMedia(media);
  };

  return (
    <div className={styles.galleryWrapper}>
      <div className={styles.mainMedia}>
        {currentMedia.type === "image" ? (
          <Image
            src={currentMedia.src}
            alt={currentMedia.alt}
            width={800}
            height={600}
            quality={100}
            priority={currentMedia === mainMedia}
          />
        ) : (
          <video
            src={currentMedia.src}
            width={800}
            height={600}
            autoPlay
            loop
            muted
            className={styles.mainVideo}
          />
        )}
      </div>
      <div className={styles.mediaOptions}>
        <div className={styles.mediaGrid}>
          {alternativeMedia.map((media, index) => (
            <div
              key={index}
              className={`${styles.mediaItem} ${currentMedia.src === media.src ? styles.active : ""}`}
              onClick={() => handleMediaSwitch(media)}
            >
              {media.type === "image" ? (
                <Image
                  src={media.src}
                  alt={media.alt}
                  width={60}
                  height={60}
                  quality={90}
                />
              ) : (
                <>
                  <video
                    src={media.src}
                    width={60}
                    height={60}
                    muted
                    loop
                    className={styles.mediaVideo}
                  />
                  <div className={styles.playIcon}>▶</div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      {decorativeElement}
    </div>
  );
};

export default function Home() {
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Add data attribute to body for homepage styling
    document.body.setAttribute("data-page", "home");

    if (videoRef.current) {
      videoRef.current.playbackRate = 0.4;
      videoRef.current.muted = true;
    }

    if (audioRef.current) {
      audioRef.current.volume = 0.25;
      audioRef.current.loop = true;
      if (!isMuted) {
        audioRef.current.play().catch(console.log);
      }
    }

    // Cleanup function to remove data attribute
    return () => {
      document.body.removeAttribute("data-page");
    };
  }, []);

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.play().catch(console.log);
        setIsMuted(false);
      } else {
        audioRef.current.pause();
        setIsMuted(true);
      }
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().catch(console.log);
        setIsPlaying(true);
      }
    }
  };

  const scrollToContent = () => {
    const firstSection = document.querySelector(`.${styles.section}`);
    if (firstSection) {
      firstSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className={styles.container}>
      {/* Background Music */}
      <audio ref={audioRef} src="/music/background-song.mp3" preload="auto" />

      {/* Hero Video Section */}
      <section className={styles.heroSection}>
        <video
          ref={videoRef}
          className={styles.heroVideo}
          src="/videos/santo-live.mp4"
          autoPlay
          loop
          muted
          playsInline
        />

        {/* Retro Aesthetic Overlays */}
        <div className={styles.retroOverlay}></div>
        <div className={styles.filmGrain}></div>
        <div className={styles.vhsLines}></div>

        <div className={styles.heroOverlay}>
          <div className={styles.heroLogoWrapper}>
            <Image
              src="/images/white-cross-logo.png"
              alt="SANTOWRLDWIDE"
              width={122}
              height={122}
              priority
            />
          </div>
          <Link href="/products" className={styles.shopNowBtn}>
            SHOP NOW
          </Link>
        </div>

        {/* Enhanced Mute Button */}
        <button className={styles.muteButton} onClick={toggleMute}>
          {isMuted ? (
            <svg viewBox="0 0 24 24">
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </svg>
          )}
        </button>

        {/* Play/Pause Button */}
        <button className={styles.playButton} onClick={togglePlay}>
          {isPlaying ? (
            <svg viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Enhanced Scroll Indicator */}
        <div className={styles.scrollIndicator} onClick={scrollToContent}>
          <div className={styles.scrollPulse}></div>
          <div className={styles.scrollText}>EXPLORE COLLECTION</div>
          <div className={styles.scrollArrowContainer}>
            <div className={styles.scrollArrow}></div>
          </div>
        </div>
      </section>

      {/* Collection Sections with Gallery */}
      <div className={styles.section}>
        <div className={styles.textColumn}>
          <div className={styles.textContent}>
            <div className={styles.dateCode}>SW20250/1</div>
            <h1 className={styles.collectionName}>frostbite</h1>
            <div className={styles.eventDetails}>
              <div className={styles.codeEffect}>
                {`> decrypt_timestamp()`}
                <br />
                {`> revealing_drop_date...`}
                <br />
                {`> decryption_complete()`}
              </div>
              <p className={styles.animated}>Friday, June 20th</p>
              <p>2025 - DROP DAY</p>
            </div>
          </div>
        </div>
        <div className={styles.imageColumn}>
          <CollectionGallery
            mainMedia={{
              src: "/images/home/model-1.jpeg",
              alt: "Frostbite Collection - Main",
              type: "image",
            }}
            alternativeMedia={[
              {
                src: "/images/home/model-1.jpeg",
                alt: "Frostbite Main",
                type: "image",
              },
              {
                src: "/images/home/model-1-alt1.jpeg",
                alt: "Model Shot 1",
                type: "image",
              },
              {
                src: "/images/home/model-1-alt2.png",
                alt: "Model Shot 2",
                type: "image",
              },
            ]}
            decorativeElement={
              <div className={styles.redCross}>
                <Image
                  src="/images/red-cross.png"
                  alt="Red Cross"
                  width={250}
                  height={250}
                />
              </div>
            }
          />
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.textColumn}>
          <div className={styles.textContent}>
            <div className={styles.dateCode}>SW20250/1</div>
            <h2 className={styles.collectionName}>santowrld</h2>
          </div>
        </div>
        <div className={styles.imageColumn}>
          <CollectionGallery
            mainMedia={{
              src: "/images/home/model-2.jpeg",
              alt: "Santowrld Collection - Main",
              type: "image",
            }}
            alternativeMedia={[
              {
                src: "/images/home/model-2.jpeg",
                alt: "Model Shot 1",
                type: "image",
              },
              {
                src: "/images/home/model-2-alt1.jpeg",
                alt: "Model Shot 2",
                type: "image",
              },
              {
                src: "/images/home/model-2-alt2.jpg",
                alt: "Model Shot 3",
                type: "image",
              },
              {
                src: "/videos/background.mp4",
                alt: "Video Background",
                type: "video",
              },
            ]}
            decorativeElement={
              <div className={styles.decorativeElement}>
                <Image
                  src="/images/circular-sketch.png"
                  alt="Decorative Element"
                  width={257}
                  height={500}
                />
              </div>
            }
          />
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.textColumn}>
          <div className={styles.textContent}>
            <div className={styles.dateCode}>SW20250/1</div>
            <h2 className={styles.collectionName}>frostbite</h2>
            <div className={styles.eventDetails}>
              <div className={styles.codeEffect}>
                {`> decrypt_timestamp()`}
                <br />
                {`> revealing_drop_date...`}
                <br />
                {`> decryption_complete()`}
              </div>
              <p className={styles.animated}>Friday, June 20th</p>
              <p>2025 - DROP DAY</p>
            </div>
          </div>
        </div>
        <div className={styles.imageColumn}>
          <CollectionGallery
            mainMedia={{
              src: "/images/home/model-3.png",
              alt: "2 girls on bed",
              type: "image",
            }}
            alternativeMedia={[
              {
                src: "/images/home/model-3.png",
                alt: "2 girls on bed",
                type: "image",
              },
              {
                src: "/images/home/model-3-alt1.png",
                alt: "2 girls on bed",
                type: "image",
              },
              {
                src: "/images/home/model-3-alt2.png",
                alt: "2 girls on bed",
                type: "image",
              },
              {
                src: "/images/home/model-3-alt3.png",
                alt: "2 girls on bed",
                type: "image",
              },
            ]}
          />
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.textColumn}>
          <div className={styles.textContent}>
            <div className={styles.dateCode}>SW20250/1</div>
            <h2 className={styles.collectionName}>santowrld</h2>
          </div>
        </div>
        <div className={styles.imageColumn}>
          <CollectionGallery
            mainMedia={{
              src: "/images/home/model-4.JPG",
              alt: "2 models on bed",
              type: "image",
            }}
            alternativeMedia={[
              {
                src: "/images/home/model-4.JPG",
                alt: "2 models on bed",
                type: "image",
              },
              {
                src: "/images/home/model-4-alt1.JPG",
                alt: "2 models on bed",
                type: "image",
              },
              {
                src: "/images/home/model-4-alt2.JPG",
                alt: "2 models on bed",
                type: "image",
              },
            ]}
            decorativeElement={
              <div className={styles.starDecoration}>
                <Image
                  src="/images/star-decoration.png"
                  alt="Star Decoration"
                  width={427}
                  height={593}
                />
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}
