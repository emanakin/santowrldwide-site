import React from "react";
import styles from "@/styles/products/ProductDescription.module.css";

type ProductDescriptionProps = {
  description: string;
};

export default function ProductDescription({
  description,
}: ProductDescriptionProps) {
  // Format description by converting bullet points into HTML list
  const formatDescription = (text: string) => {
    const paragraphs = text.split("\n\n");

    return paragraphs.map((paragraph, i) => {
      // Check if paragraph contains bullet points (lines starting with - or •)
      if (paragraph.match(/^[-•]/m)) {
        const listItems = paragraph
          .split("\n")
          .filter((line) => line.trim().length > 0)
          .map((line) => line.replace(/^[-•]\s*/, ""));

        return (
          <ul key={i} className={styles.bulletList}>
            {listItems.map((item, j) => (
              <li key={j} className={styles.bulletItem}>
                {item}
              </li>
            ))}
          </ul>
        );
      }

      return (
        <p key={i} className={styles.paragraph}>
          {paragraph}
        </p>
      );
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>{formatDescription(description)}</div>
    </div>
  );
}
