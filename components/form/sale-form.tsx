"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Field } from "./field"
import type { EntryValues, SaleRecord } from "./types"
import { valuesFromRecord } from "./helpers"

type SaleFormProps = {
  record: SaleRecord | null
  onSubmit: (values: EntryValues, id?: string) => void
}

export function SaleForm({ record, onSubmit }: SaleFormProps) {
  const [values, setValues] = React.useState<EntryValues>(() => valuesFromRecord(record, "sale"))
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
      <Field label="Produk terjual">
        <Input
          value={values.name}
          placeholder="Contoh: Pempek kulit"
          onChange={(event) => patchValues({ name: event.target.value })}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Porsi">
          <Input
            inputMode="numeric"
            min="0"
            type="number"
            value={values.quantity}
            onChange={(event) => patchValues({ quantity: event.target.value })}
          />
        </Field>
        <Field label="Total jual">
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
          placeholder="GoFood, COD, pelanggan tetap"
          onChange={(event) => patchValues({ note: event.target.value })}
        />
      </Field>
    </form>
  )
}
