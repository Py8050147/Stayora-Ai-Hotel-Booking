import "dotenv/config";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

// Neon Object Storage automatically picks up AWS_ENDPOINT_URL_S3 and credentials from .env
export const s3 = new S3Client({ forcePathStyle: true });
export const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || "assets";

/**
 * Uploads a File (from FormData) to Neon S3 and returns the object Key
 */
export async function uploadFileToNeonS3(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop() || "jpg";
  const key = `uploads/hotels/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type || "image/jpeg",
    }),
  );

  return key;
}

/**
 * Uploads a Base64 image string to Neon S3 and returns the object Key
 */
export async function uploadBase64ToNeonS3(imageStr: string): Promise<string> {
  // If it's already an uploaded URL or S3 key, return it directly
  if (!imageStr.startsWith("data:image/")) {
    return imageStr;
  }

  const matches = imageStr.match(/^data:(image\/(\w+));base64,(.+)$/);
  if (!matches) {
    throw new Error("Invalid base64 image string");
  }

  const contentType = matches[1];
  const ext = matches[2];
  const buffer = Buffer.from(matches[3], "base64");
  const key = `uploads/stayora/hotels/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );

  return key;
}

/**
 * Generates a signed viewing URL from an S3 key stored in Neon DB
 */
export async function getSignedImageUrl(key: string): Promise<string> {
  if (key.startsWith("http://") || key.startsWith("https://")) {
    return key;
  }

  return await getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key }),
    { expiresIn: 3600 },
  );
}

export default s3;
