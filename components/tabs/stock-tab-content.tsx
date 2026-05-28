"use client"

import type { EditableRecord, ProductRecord, ProductionRecord } from "@/components/form/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SectionCard } from "./section-card"
import { viewConfigs } from "./view-configs"

export type StockContentTab = "stock" | "production"

type StockTabContentProps = {
  stockRecords: ProductRecord[]
  productionRecords: ProductionRecord[]
  activeTab: StockContentTab
  onTabChange: (tab: StockContentTab) => void
  onAddProductKind: () => void
  onAddProduction: () => void
  onEdit: (record: EditableRecord) => void
  onDelete: (id: string) => void
}

export function StockTabContent({
  stockRecords,
  productionRecords,
  activeTab,
  onTabChange,
  onAddProductKind,
  onAddProduction,
  onEdit,
  onDelete,
}: StockTabContentProps) {
  return (
    <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as StockContentTab)}>
      <TabsList className="grid h-10 w-full grid-cols-2 rounded-2xl bg-orange-100/70 p-1">
        <TabsTrigger value="stock" className="rounded-xl data-active:bg-white data-active:text-orange-700">
          Stok
        </TabsTrigger>
        <TabsTrigger value="production" className="rounded-xl data-active:bg-white data-active:text-orange-700">
          Riwayat produksi
        </TabsTrigger>
      </TabsList>

      <TabsContent value="stock" className="mt-2">
        <SectionCard
          view={viewConfigs.stock}
          kind="product"
          records={stockRecords}
          totalRecords={stockRecords.length}
          isLimited={false}
          addLabel="Tambah katalog pempek"
          onAdd={onAddProductKind}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </TabsContent>

      <TabsContent value="production" className="mt-2">
        <SectionCard
          view={viewConfigs.production}
          kind="production"
          records={productionRecords}
          totalRecords={productionRecords.length}
          isLimited={false}
          addLabel="Produksi baru"
          editHint="Riwayat produksi tersimpan"
          onAdd={onAddProduction}
          onDelete={onDelete}
        />
      </TabsContent>
    </Tabs>
  )
}
