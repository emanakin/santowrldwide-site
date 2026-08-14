"use client";

import { useEffect } from "react";

/**
 * Safari (especially iPhone notch / home-indicator) paints html/body behind
 * the page. Force those surfaces black for full-bleed video routes.
 */
export default function DarkChrome() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    html.setAttribute("data-theme", "dark");
    body.setAttribute("data-theme", "dark");

    return () => {
      html.removeAttribute("data-theme");
      body.removeAttribute("data-theme");
    };
  }, []);

  return null;
}
