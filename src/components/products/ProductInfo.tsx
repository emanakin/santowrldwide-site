import React from "react";
import styles from "@/styles/products/ProductInfo.module.css";

type ProductInfoProps = {
  title: string;
  price: string;
};

export default function ProductInfo({ title, price }: ProductInfoProps) {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.price}>${price}</p>
    </div>
  );
}
