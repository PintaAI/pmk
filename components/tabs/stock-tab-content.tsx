"use client"

import * as React from "react"
import type { EditableRecord, InventoryItemRecord, ProductRecord, ProductionRecord } from "@/components/form/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency, getProductPrice } from "@/components/form/helpers"
import { PlusIcon, Trash2Icon } from "lucide-react"
import { SectionCard } from "./section-card"
import { viewConfigs } from "./view-configs"

export type StockContentTab = "stock" | "production"

type StockTabContentProps = {
  stockRecords: ProductRecord[]
  productionRecords: ProductionRecord[]
  inventoryItems: InventoryItemRecord[]
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
  inventoryItems,
  activeTab,
  onTabChange,
  onAddProductKind,
  onAddProduction,
  onEdit,
  onDelete,
}: StockTabContentProps) {
  const [selectedProduction, setSelectedProduction] = React.useState<ProductionRecord | null>(null)

  return (
    <>
      <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as StockContentTab)}>
        <TabsList className="grid h-10 w-full grid-cols-2 rounded-2xl bg-orange-100/70 p-1">
          <TabsTrigger value="stock" className="rounded-xl data-active:bg-white data-active:text-orange-700">
            Stok
          </TabsTrigger>
          <TabsTrigger value="production" className="rounded-xl data-active:bg-white data-active:text-orange-700">
            Riwayat produksi
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stock" className="mt-2 min-h-0">
          <ProductCatalogCard
            products={stockRecords}
            onAdd={onAddProductKind}
            onEdit={(product) => onEdit(product)}
            onDelete={onDelete}
          />
        </TabsContent>

        <TabsContent value="production" className="mt-2">
          <SectionCard
            view={viewConfigs.production}
            kind="production"
            records={productionRecords}
            isLimited={false}
            addLabel="Produksi baru"
            onAdd={onAddProduction}
            onEdit={(record) => setSelectedProduction(record as ProductionRecord)}
            onDelete={onDelete}
          />
        </TabsContent>
      </Tabs>

      <ProductionDetailDrawer
        production={selectedProduction}
        products={stockRecords}
        inventoryItems={inventoryItems}
        open={Boolean(selectedProduction)}
        onOpenChange={(open) => {
          if (!open) setSelectedProduction(null)
        }}
      />
    </>
  )
}

function ProductCatalogCard({
  products,
  onAdd,
  onEdit,
  onDelete,
}: {
  products: ProductRecord[]
  onAdd: () => void
  onEdit: (product: ProductRecord) => void
  onDelete: (id: string) => void
}) {
  return (
    <Card className="flex h-[calc(100svh-15rem)] min-h-0 flex-col overflow-hidden bg-white md:h-[calc(100svh-10rem)]">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle>Katalog pempek</CardTitle>
          <Button
            type="button"
            size="sm"
            className="bg-orange-600 text-white hover:bg-orange-700"
            onClick={onAdd}
          >
            <PlusIcon />
            Tambah
          </Button>
        </div>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-hidden">
        {products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-orange-200 p-5 text-center text-sm text-slate-500">
            Belum ada produk di katalog.
          </div>
        ) : (
          <div className="h-full min-h-0 space-y-3 overflow-y-auto overscroll-contain pr-1">
            {products.map((product) => (
              <ProductCatalogItem
                key={product.id}
                product={product}
                onEdit={() => onEdit(product)}
                onDelete={() => onDelete(product.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ProductCatalogItem({
  product,
  onEdit,
  onDelete,
}: {
  product: ProductRecord
  onEdit: () => void
  onDelete: () => void
}) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return
    event.preventDefault()
    onEdit()
  }
  const stockLabel = product.quantity > 0 ? `${product.quantity} stok` : "Habis"

  return (
    <div
      className="group flex items-center gap-3 rounded-3xl border border-orange-100 bg-[#fff8ed] p-3 text-left shadow-sm transition hover:border-orange-200 hover:bg-orange-50/80 hover:shadow-md"
      role="button"
      tabIndex={0}
      onClick={onEdit}
      onKeyDown={handleKeyDown}
    >
      <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-orange-100 sm:size-24">
        {product.image ? (
          <div
            className="size-full bg-cover bg-center transition duration-300 group-hover:scale-105"
            style={{ backgroundImage: `url(${product.image})` }}
            role="img"
            aria-label={product.name}
          />
        ) : (
          <div className="grid size-full place-items-center text-orange-700 [&_svg]:size-9">
            {viewConfigs.stock.icon}
          </div>
        )}
        <Badge className="absolute left-1.5 top-1.5 border-0 bg-white/90 px-2 py-0.5 text-[0.65rem] text-orange-700 shadow-sm backdrop-blur">
          {stockLabel}
        </Badge>
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-950 sm:text-base">{product.name}</p>
            {product.note ? <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{product.note}</p> : null}
          </div>
        </div>
        <p className="text-lg font-black tracking-tight text-orange-700">
          {formatCurrency(getProductPrice(product, "default"))}
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="shrink-0 text-slate-500 hover:bg-white hover:text-red-600"
        onClick={(event) => {
          event.stopPropagation()
          onDelete()
        }}
      >
        <Trash2Icon />
        <span className="sr-only">Hapus {product.name}</span>
      </Button>
    </div>
  )
}

function ProductionDetailDrawer({
  production,
  products,
  inventoryItems,
  open,
  onOpenChange,
}: {
  production: ProductionRecord | null
  products: ProductRecord[]
  inventoryItems: InventoryItemRecord[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const getProductName = (id: string) => products.find((product) => product.id === id)?.name ?? "Produk terhapus"
  const getInventoryName = (id: string) => inventoryItems.find((item) => item.id === id)?.name ?? "Bahan terhapus"

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto max-w-md rounded-t-[2rem] bg-white">
        <DrawerHeader className="text-left">
          <DrawerTitle>Detail produksi</DrawerTitle>
          <DrawerDescription>
            {production ? `${production.createdAt.slice(0, 10)} · ${production.quantity} item` : "Rincian produksi"}
          </DrawerDescription>
        </DrawerHeader>
        {production ? (
          <div className="space-y-4 overflow-y-auto px-4 pb-2">
            <div className="space-y-2 rounded-2xl border border-orange-100 bg-orange-50 p-3">
              <p className="text-sm font-semibold text-orange-900">Hasil produksi</p>
              {production.outputs.map((item) => (
                <div key={item.id} className="rounded-2xl bg-white p-3 ring-1 ring-orange-100">
                  <div className="flex items-center justify-between gap-3">
                    <p className="min-w-0 truncate text-sm font-medium text-slate-950">{getProductName(item.productId)}</p>
                    <p className="shrink-0 text-sm font-semibold text-orange-900">{item.quantity} item</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm font-semibold text-slate-900">Bahan dipakai</p>
              {production.ingredients.map((item) => (
                <div key={item.id} className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                  <div className="flex items-center justify-between gap-3">
                    <p className="min-w-0 truncate text-sm font-medium text-slate-950">
                      {getInventoryName(item.inventoryItemId)}
                    </p>
                    <p className="shrink-0 text-sm font-semibold text-slate-900">{item.quantity} unit</p>
                  </div>
                </div>
              ))}
            </div>

            {production.note ? (
              <div className="rounded-2xl border border-slate-200 p-3 text-sm text-slate-500">{production.note}</div>
            ) : null}
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
