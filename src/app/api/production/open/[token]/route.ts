import { adminDb } from "@/lib/firebase/admin/firebaseAdmin";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const pixel = Buffer.from("R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=", "base64");

export async function GET(_request: NextRequest, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  if (adminDb && /^[A-Za-z0-9_-]{32}$/.test(token)) {
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
            openedAt: draft.openedAt || now,
            lastOpenedAt: now,
            openCount: Math.min(Number(draft.openCount || 0) + 1, 9999),
          });
        });
      }
    } catch (error) {
      console.error("Production open tracking failed", error);
    }
  }
  return new Response(pixel, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Content-Length": String(pixel.length),
      "X-Content-Type-Options": "nosniff",
    },
  });
}
