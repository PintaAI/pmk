"use client"

import {
  BoxesIcon,
  FactoryIcon,
  PackagePlusIcon,
  ReceiptTextIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
} from "lucide-react"

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"

type QuickActionsDrawerProps = {
  open: boolean
  cartQuantity: number
  onOpenChange: (open: boolean) => void
  onOpenSales: () => void
  onOpenCart: () => void
  onAddProduct: () => void
  onAddProduction: () => void
  onAddInventory: () => void
  onAddPurchase: () => void
}

export function QuickActionsDrawer({
  open,
  cartQuantity,
  onOpenChange,
  onOpenSales,
  onOpenCart,
  onAddProduct,
  onAddProduction,
  onAddInventory,
  onAddPurchase,
}: QuickActionsDrawerProps) {
  const actions = [
    {
      label: "Buka kasir",
      helper: "Pilih pempek dan masuk keranjang.",
      icon: <ShoppingCartIcon className="size-5" />,
      onClick: onOpenSales,
    },
    {
      label: cartQuantity > 0 ? `Keranjang (${cartQuantity})` : "Buka keranjang",
      helper: "Cek order sebelum checkout.",
      icon: <ShoppingBagIcon className="size-5" />,
      onClick: onOpenCart,
    },
    {
      label: "Tambah katalog",
      helper: "Menu pempek, harga, dan stok awal.",
      icon: <BoxesIcon className="size-5" />,
      onClick: onAddProduct,
    },
    {
      label: "Catat produksi",
      helper: "Pakai bahan, tambah stok siap jual.",
      icon: <FactoryIcon className="size-5" />,
      onClick: onAddProduction,
    },
    {
      label: "Tambah bahan",
      helper: "Update inventori bahan baku.",
      icon: <PackagePlusIcon className="size-5" />,
      onClick: onAddInventory,
    },
    {
      label: "Belanja bahan",
      helper: "Catat nota pembelian bahan.",
      icon: <ReceiptTextIcon className="size-5" />,
      onClick: onAddPurchase,
    },
  ]

  const runAction = (action: () => void) => {
    onOpenChange(false)
    action()
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto max-w-md rounded-t-[2rem] bg-white">
        <DrawerHeader className="text-left">
          <DrawerTitle>Menu cepat</DrawerTitle>
          <DrawerDescription>Aksi yang paling sering dipakai, langsung dari bawah.</DrawerDescription>
        </DrawerHeader>
        <div className="grid grid-cols-2 gap-3 px-4 pb-6">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              className="flex min-h-28 flex-col items-start justify-between rounded-3xl border border-orange-100 bg-orange-50/70 p-4 text-left text-slate-950 shadow-sm transition hover:border-orange-200 hover:bg-orange-100 active:scale-[0.98]"
              onClick={() => runAction(action.onClick)}
            >
              <span className="grid size-10 place-items-center rounded-2xl bg-white text-orange-700 shadow-sm">
                {action.icon}
              </span>
              <span>
                <span className="block text-sm font-bold leading-tight">{action.label}</span>
                <span className="mt-1 block text-xs leading-snug text-slate-500">{action.helper}</span>
              </span>
            </button>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
