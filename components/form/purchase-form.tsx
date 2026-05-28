"use client"

import * as React from "react"
import { PlusIcon, Trash2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field } from "./field"
import type { InventoryItemRecord, PurchaseItemForm, EntryValues, PurchaseRecord } from "./types"
import { emptyPurchaseItem, formatCurrency, toNumber, updateById, valuesFromRecord } from "./helpers"

type PurchaseFormProps = {
  record: PurchaseRecord | null
  inventoryItems: InventoryItemRecord[]
  onSubmit: (values: EntryValues, id?: string) => void
}

export function PurchaseForm({ record, inventoryItems, onSubmit }: PurchaseFormProps) {
  const [values, setValues] = React.useState<EntryValues>(() => valuesFromRecord(record, "purchase"))
  const canSubmit = values.purchaseItems.some(
    (item) => item.name.trim() && toNumber(item.quantity) > 0
  )

  return (
    <form
      id="record-form"
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault()
        if (!canSubmit) return
        onSubmit(values, record?.id)
        setValues(valuesFromRecord(null))
      }}
    >
      <PurchaseItemsField values={values} onChange={setValues} inventoryItems={inventoryItems} />

      <Field label="Catatan">
        <Input
          value={values.note}
          placeholder="Supplier, pasar, catatan nota"
          onChange={(event) =>
            setValues((current) => ({ ...current, note: event.target.value }))
          }
        />
      </Field>

      <Button
        type="submit"
        className="w-full bg-orange-600 text-white hover:bg-orange-700"
        disabled={!canSubmit}
      >
        <PlusIcon />
        {record ? "Simpan edit" : "Simpan belanja"}
      </Button>
    </form>
  )
}

function PurchaseItemsField({
  values,
  onChange,
  inventoryItems,
}: {
  values: EntryValues
  onChange: (values: EntryValues) => void
  inventoryItems: InventoryItemRecord[]
}) {
  const total = values.purchaseItems.reduce(
    (sum, item) => sum + toNumber(item.quantity) * toNumber(item.price),
    0
  )
  const updateItem = (id: string, patch: Partial<PurchaseItemForm>) =>
    onChange({ ...values, purchaseItems: updateById(values.purchaseItems, id, patch) })
  const isInInventory = (name: string) => inventoryItems.some((i) => i.name === name)
  const getInventoryItem = (name: string) => inventoryItems.find((i) => i.name === name)

  const [customItems, setCustomItems] = React.useState<Set<string>>(new Set())
  const toggleCustom = (id: string) =>
    setCustomItems((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <div className="space-y-3">
      <Field label="Tanggal belanja">
        <Input
          type="date"
          value={values.date}
          onChange={(event) => onChange({ ...values, date: event.target.value })}
        />
      </Field>
      <div className="space-y-3 rounded-2xl border border-orange-100 bg-orange-50 p-3">
        {values.purchaseItems.map((item, index) => {
          const isCustom = customItems.has(item.id) || (item.name !== "" && !isInInventory(item.name))

          return (
            <div key={item.id} className="space-y-2 rounded-2xl bg-white p-3 ring-1 ring-orange-100">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">Bahan {index + 1}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={values.purchaseItems.length === 1}
                  onClick={() =>
                    onChange({
                      ...values,
                      purchaseItems: values.purchaseItems.filter((row) => row.id !== item.id),
                    })
                  }
                >
                  <Trash2Icon />
                  <span className="sr-only">Hapus bahan</span>
                </Button>
              </div>

              {isCustom ? (
                <Input
                  value={item.name}
                  placeholder="Nama bahan"
                  onChange={(event) => updateItem(item.id, { name: event.target.value })}
                />
              ) : (
                <select
                  className="h-9 w-full rounded-md border border-input bg-white px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  value={isInInventory(item.name) ? item.name : ""}
                  onChange={(event) => {
                    if (event.target.value === "__custom__") {
                      toggleCustom(item.id)
                    } else {
                      const selected = getInventoryItem(event.target.value)
                      if (selected) {
                        updateItem(item.id, { name: selected.name, price: String(selected.unitPrice) })
                      }
                    }
                  }}
                >
                  <option value="">Pilih bahan</option>
                  {inventoryItems.map((inv) => (
                    <option key={inv.id} value={inv.name}>
                      {inv.name} (stok: {inv.quantity})
                    </option>
                  ))}
                  <option value="__custom__">+ Custom</option>
                </select>
              )}
              {!isCustom && !isInInventory(item.name) && item.name && (
                <button
                  type="button"
                  className="text-xs text-orange-600 underline"
                  onClick={() => toggleCustom(item.id)}
                >
                  Edit nama bahan
                </button>
              )}

              <div className="grid grid-cols-2 gap-2">
                <Input
                  inputMode="numeric"
                  min="0"
                  type="number"
                  value={item.quantity}
                  placeholder="Qty"
                  onChange={(event) => updateItem(item.id, { quantity: event.target.value })}
                />
                <Input
                  inputMode="numeric"
                  min="0"
                  type="number"
                  value={item.price}
                  placeholder="Harga satuan"
                  onChange={(event) => updateItem(item.id, { price: event.target.value })}
                />
              </div>
            </div>
          )
        })}
        <Button
          type="button"
          variant="outline"
          className="w-full bg-white"
          onClick={() =>
            onChange({
              ...values,
              purchaseItems: [...values.purchaseItems, emptyPurchaseItem()],
            })
          }
        >
          <PlusIcon />
          Tambah bahan
        </Button>
        <p className="text-sm font-semibold text-orange-900">Total {formatCurrency(total)}</p>
      </div>
    </div>
  )
}
