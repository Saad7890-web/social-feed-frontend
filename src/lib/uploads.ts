import type { ApiEnvelope } from "../types/api";
import type { PostImagePayload, Visibility } from "../types/post";
import { request, unwrap } from "./api";

type UploadSignature = {
  cloudName: string;
  apiKey: string;
  uploadUrl: string;
  timestamp: number;
  signature: string;
  folder: string;
  publicId: string;
  deliveryType: "upload" | "authenticated";
  resourceType: "image";
  maxImageSizeBytes: number;
  allowedContentTypes: string[];
  fileName: string;
};

type SignResponse = {
  upload: UploadSignature;
};

type VerifyResponse = {
  image: PostImagePayload;
};

type CloudinaryUploadResponse = {
  public_id?: string;
  version?: number | string;
  signature?: string;
  format?: string | null;
  width?: number | null;
  height?: number | null;
  bytes?: number | null;
};

function asString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function normalizeSignResponse(
  payload: ApiEnvelope<SignResponse> | SignResponse,
): UploadSignature {
  const data = unwrap(payload) as SignResponse | null;

  if (
    !data ||
    typeof data !== "object" ||
    !("upload" in data) ||
    !data.upload
  ) {
    throw new Error("Upload signature response is invalid.");
  }

  return data.upload;
}

function normalizeCloudinaryResponse(data: CloudinaryUploadResponse) {
  const publicId = asString(data.public_id);
  const version = asNumber(data.version);
  const signature = asString(data.signature);

  if (!publicId || version == null || !signature) {
    throw new Error("The image upload response is incomplete.");
  }

  return {
    publicId,
    version,
    signature,
    format: asString(data.format),
    width: asNumber(data.width),
    height: asNumber(data.height),
    bytes: asNumber(data.bytes),
  };
}

export async function signImageUpload(file: File, visibility: Visibility) {
  const payload = await request<SignResponse>({
    method: "post",
    url: "/uploads/images/sign",
    data: {
      fileName: file.name,
      contentType: file.type,
      size: file.size,
      visibility,
    },
  });

  return normalizeSignResponse(payload);
}

async function uploadToCloudinary(file: File, sign: UploadSignature) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("timestamp", String(sign.timestamp));
  formData.append("signature", sign.signature);
  formData.append("api_key", sign.apiKey);
  formData.append("public_id", sign.publicId);
  formData.append("folder", sign.folder);

  if (sign.deliveryType) {
    formData.append("type", sign.deliveryType);
  }

  const response = await fetch(sign.uploadUrl, {
    method: "POST",
    body: formData,
  });

  const raw = (await response.json().catch(() => null)) as
    | CloudinaryUploadResponse
    | { error?: { message?: string } }
    | null;

  if (!response.ok) {
    const message =
      raw && "error" in raw && typeof raw.error?.message === "string"
        ? raw.error.message
        : "Unable to upload the image.";
    throw new Error(message);
  }

  return normalizeCloudinaryResponse(raw as CloudinaryUploadResponse);
}

async function verifyUploadedImage(image: {
  publicId: string;
  version: number;
  signature: string;
  format?: string | null;
  width?: number | null;
  height?: number | null;
  bytes?: number | null;
  deliveryType: "upload" | "authenticated";
}): Promise<PostImagePayload> {
  const payload = await request<VerifyResponse>({
    method: "post",
    url: "/uploads/images/verify",
    data: image,
  });

  return unwrap(payload).image;
}

export async function uploadPostImage(
  file: File,
  visibility: Visibility,
): Promise<PostImagePayload> {
  const sign = await signImageUpload(file, visibility);
  const uploaded = await uploadToCloudinary(file, sign);

  return verifyUploadedImage({
    publicId: uploaded.publicId,
    version: uploaded.version,
    signature: uploaded.signature,
    format: uploaded.format ?? null,
    width: uploaded.width ?? null,
    height: uploaded.height ?? null,
    bytes: uploaded.bytes ?? null,
    deliveryType: sign.deliveryType,
  });
}
