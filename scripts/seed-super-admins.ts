/**
 * Seeds the super admin accounts and the highlighted previous shoot.
 *
 * Run with: npm run seed:super-admins
 *
 * Safe to re-run - every step is idempotent.
 */
import { existsSync, readFileSync } from "fs";
import path from "path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { SUPER_ADMINS, SUPER_ADMIN_ROLE } from "../src/lib/auth/superAdmins";

const HIGHLIGHT_SHOOT = {
  title: "Feel Alive",
  slug: "feel-alive",
  description:
    "Music video shot with SANTOWRLDWIDE. A reference point for the energy we cast for.",
  category: "music-video",
  status: "completed" as const,
  youtubeUrl: "https://www.youtube.com/watch?v=FZ3ThLqeK-c",
  highlightOnPublic: true,
};

/** Minimal .env.local reader so the script runs without extra dependencies. */
function loadEnvFile(filePath: string) {
  if (!existsSync(filePath)) return;

  const contents = readFileSync(filePath, "utf8");

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function initAdmin() {
  if (getApps().length > 0) return;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL or FIREBASE_PRIVATE_KEY"
    );
  }

  initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    storageBucket:
      process.env.FIREBASE_STORAGE_BUCKET ||
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

async function seedSuperAdmins() {
  const auth = getAuth();
  const db = getFirestore();

  for (const admin of SUPER_ADMINS) {
    try {
      const userRecord = await auth.getUser(admin.uid);

      await auth.setCustomUserClaims(admin.uid, { role: SUPER_ADMIN_ROLE });

      await db
        .collection("users")
        .doc(admin.uid)
        .set(
          {
            email: userRecord.email ?? admin.email,
            role: SUPER_ADMIN_ROLE,
            updatedAt: Timestamp.now(),
          },
          { merge: true }
        );

      console.log(`Seeded super admin: ${admin.email} (${admin.uid})`);
    } catch (error) {
      console.error(`Failed to seed ${admin.email}:`, error);
    }
  }
}

async function seedHighlightShoot() {
  const db = getFirestore();

  const existing = await db
    .collection("shoots")
    .where("slug", "==", HIGHLIGHT_SHOOT.slug)
    .limit(1)
    .get();

  if (!existing.empty) {
    console.log(`Highlight shoot already exists: ${HIGHLIGHT_SHOOT.slug}`);
    return;
  }

  const now = Timestamp.now();
  await db.collection("shoots").add({
    ...HIGHLIGHT_SHOOT,
    createdAt: now,
    updatedAt: now,
  });

  console.log(`Created highlight shoot: ${HIGHLIGHT_SHOOT.title}`);
}

async function main() {
  loadEnvFile(path.resolve(process.cwd(), ".env.local"));
  loadEnvFile(path.resolve(process.cwd(), ".env"));

  initAdmin();

  await seedSuperAdmins();
  await seedHighlightShoot();

  console.log("Seeding complete.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });
