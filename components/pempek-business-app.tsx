"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query"

import { CartDrawer, FlyToCartProvider } from "@/components/cart"
import { CheckoutDialog, ThermalReceipt, type ThermalReceiptData } from "@/components/checkout"
import { useBtPrint, BtPrintDialog, type BtPreparedState } from "@/components/printer"
import { isNativeApp } from "@/components/printer"
import { formatEscPosCurrency, type EscPosReceipt } from "@/lib/escpos-print"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import {
  BottomNav,
  HomeTabContent,
  type InventoryContentTab,
  InventoryTabContent,
  QuickActionsDrawer,
  SalesTabContent,
  StockTabContent,
  type StockContentTab,
  viewConfigs,
} from "@/components/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RecordDrawer } from "@/components/form/record-drawer"
import type { CartItem, CheckoutPayload, EditableRecord, EntryValues, PaymentMethod, PriceKind, RecordKind, ViewKey } from "@/components/form/types"
import { formatCurrency, getCartRows, getCartSummary, getProductPrice } from "@/components/form/helpers"
import { paymentMethodLabels } from "@/components/form/constants"
import { NewProductDialog } from "@/components/form/new-product-dialog"
import { SettingsIcon } from "lucide-react"
import { getDrawerKinds, type BusinessMetrics } from "@/components/form/record-helpers"
import { HeroSummary } from "@/components/hero-summary"
import { deleteInventoryItem, getInventoryItems, saveInventoryItem } from "@/actions/business/inventory"
import { createProductKind, deleteProduct, getProducts, saveProduct } from "@/actions/business/products"
import { createProduction, deleteProduction, getProductions } from "@/actions/business/productions"
import { createPurchase, deletePurchase, getPurchases } from "@/actions/business/purchases"
import { checkoutCart, deleteSale, saveSale } from "@/actions/business/sales"

const queryKeys = {
  products: ["business", "products"],
  inventoryItems: ["business", "inventoryItems"],
  purchases: ["business", "purchases"],
  productions: ["business", "productions"],
} as const

