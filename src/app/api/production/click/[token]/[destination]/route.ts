import { adminDb } from "@/lib/firebase/admin/firebaseAdmin";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const destinations = {
  portfolio: { url: "https://santowrldwide.com/productions", first: "portfolioClickedAt", last: "portfolioLastClickedAt", count: "portfolioClickCount" },
  booking: { url: "https://santowrldwide.com/book/zeb", first: "bookingClickedAt", last: "bookingLastClickedAt", count: "bookingClickCount" },
} as const;

type Params = { params: Promise<{ token: string; destination: string }> };

export async function GET(request: NextRequest, context: Params) {
  const { token, destination } = await context.params;
  const target = destinations[destination as keyof typeof destinations];
  if (!target) return new Response("Not found", { status: 404 });

  const purpose = `${request.headers.get("purpose") || ""} ${request.headers.get("sec-purpose") || ""}`;
  if (adminDb && /^[A-Za-z0-9_-]{32}$/.test(token) && !/prefetch/i.test(purpose)) {
    try {
      const match = await adminDb.collection("production_drafts")
        .where("trackingToken", "==", token).limit(1).get();
      const document = match.docs[0];
      if (document) {
        await adminDb.runTransaction(async (transaction) => {
          const current = await transaction.get(document.ref);
          const draft = current.data();
          if (draft?.status !== "sent" || draft?.trackOpens !== true) return;
          const now = new Date().toISOString();
          transaction.update(document.ref, {
            clickCount: Math.min(Number(draft.clickCount || 0) + 1, 9999),
            [target.first]: draft[target.first] || now,
            [target.last]: now,
            [target.count]: Math.min(Number(draft[target.count] || 0) + 1, 9999),
          });
        });
      }
    } catch (error) {
      console.error("Production click tracking failed", error);
    }
  }
  return new Response(null, {
    status: 302,
    headers: {
      Location: target.url,
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Referrer-Policy": "no-referrer",
      "X-Robots-Tag": "noindex",
    },
  });
}
