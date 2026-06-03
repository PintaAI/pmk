"use client"

import * as React from "react"
import type { EditableRecord, InventoryItemRecord, PurchaseRecord } from "@/components/form/types"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SectionCard } from "./section-card"
import { viewConfigs } from "./view-configs"

export type InventoryContentTab = "inventory" | "purchase"

type InventoryTabContentProps = {
  inventoryRecords: InventoryItemRecord[]
  purchaseRecords: PurchaseRecord[]
  activeTab: InventoryContentTab
  onTabChange: (tab: InventoryContentTab) => void
  onAddInventory: () => void
  onAddPurchase: () => void
  onEdit: (record: EditableRecord) => void
  onDelete: (id: string) => void
}

export function InventoryTabContent({
  inventoryRecords,
  purchaseRecords,
  activeTab,
  onTabChange,
  onAddInventory,
  onAddPurchase,
  onEdit,
  onDelete,
}: InventoryTabContentProps) {
  const [selectedPurchase, setSelectedPurchase] = React.useState<PurchaseRecord | null>(null)

  return (
    <>
      <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as InventoryContentTab)}>
        <TabsList className="grid h-10 w-full grid-cols-2 rounded-2xl bg-orange-100/70 p-1">
          <TabsTrigger value="inventory" className="rounded-xl data-active:bg-white data-active:text-orange-700">
            Bahan
          </TabsTrigger>
          <TabsTrigger value="purchase" className="rounded-xl data-active:bg-white data-active:text-orange-700">
            Riwayat belanja
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="mt-2">
          <SectionCard
            view={viewConfigs.inventory}
            kind="inventory"
            records={inventoryRecords}
            isLimited={false}
            addLabel="Tambah bahan"
            onAdd={onAddInventory}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </TabsContent>

        <TabsContent value="purchase" className="mt-2">
          <SectionCard
            view={viewConfigs.purchase}
            kind="purchase"
            records={purchaseRecords}
            isLimited={false}
            addLabel="Belanja baru"
            onAdd={onAddPurchase}
            onEdit={(record) => setSelectedPurchase(record as PurchaseRecord)}
            onDelete={onDelete}
          />
        </TabsContent>
      </Tabs>

      <PurchaseDetailDrawer
        purchase={selectedPurchase}
        open={Boolean(selectedPurchase)}
        onOpenChange={(open) => {
          if (!open) setSelectedPurchase(null)
        }}
      />
    </>
  )
}

function PurchaseDetailDrawer({
  purchase,
  open,
  onOpenChange,
}: {
  purchase: PurchaseRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto max-w-md rounded-t-[2rem] bg-white">
        <DrawerHeader className="text-left">
          <DrawerTitle>Detail belanja</DrawerTitle>
          <DrawerDescription>
            {purchase ? `${purchase.date} · ${purchase.items.length} bahan` : "Rincian nota belanja"}
          </DrawerDescription>
        </DrawerHeader>
        {purchase ? (
          <div className="space-y-4 overflow-y-auto px-4 pb-2">
            <div className="space-y-2 rounded-2xl border border-orange-100 bg-orange-50 p-3">
              {purchase.items.map((item) => (
                <div key={item.id} className="rounded-2xl bg-white p-3 ring-1 ring-orange-100">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-950">{item.name}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.quantity} x {formatCurrency(item.price)}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-orange-900">
                      {formatCurrency(item.quantity * item.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-slate-200 p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-500">Total belanja</span>
                <span className="font-semibold text-slate-950">{formatCurrency(purchase.amount)}</span>
              </div>
              {purchase.note ? <p className="mt-2 text-sm text-slate-500">{purchase.note}</p> : null}
            </div>
          </div>
        ) : null}
        <DrawerFooter className="pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value)
}
