import { App, cert, getApps, initializeApp } from "firebase-admin/app";

export function initializeFirebaseAdmin(): App {
  const apps = getApps();

  if (apps.length > 0) {
    return apps[0];
  }

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}
