"use client"

import { ShoppingCartIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency, getProductPrice, getCartSummary, getCartRows } from "@/components/form/helpers"
import { priceKindLabels, priceKinds } from "@/components/form/constants"
import type { CartItem, PriceKind, ProductRecord } from "@/components/form/types"

type CashierCardProps = {
  products: ProductRecord[]
  cart: CartItem[]
  priceKind: PriceKind
  onPriceKindChange: (kind: PriceKind) => void
  onChangeQuantity: (productId: string, priceKind: PriceKind, quantity: number) => void
}

export function CashierCard({
  products,
  cart,
  priceKind,
  onPriceKindChange,
  onChangeQuantity,
}: CashierCardProps) {
  const cartQuantity = getCartSummary(getCartRows(cart, products)).quantity

  return (
    <Tabs value={priceKind} onValueChange={(value) => onPriceKindChange(value as PriceKind)}>
      <TabsList className="grid h-10 w-full grid-cols-3 rounded-2xl bg-orange-100/70 p-1">
        {priceKinds.map((kind) => (
          <TabsTrigger
            key={kind}
            value={kind}
            className="rounded-xl data-active:bg-white data-active:text-orange-700"
          >
            {priceKindLabels[kind]}
          </TabsTrigger>
        ))}
      </TabsList>

      <Card className="mt-2 bg-white">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>Kasir cepat</CardTitle>
            </div>
            <Badge className="border-0 bg-orange-100 text-orange-700">
              {cartQuantity} item
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-orange-200 p-5 text-center text-sm text-slate-500">
              Belum ada stok produk. Tambahkan produk di tab Stok dulu.
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product) => {
                const cartItem = cart.find((item) => item.productId === product.id && item.priceKind === priceKind)
                const quantity = cartItem?.quantity ?? 0
                const reservedQuantity = cart
                  .filter((item) => item.productId === product.id && item.priceKind !== priceKind)
                  .reduce((total, item) => total + item.quantity, 0)
                const isOutOfStock = product.quantity <= 0
                const isMaxedOut = quantity + reservedQuantity >= product.quantity

                return (
                  <button
                    type="button"
                    key={product.id}
                    className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-orange-200 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isOutOfStock || isMaxedOut}
                    onClick={() => onChangeQuantity(product.id, priceKind, quantity + 1)}
                  >
                    <div className="grid size-10 place-items-center rounded-2xl bg-orange-100 text-orange-700">
                      <ShoppingCartIcon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium">{product.name}</p>
                        {isOutOfStock && <Badge variant="secondary">Habis</Badge>}
                        {!isOutOfStock && isMaxedOut && <Badge variant="secondary">Maks</Badge>}
                      </div>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        Stok {product.quantity - reservedQuantity} · {formatCurrency(getProductPrice(product, priceKind))} / porsi
                      </p>
                    </div>
                    <Badge className="border-0 bg-orange-100 text-orange-700">
                      {quantity}x
                    </Badge>
                  </button>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </Tabs>
  )
}
