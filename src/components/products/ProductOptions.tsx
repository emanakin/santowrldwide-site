"use client";
import React, { useState } from "react";
import styles from "@/styles/products/ProductOptions.module.css";

type OptionType = {
  id: string;
  name: string;
  values: string[];
};

type VariantType = {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: {
    name: string;
    value: string;
  }[];
};

type ProductOptionsProps = {
  options?: OptionType[];
  variants?: VariantType[];
};

export default function ProductOptions({
  options,
  variants,
}: ProductOptionsProps) {
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});

  // Handle option selection
  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value,
    }));
  };

  if (!options || options.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      {options.map((option) => (
        <div key={option.id} className={styles.optionContainer}>
          <h3 className={styles.optionName}>{option.name}</h3>
          <div className={styles.optionValues}>
            {option.values.map((value) => (
              <button
                key={`${option.name}-${value}`}
                className={`${styles.optionValue} ${
                  selectedOptions[option.name] === value ? styles.selected : ""
                }`}
                onClick={() => handleOptionChange(option.name, value)}
              >
                {option.name.toLowerCase() === "color" ? (
                  <span
                    className={styles.colorSwatch}
                    style={{
                      backgroundColor: value.toLowerCase().includes("black")
                        ? "#000"
                        : value.toLowerCase().includes("white")
                        ? "#fff"
                        : value.toLowerCase(),
                    }}
                  />
                ) : (
                  value
                )}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
