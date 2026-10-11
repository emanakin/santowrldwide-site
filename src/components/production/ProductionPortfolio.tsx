"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { PortfolioMediaId, portfolioMediaUrl } from "@/lib/production/portfolioMedia";
import styles from "@/styles/account/ProductionPortfolio.module.css";

const media = portfolioMediaUrl;

function PortfolioImage({ id, alt, sizes, label }: { id: PortfolioMediaId; alt: string; sizes: string; label: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <div className={styles.assetPlaceholder}><span>IMAGE / AWAITING UPLOAD</span><strong>{label}</strong></div>;
  return <Image src={media(id)} alt={alt} fill unoptimized sizes={sizes} onError={() => setFailed(true)} />;
}

function PortfolioVideo({ id, poster, label }: { id: PortfolioMediaId; poster?: PortfolioMediaId; label: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <div className={styles.videoPlaceholder}><span>FILM / PLAYBACK UNAVAILABLE</span><strong>{label}</strong><a href={media(id)} target="_blank" rel="noreferrer">Open video file</a></div>;
  return <video controls preload={poster ? "none" : "metadata"} playsInline poster={poster ? media(poster) : undefined} src={media(id)} aria-label={label} onError={() => setFailed(true)} />;
}

const v2Films = [
  { id: "v2FiveMins", title: "5 More Mins" },
  { id: "v2Alive", title: "Alive" },
  { id: "v2EuroSummer", title: "Euro Summer" },
] as const;

export default function ProductionPortfolio() {
  return <main className={styles.root} data-production-portfolio>
    <div className={styles.canvas}>
      <header className={styles.topbar}>
        <Link href="/" className={styles.brand}>SANTO<span>WRLDWIDE</span></Link>
        <span className={styles.private}>FILM / DIRECTION / VISUAL WORLDS</span>
        <nav aria-label="Productions"><a href="#work">Work</a><a href="#studio">Studio</a><Link href="/contact">Contact</Link></nav>
      </header>

      <section className={styles.intro} id="work">
        <div className={styles.introTop}><span>SANTOWRLDWIDE / PRODUCTIONS</span><span>SELECTED WORK / 01 — 03</span></div>
        <div className={styles.introTitle}><h1>Selected<br /><em>work.</em></h1><p>Music videos, artist visuals, and branded films.</p></div>
        <div className={styles.marquee}><span>DIRECTION</span><span>VISUAL DEVELOPMENT</span><span>PRODUCTION</span></div>
      </section>

      <section className={styles.studio} id="studio" aria-label="Studio approach">
        <span className={styles.kicker}>THE STUDIO</span>
        <p>SANTOWRLDWIDE develops visual direction with artists and brands, from the first treatment through the finished film.</p>
      </section>

      <div className={styles.sectionDivider}><span>01</span><span>MUSIC VIDEO / ARTIST WORLD</span><span>V2</span></div>
      <section className={styles.feature} aria-labelledby="v2-title">
        <div className={styles.featureHeading}>
          <div><p className={styles.kicker}>THREE FILMS / ONE ARTIST</p><h2 id="v2-title">V2<span className={styles.punctuation}>.</span></h2></div>
          <div className={styles.v2Still}><PortfolioImage id="v2StillOne" alt="V2 beside a deep red car" sizes="(max-width: 650px) 46vw, 220px" label="V2" /><span>V2 / STILL 01</span></div>
          <p>Each film adjusts the styling, setting, and camera distance to fit the track while keeping V2 unmistakable.</p>
        </div>
        <div className={styles.creditLine}><span>DIRECTION / SEBASTIAN VAGARA</span><span>CREATIVE COORDINATION / SANTOWRLDWIDE</span></div>
        <div className={styles.filmArea}>
          <div className={styles.filmTop}><h3>Three films.<br />One visual world.</h3><span>SELECT A FILM TO WATCH</span></div>
          <div className={styles.filmGrid}>
            {v2Films.map((film, index) => <article className={styles.filmCard} key={film.id}>
              <PortfolioVideo id={film.id} label={`V2 — ${film.title} music video`} />
              <div className={styles.filmCardCaption}><span>0{index + 1} / V2</span><strong>{film.title}</strong></div>
            </article>)}
          </div>
        </div>
        <div className={styles.breakdown}>
          <div className={styles.breakdownTitle}><span className={styles.kicker}>CREATIVE DECISIONS</span><h3>One artist.<br />Three treatments.</h3></div>
          <div className={styles.breakdownGrid}>
            <div><span>01 / STYLING</span><p>Y2K references appear in silhouette, texture, and shine. The wardrobe signals an era without turning V2 into a costume.</p></div>
            <div><span>02 / VISUAL LANGUAGE</span><p>Cars, city exteriors, and tighter interiors change the pace between films. Each location gives the performance a different amount of space.</p></div>
            <div><span>03 / DIRECTION</span><p>Sebastian uses those shifts to build range around V2 while keeping the artist, rather than the styling, at the centre.</p></div>
          </div>
        </div>
      </section>

      <div className={styles.sectionDivider}><span>02</span><span>MUSIC VIDEO / SELECTED WORK</span><span>STOP THIS</span></div>
      <section className={styles.project} aria-labelledby="stop-title">
        <div className={styles.projectHeader}><div><p className={styles.kicker}>PERFORMANCE / PRESSURE</p><h2 id="stop-title">Stop<br /><i>This.</i></h2></div><p>A tight room, hard light, and a moving group give the performance its pressure. The direction stays close to the artist and the people around him.</p></div>
        <div className={styles.projectVideo}><PortfolioVideo id="stopThis" poster="stopThisPoster" label="Stop This music video" /></div>
        <div className={styles.projectMeta}><span>FORMAT / MUSIC VIDEO</span><span>FOCUS / PERFORMANCE &amp; ATMOSPHERE</span><span>FULL CREDITS / TO BE CONFIRMED</span></div>
      </section>

      <div className={styles.sectionDivider}><span>03</span><span>BRANDED FILM / SELECTED WORK</span><span>CAPONE</span></div>
      <section className={styles.project} aria-labelledby="capone-title">
        <div className={styles.projectHeader}><div><p className={styles.kicker}>BRANDED FILM / IN CONTEXT</p><h2 id="capone-title">Capone<br /><i>Chain.</i></h2></div><p>The chain is shown in use, on a person moving through the city. The product stays visible without separating it from the culture around it.</p></div>
        <div className={styles.projectVideo}><PortfolioVideo id="capone" poster="caponePoster" label="Capone branded chain video" /></div>
        <div className={styles.projectMeta}><span>FORMAT / BRANDED FILM</span><span>FOCUS / PRODUCT VISUALS</span><span>FULL CREDITS / TO BE CONFIRMED</span></div>
      </section>

      <footer className={styles.footer}><div><span>END OF SELECTED WORK / 003</span><strong>Work with Santo.</strong></div><div className={styles.footerLinks}><Link href="/contact">Start a project</Link><Link href="/account/production/settings">Studio login</Link></div></footer>
    </div>
  </main>;
}
