"use client";

import React, { useState } from "react";
import { Shoot } from "@/types/model-types";
import { getYouTubeEmbedUrl, getYouTubeThumbnail } from "@/lib/media";
import styles from "@/styles/models/Models.module.css";

interface PreviousWorkProps {
  shoots: Shoot[];
}

export default function PreviousWork({ shoots }: PreviousWorkProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const withVideo = shoots.filter((shoot) => getYouTubeEmbedUrl(shoot.youtubeUrl));

  if (withVideo.length === 0) return null;

  return (
    <section className={styles.previousSection}>
      <span className={styles.previousLabel}>previously</span>

      <div className={styles.previousList}>
        {withVideo.map((shoot) => {
          const isExpanded = expandedId === shoot.id;
          const thumbnail = getYouTubeThumbnail(shoot.youtubeUrl);

          return (
            <div key={shoot.id} className={styles.previousItem}>
              {isExpanded ? (
                <div className={styles.previousFrame}>
                  <iframe
                    src={getYouTubeEmbedUrl(shoot.youtubeUrl) ?? ""}
                    title={shoot.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className={styles.previousIframe}
                  />
                </div>
              ) : (
                <button
                  type="button"
                  className={styles.previousTrigger}
                  onClick={() => setExpandedId(shoot.id)}
                  aria-label={`Play ${shoot.title}`}
                  style={
                    thumbnail
                      ? { backgroundImage: `url(${thumbnail})` }
                      : undefined
                  }
                >
                  <span className={styles.previousPlay}>▶</span>
                </button>
              )}

              <p className={styles.previousTitle}>{shoot.title}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
