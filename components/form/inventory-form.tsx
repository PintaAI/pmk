"use client"

import * as React from "react"
import { PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field } from "./field"
import type { EntryValues, InventoryItemRecord } from "./types"
import { valuesFromRecord } from "./helpers"

type InventoryFormProps = {
  record: InventoryItemRecord | null
  onSubmit: (values: EntryValues, id?: string) => void
}

export function InventoryForm({ record, onSubmit }: InventoryFormProps) {
  const [values, setValues] = React.useState<EntryValues>(() => valuesFromRecord(record, "inventory"))
  const patchValues = (patch: Partial<EntryValues>) =>
    setValues((current) => ({ ...current, ...patch }))

  return (
    <form
      id="record-form"
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault()
        if (!values.name.trim()) return
        onSubmit(values, record?.id)
        setValues(valuesFromRecord(null))
      }}
    >
      <Field label="Nama bahan">
        <Input
          value={values.name}
          placeholder="Contoh: Ikan tenggiri"
          onChange={(event) => patchValues({ name: event.target.value })}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Jumlah stok">
          <Input
            inputMode="numeric"
            min="0"
            type="number"
            value={values.quantity}
            onChange={(event) => patchValues({ quantity: event.target.value })}
          />
        </Field>
        <Field label="Harga satuan">
          <Input
            inputMode="numeric"
            min="0"
            type="number"
            value={values.amount}
            onChange={(event) => patchValues({ amount: event.target.value })}
          />
        </Field>
      </div>

      <Field label="Catatan">
        <Input
          value={values.note}
          placeholder="kg, liter, bungkus, supplier, pasar"
          onChange={(event) => patchValues({ note: event.target.value })}
        />
      </Field>

      <Button
        type="submit"
        className="w-full bg-orange-600 text-white hover:bg-orange-700"
        disabled={!values.name.trim()}
      >
        <PlusIcon />
        {record ? "Simpan edit" : "Simpan bahan"}
      </Button>
    </form>
  )
}
