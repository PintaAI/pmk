"use client"

import { Eraser } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 text-left">
              <DrawerTitle>Keranjang kasir</DrawerTitle>
              <DrawerDescription>Review pesanan sebelum checkout.</DrawerDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={cartRows.length === 0}
              onClick={onClearCart}
            >
              <Eraser />
              <span className="sr-only">Kosongkan keranjang</span>
            </Button>
          </div>
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-2">
          {cartRows.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-orange-200 p-5 text-center text-sm text-slate-500">
              Keranjang masih kosong. Pilih produk dari tab Kasir dulu.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Harga</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cartRows.map(({ product, priceKind, quantity }) => {
                  const reservedQuantity = cartRows
                    .filter((row) => row.product.id === product.id && row.priceKind !== priceKind)
                    .reduce((total, row) => total + row.quantity, 0)
                  const unitPrice = getProductPrice(product, priceKind)
                  return (
                    <TableRow key={`${product.id}-${priceKind}`}>
                      <TableCell>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-slate-500">{priceKindLabels[priceKind]}</p>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(unitPrice)}</TableCell>
                      <TableCell className="text-right">
                        <QuantityStepper
                          value={quantity}
                          max={Math.max(0, product.quantity - reservedQuantity)}
                          onChange={(nextQuantity) => onChangeQuantity(product.id, priceKind, nextQuantity)}
                        />
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(unitPrice * quantity)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </div>
        <DrawerFooter className="border-t bg-white pt-4">
          <div className="flex items-center justify-between px-1 pb-2">
            <span className="text-sm text-slate-500">
              {cartSummary.quantity} item
            </span>
            <span className="text-xl font-black text-slate-950">
              {formatCurrency(cartSummary.total)}
            </span>
          </div>
          <Button
            type="button"
            className="bg-orange-600 text-white hover:bg-orange-700"
            disabled={cartRows.length === 0}
            onClick={onCheckout}
          >
            Checkout
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
