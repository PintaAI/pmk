import * as React from "react"
import { BoxesIcon, FactoryIcon, HomeIcon, ReceiptTextIcon, ShoppingCartIcon } from "lucide-react"
import type { RecordKind, ViewKey, ActiveRecordKind } from "@/components/form/types"

export type ViewConfig = {
  label: string
  title: string
  description: string
  icon: React.ReactNode
  defaultKind: RecordKind
  include: RecordKind[]
}

const activeRecordKinds: readonly ActiveRecordKind[] = ["sale", "product", "inventory", "purchase"]

export const viewConfigs: Record<ViewKey | "production" | "purchase", ViewConfig> = {
  home: {
    label: "Home",
    title: "Hari ini",
    description: "Ringkasan dan aktivitas terbaru.",
    icon: <HomeIcon className="size-5" />,
    defaultKind: "sale",
    include: [...activeRecordKinds],
  },
  sales: {
    label: "Kasir",
    title: "Kasir",
    description: "Pilih produk, atur keranjang, lalu checkout.",
    icon: <ShoppingCartIcon className="size-5" />,
    defaultKind: "sale",
    include: ["sale"],
  },
  stock: {
    label: "Stok",
    title: "Stok",
    description: "Produk siap jual dan katalog harga pempek.",
    icon: <BoxesIcon className="size-5" />,
    defaultKind: "product",
    include: ["product"],
  },
  production: {
    label: "Produksi",
    title: "Riwayat produksi",
    description: "Catatan produksi pempek dari bahan baku ke stok siap jual.",
    icon: <FactoryIcon className="size-5" />,
    defaultKind: "production",
    include: ["production"],
  },
  inventory: {
    label: "Inventori",
    title: "Inventori bahan",
    description: "Bahan baku yang tersedia untuk produksi.",
    icon: <ReceiptTextIcon className="size-5" />,
    defaultKind: "inventory",
    include: ["inventory", "purchase"],
  },
  purchase: {
    label: "Belanja",
    title: "Riwayat belanja",
    description: "Catatan pembelian bahan baku dan biaya per nota.",
    icon: <ReceiptTextIcon className="size-5" />,
    defaultKind: "purchase",
    include: ["purchase"],
  },
}
