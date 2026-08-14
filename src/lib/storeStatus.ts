/**
 * Pause sales when a drop is finished. Flip this (or set
 * NEXT_PUBLIC_STORE_PAUSED=false) when the next drop goes live.
 */
export const STORE_PAUSED =
  process.env.NEXT_PUBLIC_STORE_PAUSED !== "false";

export const SOLD_OUT_LABEL = "Sold Out";
export const SOLD_OUT_MESSAGE = "This drop is sold out.";
