import React from "react";
import Image from "next/image";
import styles from "@/styles/about/About.module.css";

export default function AboutPage() {
  return (
    <div className={styles.container}>
      <div className={styles.topSection}>
        <div className={styles.titleCol}>
          <h1 className={styles.mainTitle}>
            WHAT IS
            <br />
            SANTOWRLDWIDE?
          </h1>
        </div>
        <div className={styles.descriptionCol}>
          <p className={styles.description}>
            Santowrldwide is a Toronto-based label that emerges directly from
            the city&apos;s vibrant undercurrents of creative culture—where
            streetwear, art, and authenticity collide. Founded with a vision to
            build something extraordinary, the brand has evolved into a living,
            breathing focal point, disrupting design, and shattered expression.
          </p>
        </div>
      </div>

      <div className={styles.foundersSection}>
        <div className={styles.imagesRow}>
          <div className={styles.imageContainer}>
            <Image
              src="/images/about/about1.jpeg"
              alt="Founder"
              fill
              className={styles.founderImage}
            />
          </div>
          <div className={styles.imageContainerSmaller}>
            <Image
              src="/images/about/about2.jpeg"
              alt="Founder"
              fill
              className={styles.founderImageSmaller}
            />
          </div>
          <div className={styles.imageContainer}>
            <Image
              src="/images/about/about3.jpeg"
              alt="Founder"
              fill
              className={styles.founderImage}
            />
          </div>
          <Image
            src="/images/about/corner-element.png"
            alt=""
            width={50}
            height={50}
            className={styles.cornerElement}
          />
        </div>

        <div className={styles.foundersInfo}>
          <div className={styles.officeInfo}>
            <h3 className={styles.infoLabel}>Head Office:</h3>
            <p className={styles.infoText}>TORONTO, CANADA</p>
          </div>

          <div className={styles.foundedInfo}>
            <h3 className={styles.infoLabel}>Founded by:</h3>
            <div className={styles.founderNames}>
              <p className={styles.founderName}>SEBASTIAN VAGARA</p>
              <p className={styles.founderName}>EMMANUEL AKINLOSOTU</p>
              <p className={styles.founderName}>FAVOUR IRANOLA</p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.visionSection}>
        <div className={styles.visionImageCol}>
          <Image
            src="/images/about/vision.jpeg"
            alt="Vision"
            width={300}
            height={500}
            className={styles.visionImage}
          />
        </div>

        <div className={styles.visionTextCol}>
          <h2 className={styles.visionTitle}>THE VISION</h2>

          <p className={styles.visionText}>
            Born in the hidden corners and underground spaces of Toronto,
            Santowrldwide reflects the vision of a voice that thrives on
            authenticity and innovation. Uninterested in trends or mainstream
            validation, the brand is deeply rooted in the narratives and lived
            experiences of those who create outside the spotlight. Every design
            channels the raw, unfiltered energy of Toronto&apos;s underground
            art scenes, galleries, intimate pop-up shows, and independent music
            venues.
          </p>

          <p className={styles.visionText}>
            The label remains intentionally elusive, prioritizing genuine
            connection with its community over widespread recognition—creating
            garments that speak louder than words, and resonate beyond mere
            aesthetics.
          </p>
        </div>
      </div>

      <div className={styles.communitySection}>
        <div className={styles.quoteSymbol}>&quot;</div>

        <h2 className={styles.communityTitle}>COMMUNITY FIRST</h2>

        <p className={styles.communityText}>
          Santowrldwide isn&apos;t just inspired by the underground—it exists
          because of it. From collaborating with local artists to hosting
          spontaneous creative gatherings, the brand commits itself entirely to
          the creative heartbeat of Toronto&apos;s underground. Here, clothing
          becomes a canvas, style a language, and each wearer a storyteller.
        </p>

        <p className={styles.communityText}>
          The aim? Fashion. It&apos;s culture, captured through fabric, form,
          and fearless creativity.
        </p>
      </div>
    </div>
  );
}
