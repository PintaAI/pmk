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
import { useFlyToCart } from "./fly-to-cart"

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
  const { flyToCart } = useFlyToCart()

  return (
    <Tabs value={priceKind} onValueChange={(value) => onPriceKindChange(value as PriceKind)} className="flex min-h-0 flex-1 flex-col">
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

      <Card className="mt-2 flex max-h-[calc(100svh-15rem)] min-h-0 flex-1 flex-col bg-white md:max-h-[calc(100svh-10rem)]">
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
        <CardContent className="min-h-0 flex-1">
          {products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-orange-200 p-5 text-center text-sm text-slate-500">
              Belum ada stok produk. Tambahkan produk di tab Stok dulu.
            </div>
          ) : (
            <div className="grid max-h-full min-h-0 grid-cols-2 gap-3 overflow-y-auto overscroll-contain pr-1 md:grid-cols-3">
              {products.map((product) => {
                const cartItem = cart.find((item) => item.productId === product.id && item.priceKind === priceKind)
                const quantity = cartItem?.quantity ?? 0
                const reservedQuantity = cart
                  .filter((item) => item.productId === product.id && item.priceKind !== priceKind)
                  .reduce((total, item) => total + item.quantity, 0)
                const isOutOfStock = product.quantity <= 0
                const isMaxedOut = quantity + reservedQuantity >= product.quantity

                return (
                  <CashierProductCard
                    key={product.id}
                    product={product}
                    priceKind={priceKind}
                    quantity={quantity}
                    availableStock={product.quantity - reservedQuantity}
                    isDisabled={isOutOfStock || isMaxedOut}
                    statusLabel={isOutOfStock ? "Habis" : isMaxedOut ? "Maks" : `${product.quantity - reservedQuantity} stok`}
                    onAdd={(element) => {
                      flyToCart(element)
                      onChangeQuantity(product.id, priceKind, quantity + 1)
                    }}
                  />
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </Tabs>
  )
}

function CashierProductCard({
  product,
  priceKind,
  quantity,
  availableStock,
  isDisabled,
  statusLabel,
  onAdd,
}: {
  product: ProductRecord
  priceKind: PriceKind
  quantity: number
  availableStock: number
  isDisabled: boolean
  statusLabel: string
  onAdd: (element: HTMLElement) => void
}) {
  return (
    <button
      type="button"
      className="group overflow-hidden rounded-3xl border border-orange-100 bg-[#fff8ed] text-left shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
      disabled={isDisabled}
      onClick={(event) => onAdd(event.currentTarget)}
    >
      <div className="relative aspect-square overflow-hidden bg-orange-100">
        {product.image ? (
          <div
            className="size-full bg-cover bg-center transition duration-300 group-hover:scale-105"
            style={{ backgroundImage: `url(${product.image})` }}
            role="img"
            aria-label={product.name}
          />
        ) : (
          <div className="grid size-full place-items-center text-orange-700">
            <ShoppingCartIcon className="size-9" />
          </div>
        )}
        <Badge className="absolute left-2 top-2 border-0 bg-white/90 text-orange-700 shadow-sm">
          {statusLabel}
        </Badge>
        {quantity > 0 ? (
          <Badge className="absolute bottom-2 right-2 border-0 bg-orange-600 text-white shadow-sm">
            {quantity}x
          </Badge>
        ) : null}
      </div>
      <div className="space-y-2 p-3">
        <div>
          <p className="line-clamp-2 text-sm font-semibold leading-tight text-slate-950">
            {product.name}
          </p>
          {product.note ? <p className="mt-1 truncate text-xs text-slate-500">{product.note}</p> : null}
        </div>
        <p className="text-base font-black tracking-tight text-orange-700">
          {formatCurrency(getProductPrice(product, priceKind))}
        </p>
      </div>
    </button>
  )
}
