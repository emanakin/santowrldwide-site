import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { R2_PUBLIC_BASE } from "@/lib/media";

export interface UploadedFile {
  url: string;
  path: string;
}

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET;

// Falls back to the public dev URL already used for the site videos
const publicBase = (process.env.R2_PUBLIC_BASE_URL || R2_PUBLIC_BASE).replace(
  /\/$/,
  ""
);

let client: S3Client | null = null;

function getClient(): S3Client {
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error(
      "R2 storage is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY and R2_BUCKET."
    );
  }

  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: true,
    });
  }

  return client;
}

export function isR2Configured(): boolean {
  return Boolean(accountId && accessKeyId && secretAccessKey && bucket);
}

/** Uploads a buffer to R2 and returns its public URL. */
export async function uploadBuffer(
  path: string,
  buffer: Buffer,
  contentType: string
): Promise<UploadedFile> {
  const s3 = getClient();

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: path,
      Body: buffer,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000",
    })
  );

  return { url: `${publicBase}/${path}`, path };
}
