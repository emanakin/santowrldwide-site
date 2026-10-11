import type { Metadata } from "next";
import BookingPage from "@/components/production/BookingPage";

export const metadata: Metadata = { title: "Book a Studio Call | SANTOWRLDWIDE", robots: { index: false, follow: false } };
export default function Page() { return <BookingPage />; }
