"use client"

import { CashierCard } from "@/components/cart"
import type { CartItem, PriceKind, ProductRecord } from "@/components/form/types"

type SalesTabContentProps = {
  products: ProductRecord[]
  cart: CartItem[]
  priceKind: PriceKind
  onPriceKindChange: (kind: PriceKind) => void
  onChangeQuantity: (productId: string, priceKind: PriceKind, quantity: number) => void
}

export function SalesTabContent({
  products,
  cart,
  priceKind,
  onPriceKindChange,
  onChangeQuantity,
}: SalesTabContentProps) {
  return (
    <CashierCard
      products={products}
      cart={cart}
      priceKind={priceKind}
      onPriceKindChange={onPriceKindChange}
      onChangeQuantity={onChangeQuantity}
    />
  )
}
