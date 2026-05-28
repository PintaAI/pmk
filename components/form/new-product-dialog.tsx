"use client"

import * as React from "react"
import { PlusIcon } from "lucide-react"

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
      note?: string
    }
  ) => void
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
    note: "",
  })
  const setField = (key: keyof ProductDraft, value: string) =>
    setValues((current) => ({ ...current, [key]: value }))

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
          onSubmit={(event) => {
            event.preventDefault()
            if (!values.name.trim()) return
            onCreateProductKind(values.name.trim(), {
              priceDefault: toNumber(values.priceDefault),
              priceReseller: toNumber(values.priceReseller),
              priceOnline: toNumber(values.priceOnline),
              quantity: toNumber(values.quantity),
              note: values.note.trim() || undefined,
            })
            onOpenChange(false)
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
            disabled={!values.name.trim()}
          >
            <PlusIcon />
            Buat jenis
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
