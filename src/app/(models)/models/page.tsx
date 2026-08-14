"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import BackgroundVideo from "@/components/video/BackgroundVideo";
import PreviousWork from "@/components/models/PreviousWork";
import { VIDEOS } from "@/lib/media";
import { Shoot } from "@/types/model-types";
import styles from "@/styles/models/Models.module.css";

export default function ModelsPage() {
  const [openShoots, setOpenShoots] = useState<Shoot[]>([]);
  const [highlights, setHighlights] = useState<Shoot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadShoots = async () => {
      try {
        const response = await fetch("/api/models/shoots");
        const data = await response.json();

        if (cancelled) return;

        if (response.ok) {
          setOpenShoots(data.open ?? []);
          setHighlights(data.highlights ?? []);
        }
      } catch (error) {
        console.error("Error loading shoots:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadShoots();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className={styles.page}>
      <BackgroundVideo src={VIDEOS.feelAlive} overlayOpacity={0.72} />

      <div className={styles.content}>
        <div className={styles.topBar}>
          <Link href="/" className={styles.wordmark}>
            SANTOWRLDWIDE
          </Link>
          <Link href="/" className={styles.backLink}>
            ← store
          </Link>
        </div>

        <header className={styles.header}>
          <h1 className={styles.title}>MODELS</h1>
          <p className={styles.subtitle}>
            casting for music videos, campaigns and editorial
          </p>
        </header>

        <section className={styles.openSection}>
          {loading ? (
            <p className={styles.quiet}>loading...</p>
          ) : openShoots.length === 0 ? (
            <p className={styles.quiet}>
              applications are closed right now — check back soon
            </p>
          ) : (
            <ul className={styles.shootList}>
              {openShoots.map((shoot) => (
                <li key={shoot.id} className={styles.shootItem}>
                  <Link
                    href={`/models/${shoot.slug}`}
                    className={styles.shootLink}
                  >
                    <span className={styles.shootTitle}>{shoot.title}</span>
                    <span className={styles.shootMeta}>
                      {[shoot.category, shoot.location]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                    <span className={styles.shootApply}>apply</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <PreviousWork shoots={highlights} />
      </div>
    </div>
  );
}
