"use client";

/**
 * Unsigned client-side upload to Cloudinary.
 *
 * Requires two env vars (see .env.example):
 *   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
 *   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET   (an *unsigned* upload preset)
 *
 * Works for both images (passport photo, documents) and short videos.
 */
export async function uploadToCloudinary(
  file: File | Blob,
  onProgress?: (percent: number) => void,
  folder: string = "visaai/documents"
): Promise<{ url: string; publicId: string }> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary is not configured yet. Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to .env.local (see .env.example)."
    );
  }

  const resourceType = file.type.startsWith("video") ? "video" : "image";
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  const formData = new FormData();
  formData.append("file", file, file instanceof File ? file.name : `${Date.now()}.webm`);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        resolve({ url: data.secure_url, publicId: data.public_id });
      } else {
        reject(new Error("Upload failed. Check your Cloudinary preset settings."));
      }
    };

    xhr.onerror = () => reject(new Error("Network error while uploading to Cloudinary."));
    xhr.send(formData);
  });
}
