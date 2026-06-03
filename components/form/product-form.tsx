"use client"

import * as React from "react"
import { uploadProductImage } from "@/actions/business/product-images"
import { Input } from "@/components/ui/input"
import { Field } from "./field"
import type { EntryValues, ProductRecord } from "./types"
import { valuesFromRecord } from "./helpers"

type ProductFormProps = {
  record: ProductRecord | null
  onSubmit: (values: EntryValues, id?: string) => Promise<void> | void
}

export function ProductForm({ record, onSubmit }: ProductFormProps) {
  const [values, setValues] = React.useState<EntryValues>(() => valuesFromRecord(record, "product"))
  const [imageFile, setImageFile] = React.useState<File | null>(null)
  const [imagePreview, setImagePreview] = React.useState(values.image)
  const [uploadError, setUploadError] = React.useState("")
  const [isUploading, setIsUploading] = React.useState(false)
  const previewUrlRef = React.useRef<string | null>(null)
  const patchValues = (patch: Partial<EntryValues>) =>
    setValues((current) => ({ ...current, ...patch }))

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
      setImagePreview(values.image)
      return
    }

    const previewUrl = URL.createObjectURL(file)
    previewUrlRef.current = previewUrl
    setImagePreview(previewUrl)
  }

  return (
    <form
      id="record-form"
      className="space-y-3"
      onSubmit={async (event) => {
        event.preventDefault()
        if (!values.name.trim()) return

        setUploadError("")
        setIsUploading(true)

        try {
          let image = values.image

          if (imageFile) {
            const formData = new FormData()
            formData.append("file", imageFile)
            image = await uploadProductImage(formData)
          }

          await onSubmit({ ...values, image }, record?.id)
        } catch (error) {
          setUploadError(error instanceof Error ? error.message : "Gagal mengunggah gambar.")
          return
        } finally {
          setIsUploading(false)
        }

        setValues(valuesFromRecord(null))
        setProductImage(null)
      }}
    >
      <Field label="Nama produk">
        <Input
          value={values.name}
          placeholder="Contoh: Pempek kulit"
          onChange={(event) => patchValues({ name: event.target.value })}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Stok">
          <Input
            inputMode="numeric"
            min="0"
            type="number"
            value={values.quantity}
            onChange={(event) => patchValues({ quantity: event.target.value })}
          />
        </Field>
        <Field label="Harga default">
          <Input
            inputMode="numeric"
            min="0"
            type="number"
            value={values.priceDefault || values.amount}
            onChange={(event) => patchValues({ priceDefault: event.target.value, amount: event.target.value })}
          />
        </Field>
      </div>

      <ProductPricesField values={values} onChange={setValues} />

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
          placeholder="Frozen, siap goreng, paling laris"
          onChange={(event) => patchValues({ note: event.target.value })}
        />
      </Field>
    </form>
  )
}

function ProductPricesField({
  values,
  onChange,
}: {
  values: EntryValues
  onChange: (values: EntryValues) => void
}) {
  const priceFields = [
    ["priceReseller", "Harga reseller"],
    ["priceOnline", "Harga online"],
  ] as const

  return (
    <div className="grid grid-cols-2 gap-3">
      {priceFields.map(([key, label]) => (
        <Field key={key} label={label}>
          <Input
            inputMode="numeric"
            min="0"
            type="number"
            value={values[key]}
            onChange={(event) => onChange({ ...values, [key]: event.target.value })}
          />
        </Field>
      ))}
    </div>
  )
}
