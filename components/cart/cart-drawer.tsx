"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { formatCurrency, getProductPrice, getCartRows, getCartSummary } from "@/components/form/helpers"
import type { CartItem, PriceKind, ProductRecord } from "@/components/form/types"
import { priceKindLabels } from "@/components/form/constants"
import { QuantityStepper } from "./quantity-stepper"

type CartDrawerProps = {
  open: boolean
  products: ProductRecord[]
  cart: CartItem[]
  onChangeQuantity: (productId: string, priceKind: PriceKind, quantity: number) => void
  onCheckout: () => void
  onClearCart: () => void
  onOpenChange: (open: boolean) => void
}

export function CartDrawer({
  open,
  products,
  cart,
  onChangeQuantity,
  onCheckout,
  onClearCart,
  onOpenChange,
}: CartDrawerProps) {
  const cartRows = getCartRows(cart, products)
  const cartSummary = getCartSummary(cartRows)

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto max-w-md rounded-t-[2rem] bg-white">
        <DrawerHeader className="text-left">
          <DrawerTitle>Keranjang kasir</DrawerTitle>
          <DrawerDescription>Review pesanan sebelum checkout.</DrawerDescription>
        </DrawerHeader>
        <div className="space-y-4 overflow-y-auto px-4 pb-2">
          <div className="rounded-3xl border border-orange-100 bg-orange-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
              Total pembayaran
            </p>
            <div className="mt-2 flex items-end justify-between gap-3">
              <p className="text-3xl font-black tracking-tight text-slate-950">
                {formatCurrency(cartSummary.total)}
              </p>
              <Badge className="border-0 bg-white text-orange-700 shadow-sm">
                {cartSummary.quantity} item
              </Badge>
            </div>
          </div>

          {cartRows.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-orange-200 p-5 text-center text-sm text-slate-500">
              Keranjang masih kosong. Pilih produk dari tab Kasir dulu.
            </div>
          ) : (
            <div className="space-y-3">
              {cartRows.map(({ product, priceKind, quantity }) => {
                const reservedQuantity = cartRows
                  .filter((row) => row.product.id === product.id && row.priceKind !== priceKind)
                  .reduce((total, row) => total + row.quantity, 0)

                return (
                  <div
                    key={`${product.id}-${priceKind}`}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{product.name}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {priceKindLabels[priceKind]} · {formatCurrency(getProductPrice(product, priceKind))} / porsi
                      </p>
                    </div>
                    <QuantityStepper
                      value={quantity}
                      max={Math.max(0, product.quantity - reservedQuantity)}
                      onChange={(nextQuantity) => onChangeQuantity(product.id, priceKind, nextQuantity)}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </div>
        <DrawerFooter className="pt-2">
          <Button
            type="button"
            className="bg-orange-600 text-white hover:bg-orange-700"
            disabled={cartRows.length === 0}
            onClick={onCheckout}
          >
            Checkout
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={cartRows.length === 0}
            onClick={onClearCart}
          >
            Kosongkan keranjang
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
