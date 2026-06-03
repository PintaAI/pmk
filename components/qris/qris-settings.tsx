"use client"

import * as React from "react"
import jsQR from "jsqr"
import { CheckCircle2, ImageUp, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useQris } from "@/hooks/use-qris"
import { normalizeQRIS, validateQRIS } from "@/lib/qris"

export function QrisSettings() {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  const { hasQRIS, merchantName, merchantCity, setStaticQRIS, clearQRIS } = useQris()
  const [pendingPayload, setPendingPayload] = React.useState<string | null>(null)
  const [pendingInfo, setPendingInfo] = React.useState<{ merchantName?: string; merchantCity?: string } | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [isDecoding, setIsDecoding] = React.useState(false)

  async function handleFile(file: File) {
    setIsDecoding(true)
    setError(null)
    setPendingPayload(null)
    setPendingInfo(null)

    try {
      const payload = await decodeQRFromImage(file)
      const normalizedPayload = normalizeQRIS(payload)
      const validation = validateQRIS(normalizedPayload)

      if (!validation.valid) {
        throw new Error(validation.errors[0] ?? "QR yang diunggah bukan QRIS yang valid")
      }

      setPendingPayload(normalizedPayload)
      setPendingInfo({
        merchantName: validation.data?.merchantName,
        merchantCity: validation.data?.merchantCity,
      })
    } catch (decodeError) {
      setError(decodeError instanceof Error ? decodeError.message : "Gagal membaca gambar QRIS")
    } finally {
      setIsDecoding(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  return (
    <div className="rounded-xl border border-orange-200 bg-orange-50/60 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-950">QRIS statis merchant</p>
          <p className="mt-0.5 text-xs text-slate-600">
            Upload gambar QRIS statis. Saat checkout, nominal QRIS akan dibuat otomatis sesuai total belanja.
          </p>
        </div>
        {hasQRIS && <CheckCircle2 className="size-5 shrink-0 text-green-600" />}
      </div>

      {hasQRIS && !pendingPayload && (
        <div className="mt-3 rounded-lg border border-green-200 bg-white p-3 text-sm">
          <p className="font-medium text-slate-950">{merchantName ?? "QRIS tersimpan"}</p>
          {merchantCity && <p className="text-xs text-slate-500">{merchantCity}</p>}
        </div>
      )}

      {pendingPayload && pendingInfo && (
        <div className="mt-3 rounded-lg border border-orange-200 bg-white p-3 text-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-orange-700">Siap disimpan</p>
          <p className="mt-1 font-medium text-slate-950">{pendingInfo.merchantName ?? "QRIS valid"}</p>
          {pendingInfo.merchantCity && <p className="text-xs text-slate-500">{pendingInfo.merchantCity}</p>}
        </div>
      )}

      {error && <p className="mt-3 rounded-lg bg-red-50 p-2 text-xs text-red-700">{error}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void handleFile(file)
        }}
      />

      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isDecoding}>
          <ImageUp className="size-4" />
          {isDecoding ? "Membaca..." : hasQRIS ? "Ganti QRIS" : "Upload QRIS"}
        </Button>
        {pendingPayload && (
          <Button
            type="button"
            size="sm"
            className="bg-orange-600 text-white hover:bg-orange-700"
            onClick={() => {
              setStaticQRIS(pendingPayload)
              setPendingPayload(null)
              setPendingInfo(null)
            }}
          >
            Simpan QRIS
          </Button>
        )}
        {hasQRIS && (
          <Button type="button" size="sm" variant="ghost" className="text-destructive" onClick={clearQRIS}>
            <Trash2 className="size-4" />
            Hapus
          </Button>
        )}
      </div>
    </div>
  )
}

async function decodeQRFromImage(file: File) {
  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement("canvas")
  canvas.width = bitmap.width
  canvas.height = bitmap.height

  const context = canvas.getContext("2d")
  if (!context) throw new Error("Browser tidak mendukung pembacaan gambar")

  context.drawImage(bitmap, 0, 0)
  bitmap.close()

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
  const result = jsQR(imageData.data, imageData.width, imageData.height)

  if (!result?.data) {
    throw new Error("QR code tidak ditemukan pada gambar")
  }

  return result.data
}
