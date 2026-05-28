"use client"

import * as React from "react"
import {
  BoxesIcon,
  ReceiptTextIcon,
  ShoppingCartIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { cn } from "@/lib/utils"
import { SaleForm } from "./sale-form"
import { ProductForm } from "./product-form"
import { InventoryForm } from "./inventory-form"
import { ProductionForm } from "./production-form"
import { PurchaseForm } from "./purchase-form"
import type {
  EditableRecord,
  EntryValues,
  InventoryItemRecord,
  ProductRecord,
  ProductionRecord,
  PurchaseRecord,
  RecordKind,
  SaleRecord,
} from "./types"

export const formConfigs: Record<RecordKind, { label: string; title: string; helper: string; icon: React.ReactNode }> = {
  sale: {
    label: "Kasir",
    title: "Catat penjualan",
    helper: "Order masuk, total uang, dan sumber transaksi.",
    icon: <ShoppingCartIcon className="size-4" />,
  },
  product: {
    label: "Stok",
    title: "Update stok",
    helper: "Menu siap jual dan harga per porsi.",
    icon: <BoxesIcon className="size-4" />,
  },
  production: {
    label: "Produksi",
    title: "Catat produksi",
    helper: "Pakai bahan dari inventori, lalu tambah stok siap jual.",
    icon: <ReceiptTextIcon className="size-4" />,
  },
  inventory: {
    label: "Inventori",
    title: "Belanja bahan baku",
    helper: "Catat bahan seperti ikan, tepung, telur, cabai, atau kemasan.",
    icon: <ReceiptTextIcon className="size-4" />,
  },
  purchase: {
    label: "Belanja",
    title: "Belanja bahan baku",
    helper: "Catat tanggal dan beberapa bahan baku dalam satu nota.",
    icon: <ReceiptTextIcon className="size-4" />,
  },
}

type RecordDrawerProps = {
  open: boolean
  kind: RecordKind
  record: EditableRecord | null
  availableKinds: readonly RecordKind[]
  products: ProductRecord[]
  inventoryItems: InventoryItemRecord[]
  onKindChange: (kind: RecordKind) => void
  onOpenChange: (open: boolean) => void
  onSubmit: (kind: RecordKind, values: EntryValues, id?: string) => void
}

export function RecordDrawer({
  open,
  kind,
  record,
  availableKinds,
  products,
  inventoryItems,
  onKindChange,
  onOpenChange,
  onSubmit,
}: RecordDrawerProps) {
  const config = formConfigs[kind]
  const showKindPicker = !record && availableKinds.length > 1

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto max-w-md rounded-t-[2rem] bg-white">
        <DrawerHeader className="text-left">
          <DrawerTitle>{record ? `Edit ${config.label}` : config.title}</DrawerTitle>
          <DrawerDescription>{config.helper}</DrawerDescription>
        </DrawerHeader>
        <div className="space-y-4 overflow-y-auto px-4 pb-2">
          {showKindPicker ? (
            <KindPicker value={kind} availableKinds={availableKinds} onChange={onKindChange} />
          ) : null}

          <EntryForm
            key={`${record?.id ?? "new"}-${kind}`}
            kind={kind}
            record={record}
            products={products}
            inventoryItems={inventoryItems}
            onSubmit={onSubmit}
          />
        </div>
        <DrawerFooter className="pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function KindPicker({
  value,
  availableKinds,
  onChange,
}: {
  value: RecordKind
  availableKinds: readonly RecordKind[]
  onChange: (kind: RecordKind) => void
}) {
  return (
    <div
      className={cn(
        "grid gap-2",
        availableKinds.length === 2 ? "grid-cols-2" : "grid-cols-3"
      )}
    >
      {availableKinds.map((kind) => (
        <Button
          key={kind}
          type="button"
          variant={value === kind ? "default" : "outline"}
          className={cn(
            "h-auto flex-col gap-1 py-2 text-xs",
            value === kind && "bg-orange-600 text-white hover:bg-orange-700"
          )}
          onClick={() => onChange(kind)}
        >
          {formConfigs[kind].icon}
          {formConfigs[kind].label}
        </Button>
      ))}
    </div>
  )
}

function EntryForm({
  kind,
  record,
  products,
  inventoryItems,
  onSubmit,
}: {
  kind: RecordKind
  record: EditableRecord | null
  products: ProductRecord[]
  inventoryItems: InventoryItemRecord[]
  onSubmit: (kind: RecordKind, values: EntryValues, id?: string) => void
}) {
  switch (kind) {
    case "sale":
      return <SaleForm record={record as SaleRecord | null} onSubmit={(values, id) => onSubmit(kind, values, id)} />
    case "product":
      return <ProductForm record={record as ProductRecord | null} onSubmit={(values, id) => onSubmit(kind, values, id)} />
    case "inventory":
      return <InventoryForm record={record as InventoryItemRecord | null} onSubmit={(values, id) => onSubmit(kind, values, id)} />
    case "production":
      return (
        <ProductionForm
          record={record as ProductionRecord | null}
          products={products}
          inventoryItems={inventoryItems}
          onSubmit={(values, id) => onSubmit(kind, values, id)}
        />
      )
    case "purchase":
      return <PurchaseForm record={record as PurchaseRecord | null} inventoryItems={inventoryItems} onSubmit={(values, id) => onSubmit(kind, values, id)} />
  }
}