export function PempekWorkspace({ initialDashboard }: { initialDashboard: BusinessMetrics }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [, startTransition] = React.useTransition()
  const [activeView, setActiveView] = React.useState<ViewKey>("home")
  const [activeKind, setActiveKind] = React.useState<RecordKind>("sale")
  const [editingRecord, setEditingRecord] = React.useState<EditableRecord | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)
  const [isCartDrawerOpen, setIsCartDrawerOpen] = React.useState(false)
  const [isQuickActionsOpen, setIsQuickActionsOpen] = React.useState(false)
  const [cart, setCart] = React.useState<CartItem[]>([])
  const [salePriceKind, setSalePriceKind] = React.useState<PriceKind>("default")
  const [stockTab, setStockTab] = React.useState<StockContentTab>("stock")
  const [inventoryTab, setInventoryTab] = React.useState<InventoryContentTab>("inventory")
  const [isProductDialogOpen, setIsProductDialogOpen] = React.useState(false)
  const [productDialogKey, setProductDialogKey] = React.useState(0)
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = React.useState(false)
  const [receiptToPrint, setReceiptToPrint] = React.useState<ThermalReceiptData | null>(null)
  const receiptToRetry = React.useRef<EscPosReceipt | null>(null)
  const shouldRefreshAfterPrint = React.useRef(false)
  const {
    printState,
    preparedState,
    prepareBluetoothPrinter,
    printPreparedOrBluetooth,
    printViaBluetooth,
    selectAndPrint,
    reset: resetBtPrint,
    disconnectPreparedPrinter,
  } = useBtPrint()

  const refreshDashboard = React.useCallback(() => {
    startTransition(() => {
      router.refresh()
    })
  }, [router])

  const closeBtPrintDialog = React.useCallback(() => {
    resetBtPrint()
    if (shouldRefreshAfterPrint.current) {
      shouldRefreshAfterPrint.current = false
      refreshDashboard()
    }
  }, [refreshDashboard, resetBtPrint])

  const view = viewConfigs[activeView]
  const needsProducts = activeView === "sales" || activeView === "stock" || (isDrawerOpen && activeKind === "production")
  const needsInventoryItems = activeView === "inventory" || (isDrawerOpen && activeKind === "production")
  const productsQuery = useQuery({
    queryKey: queryKeys.products,
    queryFn: getProducts,
    enabled: needsProducts,
  })
  const inventoryItemsQuery = useQuery({
    queryKey: queryKeys.inventoryItems,
    queryFn: getInventoryItems,
    enabled: needsInventoryItems,
  })
  const purchasesQuery = useQuery({
    queryKey: queryKeys.purchases,
    queryFn: getPurchases,
    enabled: activeView === "inventory",
  })
  const productionsQuery = useQuery({
    queryKey: queryKeys.productions,
    queryFn: getProductions,
    enabled: activeView === "stock",
  })
  const products = productsQuery.data ?? []
  const inventoryItems = inventoryItemsQuery.data ?? []
  const purchases = purchasesQuery.data ?? []
  const productions = productionsQuery.data ?? []
  const cartRows = getCartRows(cart, products)
  const cartQuantity = getCartSummary(cartRows).quantity
  const drawerKinds = editingRecord ? [activeKind] : getDrawerKinds(activeView)

  const saveMutation = useMutation({
    mutationFn: ({ kind, values, id }: { kind: RecordKind; values: EntryValues; id?: string }) =>
      saveEntity(kind, values, id),
    onSuccess: async (_, variables) => {
      await invalidateAfterChange(queryClient, variables.kind)
      refreshDashboard()
    },
  })
  const deleteMutation = useMutation({
    mutationFn: ({ kind, id }: { kind: RecordKind; id: string }) => deleteEntity(kind, id),
    onSuccess: async (_, variables) => {
      await invalidateAfterChange(queryClient, variables.kind)
      refreshDashboard()
    },
  })
  const productKindMutation = useMutation({
    mutationFn: ({
      name,
      prices,
    }: {
      name: string
      prices?: { priceDefault?: number; priceReseller?: number; priceOnline?: number; quantity?: number; image?: string; note?: string }
    }) => createProductKind(name, prices),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.products })
      refreshDashboard()
    },
  })
  const checkoutMutation = useMutation({
    mutationFn: checkoutCart,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.products }),
      ])
      setCart([])
      setIsCartDrawerOpen(false)
    },
  })

  const openPrimaryAction = () => {
    if (activeView === "home") {
      setIsQuickActionsOpen(true)
      return
    }

    if (activeView === "sales") {
      setIsCartDrawerOpen(true)
      return
    }

    if (activeView === "stock") {
      if (stockTab === "production") {
        openNewRecord("production")
        return
      }

      openProductDialog()
      return
    }

    openNewRecord(inventoryTab === "purchase" ? "purchase" : "inventory")
  }

  const openSalesQuickAction = () => {
    setActiveView("sales")
  }

  const openCartQuickAction = () => {
    setActiveView("sales")
    setIsCartDrawerOpen(true)
  }

  const openProductQuickAction = () => {
    setActiveView("stock")
    setStockTab("stock")
    openProductDialog()
  }

  const openProductionQuickAction = () => {
    setActiveView("stock")
    setStockTab("production")
    openNewRecord("production")
  }

  const openInventoryQuickAction = () => {
    setActiveView("inventory")
    setInventoryTab("inventory")
    openNewRecord("inventory")
  }

  const openPurchaseQuickAction = () => {
    setActiveView("inventory")
    setInventoryTab("purchase")
    openNewRecord("purchase")
  }

  const setCartQuantity = (productId: string, priceKind: PriceKind, quantity: number) => {
    const product = products.find((item) => item.id === productId)
    if (!product) {
      return
    }

    setCart((currentCart) => {
      const reservedQuantity = currentCart
        .filter((item) => item.productId === productId && item.priceKind !== priceKind)
        .reduce((total, item) => total + item.quantity, 0)
      const nextQuantity = Math.max(0, Math.min(quantity, Math.max(0, product.quantity - reservedQuantity)))
      const withoutItem = currentCart.filter((item) => item.productId !== productId || item.priceKind !== priceKind)

      if (nextQuantity === 0) {
        return withoutItem
      }

      return [...withoutItem, { productId, priceKind, quantity: nextQuantity }]
    })
  }

  const submitCart = () => {
    if (cart.length === 0) return
    setIsCartDrawerOpen(false)
    setIsCheckoutDialogOpen(true)
    if (isNativeApp()) {
      prepareBluetoothPrinter()
    }
  }

  const handleCheckoutOpenChange = (open: boolean) => {
    setIsCheckoutDialogOpen(open)
    if (!open && isNativeApp()) {
      disconnectPreparedPrinter()
    }
  }

  const handleCheckoutConfirm = (paymentMethod: PaymentMethod, amountPaid: number) => {
    setIsCheckoutDialogOpen(false)
    const receipt: ThermalReceiptData = {
      id: crypto.randomUUID().slice(0, 8).toUpperCase(),
      rows: cartRows,
      total: getCartSummary(cartRows).total,
      paymentMethod,
      amountPaid,
      createdAt: new Date().toISOString(),
    }
    const escpos: EscPosReceipt = {
      title: "Pempek Kasir",
      subtitle1: new Date(receipt.createdAt).toLocaleString("id-ID"),
      subtitle2: `#${receipt.id}`,
      items: receipt.rows.map(({ product, priceKind, quantity }) => ({
        left: `${product.name} ${quantity}x`,
        right: formatEscPosCurrency(getProductPrice(product, priceKind) * quantity),
      })),
      total: formatEscPosCurrency(receipt.total),
      paymentMethod: paymentMethodLabels[paymentMethod],
      amountPaid: formatEscPosCurrency(amountPaid),
      change: formatEscPosCurrency(Math.max(0, amountPaid - receipt.total)),
      footer: "Terima kasih",
    }
    const payload: CheckoutPayload = { cart, paymentMethod, amountPaid }
    setReceiptToPrint(receipt)
    receiptToRetry.current = escpos
    checkoutMutation.mutate(payload, {
      onSuccess: () => {
        if (isNativeApp()) {
          shouldRefreshAfterPrint.current = true
          printPreparedOrBluetooth(escpos)
        } else {
          refreshDashboard()
          window.setTimeout(() => window.print(), 150)
        }
      },
    })
  }

  const openNewRecord = (kind = view.defaultKind) => {
    setActiveKind(kind)
    setEditingRecord(null)
    setIsDrawerOpen(true)
  }

  const openEditRecord = (kind: RecordKind, record: EditableRecord) => {
    setActiveKind(kind)
    setEditingRecord(record)
    setIsDrawerOpen(true)
  }

  const openProductDialog = () => {
    setProductDialogKey((key) => key + 1)
    setIsProductDialogOpen(true)
  }

  const saveRecord = async (kind: RecordKind, values: EntryValues, id?: string) => {
    await saveMutation.mutateAsync({ kind, values, id })
    setEditingRecord(null)
    setIsDrawerOpen(false)
  }

  const submitProductKind = async (
    name: string,
    prices?: { priceDefault?: number; priceReseller?: number; priceOnline?: number; quantity?: number; image?: string; note?: string }
  ) => {
    await productKindMutation.mutateAsync({ name, prices })
    setIsProductDialogOpen(false)
  }

  const deleteRecord = async (kind: RecordKind, id: string) => {
    await deleteMutation.mutateAsync({ kind, id })
    if (editingRecord?.id === id) {
      setEditingRecord(null)
      setIsDrawerOpen(false)
    }
  }

  return (
    <FlyToCartProvider>
    <SidebarProvider defaultOpen={true}>
      <AppSidebar
        value={activeView}
        cartQuantity={cartQuantity}
        onChange={setActiveView}
        onAdd={openPrimaryAction}
      />
      <SidebarInset className="min-h-svh bg-[#fffaf1]">
        <div className="mx-auto flex min-h-svh w-full max-w-md flex-col gap-4 px-4 pb-32 pt-4 md:max-w-4xl md:pb-8 lg:max-w-5xl xl:max-w-6xl">
          {activeView !== "home" && <TabHeader view={view} />}

          {activeView === "home" && (
            <>
              <HeroSummary metrics={initialDashboard} />
              <HomeTabContent metrics={initialDashboard} />
            </>
          )}

          {activeView === "sales" && (
            <SalesTabContent
              products={products}
              cart={cart}
              priceKind={salePriceKind}
              onPriceKindChange={setSalePriceKind}
              onChangeQuantity={setCartQuantity}
            />
          )}

          {activeView === "stock" && (
            <StockTabContent
              stockRecords={products}
              productionRecords={productions}
              inventoryItems={inventoryItems}
              activeTab={stockTab}
              onTabChange={setStockTab}
              onAddProductKind={openProductDialog}
              onAddProduction={() => openNewRecord("production")}
              onEdit={(record) => openEditRecord("product", record)}
              onDelete={(id) => deleteRecord(stockTab === "production" ? "production" : "product", id)}
            />
          )}

          {activeView === "inventory" && (
            <InventoryTabContent
              inventoryRecords={inventoryItems}
              purchaseRecords={purchases}
              activeTab={inventoryTab}
              onTabChange={setInventoryTab}
              onAddInventory={() => openNewRecord("inventory")}
              onAddPurchase={() => openNewRecord("purchase")}
              onEdit={(record) => openEditRecord("inventory", record)}
              onDelete={(id) => deleteRecord(inventoryTab === "purchase" ? "purchase" : "inventory", id)}
            />
          )}
        </div>
      </SidebarInset>

      <div className="md:hidden">
        <BottomNav
          value={activeView}
          cartQuantity={cartQuantity}
          actionLabel={
            activeView === "home"
              ? "Buka menu cepat"
              : activeView === "stock"
                ? stockTab === "production"
                  ? "Produksi baru"
                  : "Tambah katalog pempek"
                : activeView === "inventory"
                  ? inventoryTab === "purchase"
                    ? "Belanja baru"
                    : "Tambah bahan"
                  : undefined
          }
          onChange={setActiveView}
          onAdd={openPrimaryAction}
        />
      </div>

      <QuickActionsDrawer
        open={isQuickActionsOpen}
        cartQuantity={cartQuantity}
        onOpenChange={setIsQuickActionsOpen}
        onOpenSales={openSalesQuickAction}
        onOpenCart={openCartQuickAction}
        onAddProduct={openProductQuickAction}
        onAddProduction={openProductionQuickAction}
        onAddInventory={openInventoryQuickAction}
        onAddPurchase={openPurchaseQuickAction}
      />

      <RecordDrawer
        open={isDrawerOpen}
        kind={activeKind}
        record={editingRecord}
        availableKinds={drawerKinds}
        products={products}
        inventoryItems={inventoryItems}
        onKindChange={setActiveKind}
        onOpenChange={(open) => {
          setIsDrawerOpen(open)
          if (!open) {
            setEditingRecord(null)
          }
        }}
        onSubmit={saveRecord}
      />

      <NewProductDialog
        key={productDialogKey}
        open={isProductDialogOpen}
        onOpenChange={setIsProductDialogOpen}
        onCreateProductKind={submitProductKind}
      />

      <CartDrawer
        open={isCartDrawerOpen}
        products={products}
        cart={cart}
        onChangeQuantity={setCartQuantity}
        onCheckout={submitCart}
        onClearCart={() => setCart([])}
        onOpenChange={setIsCartDrawerOpen}
      />

      <CheckoutDialog
        open={isCheckoutDialogOpen}
        cartRows={cartRows}
        total={getCartSummary(cartRows).total}
        printerStatusLabel={getPrinterStatusLabel(preparedState)}
        onOpenChange={handleCheckoutOpenChange}
        onConfirm={handleCheckoutConfirm}
      />

      <ThermalReceipt receipt={receiptToPrint} />

      <BtPrintDialog
        state={printState}
        onSelect={(address) => {
          if (receiptToRetry.current) {
            selectAndPrint(address, receiptToRetry.current)
          }
        }}
        onClose={closeBtPrintDialog}
        onRetry={() => {
          const receipt = receiptToRetry.current
          if (receipt) {
            printViaBluetooth(receipt)
          }
        }}
      />
    </SidebarProvider>
    </FlyToCartProvider>
  )
}

