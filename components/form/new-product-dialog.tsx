"use client"

import * as React from "react"
import { PlusIcon } from "lucide-react"

import { uploadProductImage } from "@/actions/business/product-images"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Field } from "@/components/form/field"
import { toNumber } from "@/components/form/helpers"

type ProductDraft = {
  name: string
  priceDefault: string
  priceReseller: string
  priceOnline: string
  quantity: string
  image: string
  note: string
}

type NewProductDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateProductKind: (
    name: string,
    prices?: {
      priceDefault?: number
      priceReseller?: number
      priceOnline?: number
      quantity?: number
      image?: string
      note?: string
    }
  ) => Promise<void> | void
}

const numberFields = [
  ["priceDefault", "Harga default"],
  ["quantity", "Stok awal"],
  ["priceReseller", "Harga reseller"],
  ["priceOnline", "Harga online"],
] as const

export function NewProductDialog({
  open,
  onOpenChange,
  onCreateProductKind,
}: NewProductDialogProps) {
  const [values, setValues] = React.useState<ProductDraft>({
    name: "",
    priceDefault: "",
    priceReseller: "",
    priceOnline: "",
    quantity: "",
    image: "",
    note: "",
  })
  const [imageFile, setImageFile] = React.useState<File | null>(null)
  const [imagePreview, setImagePreview] = React.useState("")
  const [uploadError, setUploadError] = React.useState("")
  const [isUploading, setIsUploading] = React.useState(false)
  const previewUrlRef = React.useRef<string | null>(null)
  const setField = (key: keyof ProductDraft, value: string) =>
    setValues((current) => ({ ...current, [key]: value }))

  React.useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
      }
    }
  }, [])

  const setProductImage = (file: File | null) => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }

    setUploadError("")
    setImageFile(file)

    if (!file) {
      setImagePreview("")
      return
    }

    const previewUrl = URL.createObjectURL(file)
    previewUrlRef.current = previewUrl
    setImagePreview(previewUrl)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Buat jenis baru</DialogTitle>
          <DialogDescription>Tambah produk siap jual dengan tiga level harga.</DialogDescription>
        </DialogHeader>
        <form
          id="dialog-new-product"
          className="space-y-3"
          onSubmit={async (event) => {
            event.preventDefault()
            if (!values.name.trim()) return

            setUploadError("")
            setIsUploading(true)

            try {
              let image = values.image.trim() || undefined

              if (imageFile) {
                const formData = new FormData()
                formData.append("file", imageFile)
                image = await uploadProductImage(formData)
              }

              await onCreateProductKind(values.name.trim(), {
                priceDefault: toNumber(values.priceDefault),
                priceReseller: toNumber(values.priceReseller),
                priceOnline: toNumber(values.priceOnline),
                quantity: toNumber(values.quantity),
                image,
                note: values.note.trim() || undefined,
              })
              onOpenChange(false)
            } catch (error) {
              setUploadError(error instanceof Error ? error.message : "Gagal mengunggah gambar.")
            } finally {
              setIsUploading(false)
            }
          }}
        >
          <Field label="Nama produk">
            <Input
              value={values.name}
              onChange={(event) => setField("name", event.target.value)}
              placeholder="Contoh: Pempek kulit"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            {numberFields.map(([key, label]) => (
              <Field key={key} label={label}>
                <Input
                  inputMode="numeric"
                  min="0"
                  type="number"
                  value={values[key]}
                  onChange={(event) => setField(key, event.target.value)}
                />
              </Field>
            ))}
          </div>
          <Field label="Gambar produk">
            <div className="space-y-2">
              {imagePreview ? (
                <div
                  className="h-32 rounded-2xl bg-orange-100 bg-cover bg-center ring-1 ring-orange-100"
                  style={{ backgroundImage: `url(${imagePreview})` }}
                  role="img"
                  aria-label={values.name || "Preview gambar produk"}
                />
              ) : null}
              <Input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                disabled={isUploading}
                onChange={(event) => setProductImage(event.target.files?.[0] ?? null)}
              />
              <p className="text-xs text-slate-500">Upload JPG, PNG, WebP, atau GIF maksimal 4 MB.</p>
              {uploadError ? <p className="text-xs text-red-600">{uploadError}</p> : null}
            </div>
          </Field>
          <Field label="Catatan">
            <Input
              value={values.note}
              onChange={(event) => setField("note", event.target.value)}
              placeholder="Frozen, siap goreng, paling laris"
            />
          </Field>
        </form>
        <DialogFooter showCloseButton>
          <Button
            type="submit"
            form="dialog-new-product"
            className="bg-orange-600 text-white hover:bg-orange-700"
            disabled={!values.name.trim() || isUploading}
          >
            <PlusIcon />
            {isUploading ? "Mengunggah..." : "Buat jenis"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
