"use client"

import * as React from "react"
import { PlusIcon, Trash2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { EntryValues, IngredientForm, InventoryItemRecord, OutputForm, ProductRecord, ProductionRecord } from "./types"
import { emptyIngredient, emptyOutput, toNumber, updateById, valuesFromRecord } from "./helpers"

type ProductionFormProps = {
  record: ProductionRecord | null
  products: ProductRecord[]
  inventoryItems: InventoryItemRecord[]
  onSubmit: (values: EntryValues, id?: string) => void
}

export function ProductionForm({ record, products, inventoryItems, onSubmit }: ProductionFormProps) {
  const [values, setValues] = React.useState<EntryValues>(() => valuesFromRecord(record, "production"))
  const canSubmit =
    values.ingredients.some((item) => item.inventoryItemId && toNumber(item.quantity) > 0) &&
    values.outputs.some((item) => item.productId && toNumber(item.quantity) > 0) &&
    values.ingredients.every((item) => {
      if (!item.inventoryItemId || toNumber(item.quantity) <= 0) return true
      const inventoryItem = inventoryItems.find((r) => r.id === item.inventoryItemId)
      return toNumber(item.quantity) <= (inventoryItem?.quantity ?? 0)
    })

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
      <ProductionInventoryField
        inventoryItems={inventoryItems}
        values={values}
        onChange={setValues}
      />
      <ProductionProductField
        products={products}
        values={values}
        onChange={setValues}
      />

      <Field label="Catatan">
        <Input
          value={values.note}
          placeholder="Selesai jam 10, frozen, siap goreng"
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
        {record ? "Simpan edit" : "Simpan produksi"}
      </Button>
    </form>
  )
}

function ProductionProductField({
  products,
  values,
  onChange,
}: {
  products: ProductRecord[]
  values: EntryValues
  onChange: (values: EntryValues) => void
}) {
  const updateOutput = (id: string, patch: Partial<OutputForm>) =>
    onChange({ ...values, outputs: updateById(values.outputs, id, patch) })

  return (
    <div className="space-y-3 rounded-2xl border border-orange-100 bg-orange-50 p-3">
      <p className="text-sm font-semibold text-orange-950">Hasil produksi</p>
      {values.outputs.map((output) => (
        <div key={output.id} className="grid grid-cols-[1fr_5rem_auto] gap-2">
          <select
            className="h-9 rounded-md border border-input bg-white px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            value={output.productId}
            onChange={(event) => updateOutput(output.id, { productId: event.target.value })}
          >
            <option value="">Pilih pempek</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} ({product.quantity} stok)
              </option>
            ))}
          </select>
          <Input
            inputMode="numeric"
            min="0"
            type="number"
            value={output.quantity}
            placeholder="Qty"
            onChange={(event) => updateOutput(output.id, { quantity: event.target.value })}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={values.outputs.length === 1}
            onClick={() =>
              onChange({ ...values, outputs: values.outputs.filter((row) => row.id !== output.id) })
            }
          >
            <Trash2Icon />
            <span className="sr-only">Hapus hasil</span>
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        className="w-full bg-white"
        onClick={() => onChange({ ...values, outputs: [...values.outputs, emptyOutput()] })}
      >
        <PlusIcon />
        Tambah hasil
      </Button>
    </div>
  )
}

function ProductionInventoryField({
  inventoryItems,
  values,
  onChange,
}: {
  inventoryItems: InventoryItemRecord[]
  values: EntryValues
  onChange: (values: EntryValues) => void
}) {
  const updateIngredient = (id: string, patch: Partial<IngredientForm>) =>
    onChange({ ...values, ingredients: updateById(values.ingredients, id, patch) })

  return (
    <div className="space-y-3 rounded-2xl border border-orange-100 bg-orange-50 p-3">
      <p className="text-sm font-semibold text-orange-950">Bahan dari inventori</p>
      {values.ingredients.map((ingredient) => {
        const selectedInventory = inventoryItems.find((item) => item.id === ingredient.inventoryItemId)

        return (
          <div key={ingredient.id} className="space-y-2 rounded-2xl bg-white p-3 ring-1 ring-orange-100">
            <div className="grid grid-cols-[1fr_5rem_auto] gap-2">
              <select
                className="h-9 rounded-md border border-input bg-white px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                value={ingredient.inventoryItemId}
                onChange={(event) => updateIngredient(ingredient.id, { inventoryItemId: event.target.value })}
              >
                <option value="">Pilih bahan</option>
                {inventoryItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.quantity} tersedia)
                  </option>
                ))}
              </select>
              <Input
                inputMode="numeric"
                min="0"
                max={selectedInventory?.quantity}
                type="number"
                value={ingredient.quantity}
                placeholder="Qty"
                onChange={(event) => updateIngredient(ingredient.id, { quantity: event.target.value })}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={values.ingredients.length === 1}
                onClick={() =>
                  onChange({
                    ...values,
                    ingredients: values.ingredients.filter((row) => row.id !== ingredient.id),
                  })
                }
              >
                <Trash2Icon />
                <span className="sr-only">Hapus bahan</span>
              </Button>
            </div>
            <p className="text-xs text-orange-900">
              {selectedInventory
                ? `Sisa setelah produksi: ${Math.max(0, selectedInventory.quantity - toNumber(ingredient.quantity))}`
                : "Pilih bahan baku dari inventori."}
            </p>
          </div>
        )
      })}
      <Button
        type="button"
        variant="outline"
        className="w-full bg-white"
        onClick={() =>
          onChange({ ...values, ingredients: [...values.ingredients, emptyIngredient()] })
        }
      >
        <PlusIcon />
        Tambah bahan dipakai
      </Button>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const id = React.useId()

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor={id}>
        {label}
      </label>
      {React.isValidElement<{ id?: string }>(children)
        ? React.cloneElement(children, { id })
        : children}
    </div>
  )
}
