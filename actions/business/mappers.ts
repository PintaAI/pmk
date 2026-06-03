import type {
  InventoryItemRecord,
  PriceKind,
  ProductRecord,
  ProductionRecord,
  PurchaseRecord,
  SaleRecord,
} from "@/components/form/types"

export function toDateString(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function mapSale(sale: {
  id: string
  name: string
  quantity: number
  amount: number
  note: string | null
  createdAt: Date
  items: Array<{
    id: string
    saleId: string
    productId: string
    priceKind: string
    quantity: number
    unitPrice: number
  }>
}): SaleRecord {
  return {
    id: sale.id,
    name: sale.name,
    quantity: sale.quantity,
    amount: sale.amount,
    note: sale.note ?? undefined,
    items: sale.items.map((item) => ({
      id: item.id,
      saleId: item.saleId,
      productId: item.productId,
      priceKind: item.priceKind as PriceKind,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
    createdAt: sale.createdAt.toISOString(),
  }
}

export function mapProduct(product: {
  id: string
  name: string
  quantity: number
  priceDefault: number
  priceReseller: number
  priceOnline: number
  image: string | null
  note: string | null
  createdAt: Date
  updatedAt: Date
}): ProductRecord {
  return {
    id: product.id,
    name: product.name,
    quantity: product.quantity,
    priceDefault: product.priceDefault,
    priceReseller: product.priceReseller,
    priceOnline: product.priceOnline,
    image: product.image ?? undefined,
    note: product.note ?? undefined,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  }
}

export function mapInventoryItem(item: {
  id: string
  name: string
  quantity: number
  unitPrice: number
  note: string | null
  createdAt: Date
  updatedAt: Date
}): InventoryItemRecord {
  return {
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    note: item.note ?? undefined,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }
}

export function mapPurchase(purchase: {
  id: string
  name: string
  quantity: number
  amount: number
  note: string | null
  date: Date
  createdAt: Date
  items: Array<{
    id: string
    purchaseId: string
    name: string
    quantity: number
    price: number
  }>
}): PurchaseRecord {
  return {
    id: purchase.id,
    name: purchase.name,
    quantity: purchase.quantity,
    amount: purchase.amount,
    note: purchase.note ?? undefined,
    date: toDateString(purchase.date),
    items: purchase.items.map((item) => ({
      id: item.id,
      purchaseId: item.purchaseId,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    })),
    createdAt: purchase.createdAt.toISOString(),
  }
}

export function mapProduction(production: {
  id: string
  name: string
  quantity: number
  note: string | null
  createdAt: Date
  ingredients: Array<{
    id: string
    productionId: string
    inventoryItemId: string
    quantity: number
  }>
  outputs: Array<{
    id: string
    productionId: string
    productId: string
    quantity: number
  }>
}): ProductionRecord {
  return {
    id: production.id,
    name: production.name,
    quantity: production.quantity,
    note: production.note ?? undefined,
    ingredients: production.ingredients.map((item) => ({
      id: item.id,
      productionId: item.productionId,
      inventoryItemId: item.inventoryItemId,
      quantity: item.quantity,
    })),
    outputs: production.outputs.map((item) => ({
      id: item.id,
      productionId: item.productionId,
      productId: item.productId,
      quantity: item.quantity,
    })),
    createdAt: production.createdAt.toISOString(),
  }
}
