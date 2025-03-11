import React from "react";
import Image from "next/image";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import styles from "@/styles/Home.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <Navbar />

      {/* Fixed Logo Overlay - Now positioned absolute */}
      <div className={styles.logoContainer}>
        <div className={styles.logo}>
          <Image
            src="/images/santo-logo.png"
            alt="SANTOWRLDWIDE"
            width={122}
            height={60}
            priority
          />
        </div>
      </div>

      {/* First Section */}
      <div className={styles.section}>
        <div className={styles.textColumn}>
          <div className={styles.textContent}>
            <div className={styles.dateCode}>SW20250/1</div>
            <h1 className={styles.collectionName}>frostbite</h1>
            <div className={styles.redCross}>
              <Image
                src="/images/red-cross.png"
                alt="Red Cross"
                width={250}
                height={250}
              />
            </div>
            <div className={styles.eventDetails}>
              <div className={styles.codeEffect}>
                {`> init_sequence()`}
                <br />
                {`> loading_event_data...`}
                <br />
                {`> decrypt_timestamp()`}
              </div>
              <p className={styles.animated}>Thursday 130082</p>
              <p>2000 - 2001BST</p>
            </div>
          </div>
        </div>
        <div className={styles.imageColumn}>
          <div className={styles.imageWrapper}>
            <Image
              src="/images/model-1.jpeg"
              alt="Model 1"
              width={800}
              height={600}
              quality={100}
              priority
            />
          </div>
        </div>
      </div>

      {/* Second Section */}
      <div className={styles.section}>
        <div className={styles.textColumn}>
          <div className={styles.textContent}>
            <div className={styles.dateCode}>SW20250/1</div>
            <h2 className={styles.collectionName}>santowrld</h2>
            <div className={styles.decorativeElement}>
              <Image
                src="/images/circular-sketch.png"
                alt="Decorative Element"
                width={257}
                height={500}
              />
            </div>
          </div>
        </div>
        <div className={styles.imageColumn}>
          <div className={styles.imageWrapper}>
            <Image
              src="/images/model-2.jpeg"
              alt="Model 2"
              width={800}
              height={600}
              quality={100}
            />
          </div>
        </div>
      </div>

      {/* Third Section */}
      <div className={styles.section}>
        <div className={styles.textColumn}>
          <div className={styles.textContent}>
            <div className={styles.dateCode}>SW20250/1</div>
            <h2 className={styles.collectionName}>frostbite</h2>
            <div className={styles.eventDetails}>
              <div className={styles.codeEffect}>
                {`> init_sequence()`}
                <br />
                {`> loading_event_data...`}
                <br />
                {`> decrypt_timestamp()`}
              </div>
              <p className={styles.animated}>Thursday 130082</p>
              <p>2000 - 2001BST</p>
            </div>
          </div>
        </div>
        <div className={styles.imageColumn}>
          <div className={styles.imageWrapper}>
            <Image
              src="/images/model-3.jpeg"
              alt="Model 3"
              width={800}
              height={600}
              quality={100}
            />
          </div>
        </div>
      </div>

      {/* Fourth Section */}
      <div className={styles.section}>
        <div className={styles.textColumn}>
          <div className={styles.textContent}>
            <div className={styles.dateCode}>SW20250/1</div>
            <h2 className={styles.collectionName}>santowrld</h2>
            <div className={styles.starDecoration}>
              <Image
                src="/images/star-decoration.png"
                alt="Star Decoration"
                width={427}
                height={593}
              />
            </div>
          </div>
        </div>
        <div className={styles.imageColumn}>
          <div className={styles.imageWrapper}>
            <Image
              src="/images/model-4.jpeg"
              alt="Model 4"
              width={800}
              height={600}
              quality={100}
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
