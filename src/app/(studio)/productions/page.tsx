import type { Metadata } from "next";
import ProductionPortfolio from "@/components/production/ProductionPortfolio";

export const metadata: Metadata = {
  title: "Productions | SANTOWRLDWIDE",
  description: "Music videos, visual direction, and production inquiries for SANTOWRLDWIDE.",
};

export default function ProductionsPage() {
  return <ProductionPortfolio />;
}
