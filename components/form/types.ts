export type RecordKind = "sale" | "product" | "production" | "inventory" | "purchase"
export type ActiveRecordKind = Exclude<RecordKind, "production">
export type ViewKey = "home" | "sales" | "stock" | "inventory"
export type PriceKind = "default" | "reseller" | "online"

export type ProductRecord = {
  id: string
  name: string
  quantity: number
  priceDefault: number
  priceReseller: number
  priceOnline: number
  note?: string
  createdAt: string
  updatedAt: string
}

export type InventoryItemRecord = {
  id: string
  name: string
  quantity: number
  unitPrice: number
  note?: string
  createdAt: string
  updatedAt: string
}

export type SaleRecord = {
  id: string
  name: string
  quantity: number
  amount: number
  note?: string
  createdAt: string
  items: SaleItemRecord[]
}

export type SaleItemRecord = {
  id: string
  saleId: string
  productId: string
  priceKind: PriceKind
  quantity: number
  unitPrice: number
}

export type PurchaseRecord = {
  id: string
  name: string
  quantity: number
  amount: number
  note?: string
  date: string
  createdAt: string
  items: PurchaseItemRecord[]
}

export type PurchaseItemRecord = {
  id: string
  purchaseId: string
  name: string
  quantity: number
  price: number
}

export type ProductionRecord = {
  id: string
  name: string
  quantity: number
  note?: string
  createdAt: string
  ingredients: ProductionIngredientRecord[]
  outputs: ProductionOutputRecord[]
}

export type ProductionIngredientRecord = {
  id: string
  productionId: string
  inventoryItemId: string
  quantity: number
}

export type ProductionOutputRecord = {
  id: string
  productionId: string
  productId: string
  quantity: number
}

export type ActivityLogRecord = {
  id: string
  kind: string
  action: string
  description: string
  entityId?: string
  createdAt: string
}

export type EditableRecord = SaleRecord | ProductRecord | InventoryItemRecord | PurchaseRecord | ProductionRecord

export type PurchaseItemForm = {
  id: string
  name: string
  quantity: string
  price: string
}

export type IngredientForm = {
  id: string
  inventoryItemId: string
  quantity: string
}

export type OutputForm = {
  id: string
  productId: string
  quantity: string
}

export type EntryValues = {
  name: string
  quantity: string
  amount: string
  note: string
  inventoryItemId: string
  inventoryUsed: string
  productId: string
  priceDefault: string
  priceReseller: string
  priceOnline: string
  date: string
  purchaseItems: PurchaseItemForm[]
  ingredients: IngredientForm[]
  outputs: OutputForm[]
}

export type CartItem = {
  productId: string
  priceKind: PriceKind
  quantity: number
}

export type CartRow = {
  product: ProductRecord
  priceKind: PriceKind
  quantity: number
}

export type FormConfig = {
  label: string
  title: string
  helper: string
  nameLabel: string
  quantityLabel: string
  amountLabel: string
  notePlaceholder: string
  submitLabel: string
}
