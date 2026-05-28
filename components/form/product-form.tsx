"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Field } from "./field"
import type { EntryValues, ProductRecord } from "./types"
import { valuesFromRecord } from "./helpers"

type ProductFormProps = {
  record: ProductRecord | null
  onSubmit: (values: EntryValues, id?: string) => void
}

export function ProductForm({ record, onSubmit }: ProductFormProps) {
  const [values, setValues] = React.useState<EntryValues>(() => valuesFromRecord(record, "product"))
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
