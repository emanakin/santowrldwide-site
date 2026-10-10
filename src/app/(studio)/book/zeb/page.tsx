import type { Metadata } from "next";
import BookingPage from "@/components/production/BookingPage";

export const metadata: Metadata = { title: "Meet Zeb | SANTOWRLDWIDE", robots: { index: false, follow: false } };
export default function Page() { return <BookingPage />; }
