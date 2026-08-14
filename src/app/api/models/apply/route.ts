import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createApplication, getShootBySlug } from "@/services/api/models";
import { isR2Configured, uploadBuffer } from "@/lib/storage/r2";
import {
  sendModelApplicationConfirmation,
  sendModelApplicationNotification,
  ModelApplicationEmailData,
} from "@/services/email/emailService";
import { SUPER_ADMIN_EMAILS } from "@/lib/auth/superAdmins";
import {
  ALLOWED_PHOTO_TYPES,
  MAX_APPLICATION_PHOTOS,
  MAX_PHOTO_BYTES,
  MIN_APPLICATION_PHOTOS,
} from "@/types/model-types";

export const dynamic = "force-dynamic";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BOT_PATTERNS = [
  /bot/i,
  /crawl/i,
  /spider/i,
  /scraper/i,
  /headless/i,
  /curl/i,
  /wget/i,
  /selenium/i,
  /puppeteer/i,
];

function readField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function fileExtension(type: string): string {
  switch (type) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/heic":
      return "heic";
    default:
      return "jpg";
  }
}

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || "";

    if (BOT_PATTERNS.some((pattern) => pattern.test(userAgent))) {
      console.warn(`Suspected bot model application: ${userAgent}`);
      // Honeypot: look successful without persisting anything
      return NextResponse.json({
        success: true,
        message: "Application received.",
      });
    }

    const formData = await request.formData();

    const shootSlug = readField(formData, "shootSlug");
    const fullName = readField(formData, "fullName");
    const email = readField(formData, "email").toLowerCase();
    const phone = readField(formData, "phone");
    const instagram = readField(formData, "instagram");
    const city = readField(formData, "city");
    const note = readField(formData, "note");

    if (!shootSlug) {
      return NextResponse.json(
        { error: "A shoot must be selected." },
        { status: 400 }
      );
    }

    if (!fullName) {
      return NextResponse.json(
        { error: "Full name is required." },
        { status: 400 }
      );
    }

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "A valid email is required." },
        { status: 400 }
      );
    }

    const shoot = await getShootBySlug(shootSlug);
    if (!shoot) {
      return NextResponse.json({ error: "Shoot not found." }, { status: 404 });
    }

    if (shoot.status !== "open") {
      return NextResponse.json(
        { error: "Applications for this shoot are closed." },
        { status: 409 }
      );
    }

    const photos = formData
      .getAll("photos")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);

    if (photos.length < MIN_APPLICATION_PHOTOS) {
      return NextResponse.json(
        { error: "Please attach at least one photo." },
        { status: 400 }
      );
    }

    if (photos.length > MAX_APPLICATION_PHOTOS) {
      return NextResponse.json(
        { error: `Please attach no more than ${MAX_APPLICATION_PHOTOS} photos.` },
        { status: 400 }
      );
    }

    for (const photo of photos) {
      if (!ALLOWED_PHOTO_TYPES.includes(photo.type)) {
        return NextResponse.json(
          { error: "Photos must be JPG, PNG, WEBP or HEIC." },
          { status: 400 }
        );
      }
      if (photo.size > MAX_PHOTO_BYTES) {
        return NextResponse.json(
          { error: "Each photo must be under 8MB." },
          { status: 400 }
        );
      }
    }

    if (!isR2Configured()) {
      console.error("R2 storage is not configured, cannot accept photos");
      return NextResponse.json(
        { error: "Applications are temporarily unavailable. Try again later." },
        { status: 503 }
      );
    }

    const uploadKey = randomUUID();
    const photoUrls: string[] = [];

    for (const [index, photo] of photos.entries()) {
      const buffer = Buffer.from(await photo.arrayBuffer());
      const storagePath = `model-applications/${uploadKey}/${
        index + 1
      }.${fileExtension(photo.type)}`;

      const uploaded = await uploadBuffer(storagePath, buffer, photo.type);
      photoUrls.push(uploaded.url);
    }

    const application = await createApplication({
      shootId: shoot.id,
      shootTitle: shoot.title,
      fullName,
      email,
      phone: phone || undefined,
      instagram: instagram || undefined,
      city: city || undefined,
      note: note || undefined,
      photoUrls,
    });

    const emailPayload: ModelApplicationEmailData = {
      fullName,
      email,
      phone: phone || undefined,
      instagram: instagram || undefined,
      city: city || undefined,
      note: note || undefined,
      shootTitle: shoot.title,
      photoUrls,
    };

    const recipients = Array.from(
      new Set(
        [process.env.ADMIN_EMAIL, ...SUPER_ADMIN_EMAILS].filter(
          (value): value is string => Boolean(value)
        )
      )
    );

    // Emails are best-effort - the application is already saved
    await Promise.allSettled([
      sendModelApplicationNotification(emailPayload, recipients),
      sendModelApplicationConfirmation(emailPayload),
    ]);

    return NextResponse.json({
      success: true,
      applicationId: application.id,
      message: "Application received. We'll be in touch if it's a fit.",
    });
  } catch (error) {
    console.error("Error processing model application:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
