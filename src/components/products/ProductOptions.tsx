"use client";
import React from "react";
import styles from "@/styles/products/ProductOptions.module.css";
import { ProductOption, ProductVariant } from "@/types/product-types";

type ProductOptionsProps = {
  options?: ProductOption[];
  variants?: ProductVariant[];
  selectedOptions: Record<string, string>;
  onOptionChange: (options: Record<string, string>) => void;
};

export default function ProductOptions({
  options,
  variants,
  selectedOptions,
  onOptionChange,
}: ProductOptionsProps) {
  // Handle option selection
  const handleOptionChange = (optionName: string, value: string) => {
    const newOptions = {
      ...selectedOptions,
      [optionName]: value,
    };
    onOptionChange(newOptions);
  };

  // Check if an option value creates a valid/available variant
  const isOptionValueAvailable = (optionName: string, value: string) => {
    if (!variants) return true;

    const testOptions = { ...selectedOptions, [optionName]: value };

    return variants.some((variant) => {
      const matches = variant.selectedOptions.every(
        (option) =>
          testOptions[option.name] === undefined ||
          testOptions[option.name] === option.value
      );
      return matches && variant.availableForSale;
    });
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
            {option.values.map((value) => {
              const isAvailable = isOptionValueAvailable(option.name, value);
              const isSelected = selectedOptions[option.name] === value;

              return (
                <button
                  key={`${option.name}-${value}`}
                  className={`${styles.optionValue} ${
                    isSelected ? styles.selected : ""
                  } ${!isAvailable ? styles.unavailable : ""}`}
                  onClick={() => handleOptionChange(option.name, value)}
                  disabled={!isAvailable}
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
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
