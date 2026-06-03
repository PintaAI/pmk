"use server"

import { prisma } from "@/lib/prisma"
import type { EntryValues } from "@/components/form/types"
import { mapInventoryItem } from "./mappers"
import { refreshHome, toNumber } from "./utils"
import { logActivity } from "./activity-log"

export async function getInventoryItems() {
  const inventoryItems = await prisma.inventoryItem.findMany({ orderBy: { createdAt: "desc" } })
  return inventoryItems.map(mapInventoryItem)
}

export async function saveInventoryItem(values: EntryValues, id?: string) {
  const data = {
    name: values.name.trim(),
    quantity: toNumber(values.quantity),
    unitPrice: toNumber(values.amount),
    note: values.note.trim() || null,
  }

  if (!data.name) return

  if (id) {
    await prisma.inventoryItem.update({ where: { id }, data })
    await logActivity("inventory", "updated", `Bahan diperbarui "${data.name}"`, id)
  } else {
    const item = await prisma.inventoryItem.create({ data })
    await logActivity("inventory", "created", `Bahan dibuat "${data.name}"`, item.id)
  }

  refreshHome()
}

export async function deleteInventoryItem(id: string) {
  const item = await prisma.inventoryItem.findUnique({ where: { id }, select: { name: true } })
  await prisma.inventoryItem.delete({ where: { id } })
  await logActivity("inventory", "deleted", `Bahan dihapus "${item?.name ?? id}"`, id)
  refreshHome()
}
