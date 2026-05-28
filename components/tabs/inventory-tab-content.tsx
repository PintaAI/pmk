"use client"

import type { EditableRecord, InventoryItemRecord, PurchaseRecord } from "@/components/form/types"
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
  return (
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
          totalRecords={inventoryRecords.length}
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
          totalRecords={purchaseRecords.length}
          isLimited={false}
          addLabel="Belanja baru"
          editHint="Riwayat belanja tersimpan"
          onAdd={onAddPurchase}
          onDelete={onDelete}
        />
      </TabsContent>
    </Tabs>
  )
}