function TabHeader({ view }: { view: (typeof viewConfigs)[ViewKey] }) {
  const [open, setOpen] = React.useState(false)

  return (
    <header className="m-0 bg-[#fffaf1] p-0 text-slate-950">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[2.2rem] font-black leading-none tracking-tight">
            {view.title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Pengaturan"
            className="grid size-9 shrink-0 place-items-center rounded-full bg-orange-100 text-orange-700 transition hover:bg-orange-200 active:scale-95 [&_svg]:size-4"
            onClick={() => setOpen(true)}
          >
            <SettingsIcon />
          </button>
          <div className="grid size-9 shrink-0 place-items-center rounded-full bg-orange-100 text-orange-700 [&_svg]:size-4">
            {view.icon}
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pengaturan</DialogTitle>
            <DialogDescription>Konfigurasi aplikasi dan preferensi bisnis.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <PlaceholderSetting
              label="Nama bisnis"
              description="Nama toko atau merek yang muncul di struk dan laporan."
            />
            <PlaceholderSetting
              label="Mata uang"
              description="Satuan mata uang untuk harga dan laporan keuangan."
            />
            <PlaceholderSetting
              label="Notifikasi stok"
              description="Peringatan ketika stok produk menipis."
            />
            <PlaceholderSetting
              label="Cetak otomatis"
              description="Cetak struk secara otomatis setelah checkout."
            />
          </div>
        </DialogContent>
      </Dialog>
    </header>
  )
}

function PlaceholderSetting({ label, description }: { label: string; description: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-sm font-medium text-slate-950">{label}</p>
      <p className="mt-0.5 text-xs text-slate-500">{description}</p>
      <p className="mt-2 text-xs italic text-slate-400">— Belum tersedia —</p>
    </div>
  )
}

function getPrinterStatusLabel(state: BtPreparedState) {
  if (state.phase === "preparing") return `Menyiapkan printer ${state.deviceName}...`
  if (state.phase === "ready") return `Printer siap: ${state.deviceName}`
  if (state.phase === "failed") return "Printer tersimpan belum siap, pilih manual setelah konfirmasi"
  return undefined
}

async function saveEntity(kind: RecordKind, values: EntryValues, id?: string) {
  if (kind === "product") return saveProduct(values, id)
  if (kind === "inventory") return saveInventoryItem(values, id)
  if (kind === "purchase") return createPurchase(values)
  if (kind === "production") return createProduction(values)
  return saveSale(values, id)
}

async function deleteEntity(kind: RecordKind, id: string) {
  if (kind === "product") return deleteProduct(id)
  if (kind === "inventory") return deleteInventoryItem(id)
  if (kind === "purchase") return deletePurchase(id)
  if (kind === "production") return deleteProduction(id)
  return deleteSale(id)
}

async function invalidateAfterChange(queryClient: QueryClient, kind: RecordKind) {
  if (kind === "product") {
    await queryClient.invalidateQueries({ queryKey: queryKeys.products })
    return
  }

  if (kind === "inventory") {
    await queryClient.invalidateQueries({ queryKey: queryKeys.inventoryItems })
    return
  }

  if (kind === "purchase") {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.purchases }),
      queryClient.invalidateQueries({ queryKey: queryKeys.inventoryItems }),
    ])
    return
  }

  if (kind === "production") {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.productions }),
      queryClient.invalidateQueries({ queryKey: queryKeys.products }),
      queryClient.invalidateQueries({ queryKey: queryKeys.inventoryItems }),
    ])
    return
  }

  await queryClient.invalidateQueries({ queryKey: queryKeys.products })
}
