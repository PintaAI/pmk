"use server"

import { prisma } from "@/lib/prisma"
import type { EntryValues } from "@/components/form/types"
import { mapProduct } from "./mappers"
import { refreshHome, toNumber } from "./utils"
import { logActivity } from "./activity-log"

export async function getProducts() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } })
  return products.map(mapProduct)
}

export async function saveProduct(values: EntryValues, id?: string) {
  const priceDefault = toNumber(values.priceDefault || values.amount)
  const data = {
    name: values.name.trim(),
    quantity: toNumber(values.quantity),
    priceDefault,
    priceReseller: toNumber(values.priceReseller) || priceDefault,
    priceOnline: toNumber(values.priceOnline) || priceDefault,
    note: values.note.trim() || null,
  }

  if (!data.name) return

  if (id) {
    await prisma.product.update({ where: { id }, data })
    await logActivity("product", "updated", `Updated product "${data.name}"`, id)
  } else {
    const product = await prisma.product.create({ data })
    await logActivity("product", "created", `Created product "${data.name}"`, product.id)
  }

  refreshHome()
}

export async function createProductKind(
  name: string,
  prices?: { priceDefault?: number; priceReseller?: number; priceOnline?: number; quantity?: number; note?: string }
) {
  const productName = name.trim()

  if (!productName) return

  const priceDefault = prices?.priceDefault ?? 0

  const product = await prisma.product.create({
    data: {
      name: productName,
      quantity: prices?.quantity ?? 0,
      priceDefault,
      priceReseller: prices?.priceReseller ?? priceDefault,
      priceOnline: prices?.priceOnline ?? priceDefault,
      note: prices?.note || "Jenis pempek baru",
    },
  })

  await logActivity("product", "created", `Created product "${productName}"`, product.id)
  refreshHome()
}

export async function deleteProduct(id: string) {
  const product = await prisma.product.findUnique({ where: { id }, select: { name: true } })
  await prisma.product.delete({ where: { id } })
  await logActivity("product", "deleted", `Deleted product "${product?.name ?? id}"`, id)
  refreshHome()
}
