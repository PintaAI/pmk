"use server"

import { prisma } from "@/lib/prisma"
import type { CartItem, EntryValues, PriceKind } from "@/components/form/types"
import { priceKindLabels } from "@/components/form/constants"
import { mapSale } from "./mappers"
import { refreshHome, toNumber } from "./utils"
import { logActivity } from "./activity-log"

function getProductPrice(
  product: { priceDefault: number; priceReseller: number; priceOnline: number },
  priceKind: PriceKind
) {
  if (priceKind === "reseller") return product.priceReseller
  if (priceKind === "online") return product.priceOnline
  return product.priceDefault
}

export async function getSales() {
  const sales = await prisma.sale.findMany({ include: { items: true }, orderBy: { createdAt: "desc" } })
  return sales.map(mapSale)
}

export async function saveSale(values: EntryValues, id?: string) {
  const name = values.name.trim()
  const data = {
    name,
    quantity: toNumber(values.quantity),
    amount: toNumber(values.amount),
    note: values.note.trim() || null,
  }

  if (!data.name) return

  if (id) {
    await prisma.sale.update({ where: { id }, data })
    await logActivity("sale", "updated", `Updated sale "${name}"`, id)
  } else {
    const sale = await prisma.sale.create({ data })
    await logActivity("sale", "created", `Created sale "${name}"`, sale.id)
  }

  refreshHome()
}

export async function checkoutCart(cart: CartItem[]) {
  const requestedItems = cart.filter((item) => item.quantity > 0)

  if (requestedItems.length === 0) return

  let saleItemsCount = 0

  await prisma.$transaction(async (tx) => {
    const products = await tx.product.findMany({
      where: { id: { in: requestedItems.map((item) => item.productId) } },
    })

    const saleItems = requestedItems
      .map((item) => {
        const product = products.find((record) => record.id === item.productId)
        if (!product) return null

        const reservedQuantity = requestedItems
          .filter((cartItem) => cartItem.productId === item.productId && cartItem.priceKind !== item.priceKind)
          .reduce((total, cartItem) => total + cartItem.quantity, 0)
        const quantity = Math.max(0, Math.min(item.quantity, Math.max(0, product.quantity - reservedQuantity)))

        return quantity > 0
          ? {
              product,
              priceKind: item.priceKind,
              quantity,
              unitPrice: getProductPrice(product, item.priceKind),
            }
          : null
      })
      .filter((item): item is NonNullable<typeof item> => !!item)

    if (saleItems.length === 0) return
    saleItemsCount = saleItems.length

    await tx.sale.create({
      data: {
        name: saleItems
          .map(({ product, priceKind, quantity }) => `${product.name} x${quantity} (${priceKindLabels[priceKind]})`)
          .join(", "),
        quantity: saleItems.reduce((total, item) => total + item.quantity, 0),
        amount: saleItems.reduce((total, item) => total + item.unitPrice * item.quantity, 0),
        note: `Checkout kasir (${[...new Set(saleItems.map((item) => priceKindLabels[item.priceKind]))].join(", ")})`,
        items: {
          create: saleItems.map((item) => ({
            productId: item.product.id,
            priceKind: item.priceKind,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
    })

    await Promise.all(
      saleItems.map((item) =>
        tx.product.update({
          where: { id: item.product.id },
          data: { quantity: { decrement: item.quantity } },
        })
      )
    )
  })

  await logActivity("sale", "checked_out", `Checked out cart (${saleItemsCount} items)`)
  refreshHome()
}

export async function deleteSale(id: string) {
  const sale = await prisma.sale.findUnique({ where: { id }, select: { name: true } })
  await prisma.sale.delete({ where: { id } })
  await logActivity("sale", "deleted", `Deleted sale "${sale?.name ?? id}"`, id)
  refreshHome()
}
