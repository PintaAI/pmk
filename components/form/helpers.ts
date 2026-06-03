import type {
  CartItem,
  CartRow,
  EditableRecord,
  EntryValues,
  IngredientForm,
  InventoryItemRecord,
  OutputForm,
  PriceKind,
  ProductRecord,
  ProductionRecord,
  PurchaseItemForm,
  PurchaseRecord,
  RecordKind,
} from "./types"

export function toNumber(value: string | number | undefined) {
  return Number(value) || 0
}

export function updateById<T extends { id: string }>(items: T[], id: string, patch: Partial<T>) {
  return items.map((item) => (item.id === id ? { ...item, ...patch } : item))
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value)
}

export function getProductPrice(product: ProductRecord, priceKind: PriceKind) {
  if (priceKind === "reseller") {
    return product.priceReseller
  }

  if (priceKind === "online") {
    return product.priceOnline
  }

  return product.priceDefault
}

export function getCartRows(cart: CartItem[], products: ProductRecord[]): CartRow[] {
  return cart
    .map((item) => {
      const product = products.find((record) => record.id === item.productId)
      if (!product) {
        return null
      }

      const quantity = Math.min(item.quantity, product.quantity)
      return quantity > 0 ? { product, priceKind: item.priceKind, quantity } : null
    })
    .filter((item): item is CartRow => !!item)
}

export function getCartSummary(cartRows: CartRow[]) {
  return cartRows.reduce(
    (summary, item) => ({
      quantity: summary.quantity + item.quantity,
      total: summary.total + getProductPrice(item.product, item.priceKind) * item.quantity,
    }),
    { quantity: 0, total: 0 }
  )
}

export function emptyPurchaseItem(): PurchaseItemForm {
  return { id: crypto.randomUUID(), name: "", quantity: "", price: "" }
}

export function emptyIngredient(): IngredientForm {
  return { id: crypto.randomUUID(), inventoryItemId: "", quantity: "" }
}

export function emptyOutput(): OutputForm {
  return { id: crypto.randomUUID(), productId: "", quantity: "" }
}

export function valuesFromRecord(record: EditableRecord | null, kind?: RecordKind): EntryValues {
  const amount = getAmountValue(record, kind)

  return {
    name: record?.name ?? "",
    quantity: record?.quantity ? String(record.quantity) : "",
    amount: amount ? String(amount) : "",
    note: record?.note ?? "",
    inventoryItemId: "",
    inventoryUsed: "",
    productId: "",
    priceDefault: getProductValue(record, "priceDefault"),
    priceReseller: getProductValue(record, "priceReseller"),
    priceOnline: getProductValue(record, "priceOnline"),
    image: getProductImage(record),
    date: isPurchaseRecord(record) ? record.date : new Date().toISOString().slice(0, 10),
    purchaseItems: isPurchaseRecord(record)
      ? record.items.map((item) => ({
          id: crypto.randomUUID(),
          name: item.name,
          quantity: String(item.quantity),
          price: String(item.price),
        }))
      : [emptyPurchaseItem()],
    ingredients: isProductionRecord(record)
      ? record.ingredients.map((item) => ({
          id: crypto.randomUUID(),
          inventoryItemId: item.inventoryItemId,
          quantity: String(item.quantity),
        }))
      : [emptyIngredient()],
    outputs: isProductionRecord(record)
      ? record.outputs.map((item) => ({
          id: crypto.randomUUID(),
          productId: item.productId,
          quantity: String(item.quantity),
        }))
      : [emptyOutput()],
  }
}

function getAmountValue(record: EditableRecord | null, kind?: RecordKind) {
  if (!record) return 0
  if ("amount" in record) return record.amount
  if (kind === "inventory" && "unitPrice" in record) return record.unitPrice
  if (kind === "product" && "priceDefault" in record) return record.priceDefault
  return 0
}

function getProductValue(record: EditableRecord | null, key: "priceDefault" | "priceReseller" | "priceOnline") {
  if (!record || !("priceDefault" in record)) {
    return ""
  }

  return String(record[key])
}

function getProductImage(record: EditableRecord | null) {
  if (!record || !("priceDefault" in record)) {
    return ""
  }

  return record.image ?? ""
}

function isPurchaseRecord(record: EditableRecord | null): record is PurchaseRecord {
  return !!record && "date" in record && "amount" in record && Array.isArray(record.items)
}

function isProductionRecord(record: EditableRecord | null): record is ProductionRecord {
  return !!record && "ingredients" in record && "outputs" in record
}

export function isInventoryItemRecord(record: EditableRecord | null): record is InventoryItemRecord {
  return !!record && "unitPrice" in record
}
