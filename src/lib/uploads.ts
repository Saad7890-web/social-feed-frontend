import type {
  ImageDeliveryType,
  PostImagePayload,
  Visibility,
} from "../types/post";
import { request, unwrap } from "./api";
import { ensureCsrfToken } from "./csrf";

type CloudinarySignResponse = {
  signature?: string;
  timestamp?: number | string;
  apiKey?: string;
  api_key?: string;
  cloudName?: string;
  cloud_name?: string;
  folder?: string;
  publicId?: string;
  public_id?: string;
  uploadUrl?: string;
  upload_url?: string;
  url?: string;
  deliveryType?: ImageDeliveryType;
  delivery_type?: ImageDeliveryType;
  resourceType?: string;
  resource_type?: string;
};

type CloudinaryUploadResult = {
  public_id?: string;
  version?: number | string;
  signature?: string;
  format?: string | null;
  width?: number | null;
  height?: number | null;
  bytes?: number | null;
  secure_url?: string;
  url?: string;
};

function toStringValue(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function toNumberValue(value: unknown): number | null {
  const numberValue =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim().length > 0
        ? Number(value)
        : Number.NaN;

  return Number.isFinite(numberValue) ? numberValue : null;
}

function normalizeSignResponse(input: unknown): CloudinarySignResponse {
  const root = unwrap(input) as Record<string, unknown> | null;

  if (!root || typeof root !== "object") {
    return {};
  }

  return {
    signature: toStringValue(root.signature),
    timestamp: root.timestamp ?? root.ts,
    apiKey: toStringValue(root.apiKey ?? root.api_key),
    cloudName: toStringValue(root.cloudName ?? root.cloud_name),
    folder: toStringValue(root.folder),
    publicId: toStringValue(root.publicId ?? root.public_id),
    uploadUrl: toStringValue(root.uploadUrl ?? root.upload_url ?? root.url),
    deliveryType:
      toStringValue(root.deliveryType ?? root.delivery_type) === "authenticated"
        ? "authenticated"
        : "upload",
    resourceType: toStringValue(root.resourceType ?? root.resource_type),
  };
}

function buildCloudinaryUploadUrl(sign: CloudinarySignResponse) {
  const explicitUrl =
    sign.uploadUrl ?? import.meta.env.VITE_CLOUDINARY_UPLOAD_URL ?? null;

  if (explicitUrl) {
    return explicitUrl;
  }

  const cloudName =
    sign.cloudName ?? import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ?? null;

  if (!cloudName) {
    throw new Error(
      "Cloudinary upload is not configured. Add VITE_CLOUDINARY_CLOUD_NAME or return uploadUrl from the sign endpoint.",
    );
  }

  return `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
}

export async function signImageUpload(
  file: File,
  visibility: Visibility,
): Promise<CloudinarySignResponse> {
  await ensureCsrfToken();

  const payload = await request<unknown>({
    method: "post",
    url: "/uploads/images/sign",
    data: {
      fileName: file.name,
      mimeType: file.type,
      fileSize: file.size,
      visibility,
    },
  });

  return normalizeSignResponse(payload);
}

export async function uploadImageToCloudinary(
  file: File,
  visibility: Visibility,
): Promise<PostImagePayload> {
  const sign = await signImageUpload(file, visibility);

  if (!sign.signature || sign.timestamp == null) {
    throw new Error("Unable to prepare the image upload.");
  }

  const uploadUrl = buildCloudinaryUploadUrl(sign);
  const formData = new FormData();

  formData.append("file", file);
  formData.append("timestamp", String(sign.timestamp));
  formData.append("signature", sign.signature);

  const apiKey = sign.apiKey ?? import.meta.env.VITE_CLOUDINARY_API_KEY ?? null;
  if (apiKey) {
    formData.append("api_key", apiKey);
  }

  if (sign.folder) {
    formData.append("folder", sign.folder);
  }

  if (sign.publicId) {
    formData.append("public_id", sign.publicId);
  }

  if (sign.resourceType) {
    formData.append("resource_type", sign.resourceType);
  }

  const response = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
  });

  const data = (await response
    .json()
    .catch(() => null)) as CloudinaryUploadResult | null;

  if (!response.ok) {
    const message =
      (data &&
      typeof data === "object" &&
      "error" in data &&
      typeof (data as { error?: { message?: string } }).error?.message ===
        "string"
        ? (data as { error?: { message?: string } }).error?.message
        : null) ?? "Unable to upload the image.";
    throw new Error(message);
  }

  const publicId = toStringValue(data?.public_id) ?? sign.publicId ?? null;

  const version = toNumberValue(data?.version);
  const signature = toStringValue(data?.signature) ?? sign.signature ?? null;

  if (!publicId || version == null || !signature) {
    throw new Error("The image upload response is incomplete.");
  }

  return {
    publicId,
    version,
    signature,
    format: toStringValue(data?.format),
    width: toNumberValue(data?.width),
    height: toNumberValue(data?.height),
    bytes: toNumberValue(data?.bytes),
    deliveryType:
      sign.deliveryType ??
      (visibility === "private" ? "authenticated" : "upload"),
  };
}
