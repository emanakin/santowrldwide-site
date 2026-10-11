import { adminDb } from "@/lib/firebase/admin/firebaseAdmin";

const approvalRef = () => {
  if (!adminDb) throw new Error("Firebase Admin is not configured");
  return adminDb.collection("production_settings").doc("outreach");
};

export async function productionMailStatus() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM, SANTO_POSTAL_ADDRESS } = process.env;
  const port = Number(SMTP_PORT);
  const smtpConfigured = Boolean(SMTP_HOST && Number.isInteger(port) && port > 0 && port <= 65535 && SMTP_USER && SMTP_PASSWORD && SMTP_FROM);
  const postalAddressConfigured = Boolean(SANTO_POSTAL_ADDRESS?.trim());
  const approval = await approvalRef().get();
  const portfolioReady = approval.exists
    ? approval.data()?.portfolioApproved === true
    : process.env.PRODUCTIONS_PORTFOLIO_READY === "true";
  return { smtpConfigured, postalAddressConfigured, portfolioReady, canSend: smtpConfigured && postalAddressConfigured && portfolioReady };
}

export async function setPortfolioApproval(approved: boolean) {
  await approvalRef().set({ portfolioApproved: approved, reviewedAt: new Date().toISOString() }, { merge: true });
  return productionMailStatus();
}
