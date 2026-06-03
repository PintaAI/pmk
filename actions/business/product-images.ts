"use server"

import { put } from "@vercel/blob"

const maxImageSize = 4 * 1024 * 1024
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"])

export async function uploadProductImage(formData: FormData) {
  const file = formData.get("file")

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Pilih file gambar terlebih dahulu.")
  }

  if (file.size > maxImageSize) {
    throw new Error("Ukuran gambar maksimal 4 MB.")
  }

  if (!allowedImageTypes.has(file.type)) {
    throw new Error("Format gambar harus JPG, PNG, WebP, atau GIF.")
  }

  const blob = await put(`products/${crypto.randomUUID()}-${safeFileName(file.name)}`, file, {
    access: "public",
    addRandomSuffix: true,
    contentType: file.type,
  })

  return blob.url
}

function safeFileName(fileName: string) {
  const normalized = fileName.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "-")
  return normalized || "product-image"
}
