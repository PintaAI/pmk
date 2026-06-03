"use client"

import * as React from "react"
import {
  BoxesIcon,
  ChevronRightIcon,
  ClockIcon,
  FactoryIcon,
  FileTextIcon,
  HashIcon,
  PackageIcon,
  PencilIcon,
  PlusCircleIcon,
  ReceiptTextIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  Trash2Icon,
} from "lucide-react"
import type { ActivityLogRecord } from "@/components/form/types"
import type { BusinessMetrics } from "@/components/form/record-helpers"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type HomeTabContentProps = {
  metrics: BusinessMetrics
}

export function HomeTabContent({ metrics }: HomeTabContentProps) {
  const [selectedActivity, setSelectedActivity] = React.useState<ActivityLogRecord | null>(null)

  return (
    <>
      <section className="flex min-h-0 flex-1 flex-col space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Aktivitas</h2>
          <span className="text-xs text-slate-400">{metrics.recentActivities.length} terbaru</span>
        </div>

        <div className="max-h-[calc(100svh-20rem)] min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-2xl bg-white px-3 shadow-sm ring-1 ring-orange-50 md:max-h-[calc(100svh-15rem)]">
          {metrics.recentActivities.length === 0 && <EmptyActivity />}
          <div className="divide-y divide-orange-100">
            {metrics.recentActivities.map((log) => (
              <ActivityRow key={log.id} log={log} onOpen={() => setSelectedActivity(log)} />
            ))}
          </div>
        </div>
      </section>

      <ActivityDetailDrawer
        activity={selectedActivity}
        open={Boolean(selectedActivity)}
        onOpenChange={(open) => {
          if (!open) setSelectedActivity(null)
        }}
      />
    </>
  )
}

const actionConfig: Record<string, { label: string; icon: React.ElementType; tone: string; badge: string }> = {
  created: {
    label: "Dibuat",
    icon: PlusCircleIcon,
    tone: "bg-emerald-100 text-emerald-700 ring-emerald-200",
    badge: "bg-emerald-50 text-emerald-700",
  },
  updated: {
    label: "Diperbarui",
    icon: PencilIcon,
    tone: "bg-blue-100 text-blue-700 ring-blue-200",
    badge: "bg-blue-50 text-blue-700",
  },
  deleted: {
    label: "Dihapus",
    icon: Trash2Icon,
    tone: "bg-red-100 text-red-700 ring-red-200",
    badge: "bg-red-50 text-red-700",
  },
  checked_out: {
    label: "Checkout",
    icon: ShoppingCartIcon,
    tone: "bg-orange-100 text-orange-700 ring-orange-200",
    badge: "bg-orange-50 text-orange-700",
  },
}

const kindConfig: Record<string, { label: string; icon: React.ElementType; tone: string }> = {
  product: { label: "Produk", icon: PackageIcon, tone: "bg-orange-100 text-orange-700 ring-orange-200" },
  inventory: { label: "Bahan", icon: BoxesIcon, tone: "bg-lime-100 text-lime-700 ring-lime-200" },
  sale: { label: "Penjualan", icon: ReceiptTextIcon, tone: "bg-sky-100 text-sky-700 ring-sky-200" },
  purchase: { label: "Belanja", icon: ShoppingBagIcon, tone: "bg-violet-100 text-violet-700 ring-violet-200" },
  production: { label: "Produksi", icon: FactoryIcon, tone: "bg-amber-100 text-amber-800 ring-amber-200" },
}

function ActivityRow({ log, onOpen }: { log: ActivityLogRecord; onOpen: () => void }) {
  const config = getActionConfig(log.action)
  const kind = getKindConfig(log.kind)
  const ActionIcon = config.icon
  const KindIcon = kind.icon
  const timeAgo = getTimeAgo(log.createdAt)
  const description = getActivityDescription(log)

  return (
    <button type="button" className="flex w-full items-center gap-3 py-3 text-left" onClick={onOpen}>
      <div className={cn("grid size-10 shrink-0 place-items-center rounded-2xl ring-1", kind.tone)}>
        <KindIcon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-950">{description}</p>
        <div className="mt-1 flex min-w-0 items-center gap-2 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
            <ActionIcon className="size-3" />
            {config.label}
          </span>
          <span className="truncate">{kind.label}</span>
          <span>·</span>
          <span className="shrink-0">{timeAgo}</span>
        </div>
      </div>
      <ChevronRightIcon className="size-4 shrink-0 text-slate-300" />
    </button>
  )
}

function ActivityDetailDrawer({
  activity,
  open,
  onOpenChange,
}: {
  activity: ActivityLogRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const config = getActionConfig(activity?.action)
  const kind = getKindConfig(activity?.kind)
  const ActionIcon = config.icon
  const KindIcon = kind.icon

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto max-w-md rounded-t-[2rem] bg-white">
        <DrawerHeader className="text-left">
          <div className="mb-3 flex items-center gap-3">
            <div className={cn("grid size-12 place-items-center rounded-2xl ring-1", kind.tone)}>
              <KindIcon className="size-5" />
            </div>
            <div className="min-w-0">
              <DrawerTitle>Detail aktivitas</DrawerTitle>
              <DrawerDescription>{activity ? getActivityDescription(activity) : "Rincian aktivitas"}</DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        {activity ? (
          <div className="space-y-3 px-4 pb-2">
            <DetailRow icon={ActionIcon} label="Aksi" value={config.label} />
            <DetailRow icon={KindIcon} label="Kategori" value={kind.label} />
            <DetailRow icon={ClockIcon} label="Waktu" value={formatDateTime(activity.createdAt)} />
            {activity.entityId ? <DetailRow icon={HashIcon} label="ID referensi" value={activity.entityId} /> : null}
            <ActivityMetadataDetails activity={activity} />
            <DetailRow icon={FileTextIcon} label="Catatan" value={getActivityDetail(activity)} />
          </div>
        ) : null}

        <DrawerFooter className="pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function ActivityMetadataDetails({ activity }: { activity: ActivityLogRecord }) {
  const metadata = activity.metadata

  if (!metadata) return null

  const sections = [
    { title: activity.kind === "purchase" ? "Bahan dibeli" : "Item terjual", items: metadata.items },
    { title: "Hasil produksi", items: metadata.outputs },
    { title: "Bahan dipakai", items: metadata.ingredients },
  ].filter((section) => section.items?.length)

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {typeof metadata.amount === "number" ? <MetricPill label="Total" value={formatCurrency(metadata.amount)} /> : null}
        {typeof metadata.amountPaid === "number" ? <MetricPill label="Dibayar" value={formatCurrency(metadata.amountPaid)} /> : null}
        {typeof metadata.change === "number" ? <MetricPill label="Kembalian" value={formatCurrency(metadata.change)} /> : null}
        {typeof metadata.quantity === "number" ? <MetricPill label="Jumlah" value={`${metadata.quantity} item`} /> : null}
        {metadata.paymentMethod ? <MetricPill label="Pembayaran" value={metadata.paymentMethod.toUpperCase()} /> : null}
      </div>

      {sections.map((section) => (
        <div key={section.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">{section.title}</p>
          <div className="mt-2 space-y-2">
            {section.items?.map((item, index) => (
              <div key={`${item.name}-${index}`} className="rounded-xl bg-white p-2 ring-1 ring-slate-200">
                <div className="flex items-start justify-between gap-3">
                  <p className="min-w-0 text-sm font-medium text-slate-950">{item.name}</p>
                  {typeof item.quantity === "number" ? (
                    <p className="shrink-0 text-sm font-semibold text-orange-700">{item.quantity}x</p>
                  ) : null}
                </div>
                {typeof item.amount === "number" || typeof item.unitPrice === "number" ? (
                  <p className="mt-1 text-xs text-slate-500">
                    {typeof item.unitPrice === "number" ? `${formatCurrency(item.unitPrice)} / item` : ""}
                    {typeof item.unitPrice === "number" && typeof item.amount === "number" ? " · " : ""}
                    {typeof item.amount === "number" ? formatCurrency(item.amount) : ""}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-orange-100 bg-orange-50 p-3">
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-orange-500">{label}</p>
      <p className="mt-1 truncate text-sm font-black text-orange-900">{value}</p>
    </div>
  )
}

function DetailRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-orange-700 ring-1 ring-slate-200">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">{label}</p>
        <p className="mt-1 break-words text-sm font-medium text-slate-950">{value}</p>
      </div>
    </div>
  )
}

function EmptyActivity() {
  return (
    <p className="py-5 text-center text-sm text-slate-400">Belum ada aktivitas</p>
  )
}

function getActionConfig(action?: string) {
  return actionConfig[action ?? ""] ?? {
    label: action ?? "Aktivitas",
    icon: FileTextIcon,
    tone: "bg-slate-100 text-slate-700 ring-slate-200",
    badge: "bg-slate-100 text-slate-700",
  }
}

function getKindConfig(kind?: string) {
  return kindConfig[kind ?? ""] ?? {
    label: kind ?? "Aktivitas",
    icon: FileTextIcon,
    tone: "bg-slate-100 text-slate-700 ring-slate-200",
  }
}

function getActivityDescription(log: ActivityLogRecord) {
  if (log.metadata) {
    if (log.kind === "sale" && log.action === "checked_out") {
      return `Checkout ${log.metadata.quantity ?? log.metadata.items?.length ?? 0} item · ${formatCurrency(log.metadata.amount ?? 0)}`
    }

    if (log.kind === "purchase" && log.action === "created") {
      return `Belanja ${log.metadata.quantity ?? log.metadata.items?.length ?? 0} item · ${formatCurrency(log.metadata.amount ?? 0)}`
    }

    if (log.kind === "production" && log.action === "created") {
      const outputNames = log.metadata.outputs?.map((item) => item.name).join(", ")
      return outputNames
        ? `Produksi ${log.metadata.quantity ?? 0} item: ${outputNames}`
        : `Produksi ${log.metadata.quantity ?? 0} item`
    }
  }

  const name = getQuotedValue(log.description)
  const kind = getKindConfig(log.kind).label

  if (log.action === "checked_out") return translateCheckout(log.description)
  if (log.action === "created") return name ? `${kind} dibuat: ${name}` : `${kind} baru dicatat`
  if (log.action === "updated") return name ? `${kind} diperbarui: ${name}` : `${kind} diperbarui`
  if (log.action === "deleted") return name ? `${kind} dihapus: ${name}` : `${kind} dihapus`

  return translateDescription(log.description)
}

function getActivityDetail(log: ActivityLogRecord) {
  return translateDescription(log.description)
}

function translateDescription(description: string) {
  const quoted = getQuotedValue(description)
  const purchaseId = description.match(/Belanja dibuat \((\d+) item: (.+)\)/i)
  if (purchaseId) return `Belanja bahan dicatat: ${purchaseId[1]} item (${purchaseId[2]})`
  const purchase = description.match(/Created purchase \((\d+) items?: (.+)\)/i)
  if (purchase) return `Belanja bahan dicatat: ${purchase[1]} item (${purchase[2]})`
  const checkoutId = description.match(/Checkout kasir \((\d+) item\)(?: — (.+))?/i)
  if (checkoutId) return `Checkout kasir selesai: ${checkoutId[1]} item${checkoutId[2] ? ` melalui ${checkoutId[2].toUpperCase()}` : ""}`
  const checkout = description.match(/Checked out cart \((\d+) items?\)(?: — (.+))?/i)
  if (checkout) return `Checkout kasir selesai: ${checkout[1]} item${checkout[2] ? ` melalui ${checkout[2].toUpperCase()}` : ""}`
  if (/Belanja dihapus/i.test(description)) return "Catatan belanja dihapus"
  if (/Deleted purchase/i.test(description)) return "Catatan belanja dihapus"
  if (/Produksi dibuat/i.test(description) && quoted) return `Produksi dicatat: ${quoted}`
  if (/Created production/i.test(description) && quoted) return `Produksi dicatat: ${quoted}`
  if (/Produksi dihapus/i.test(description) && quoted) return `Riwayat produksi dihapus: ${quoted}`
  if (/Deleted production/i.test(description) && quoted) return `Riwayat produksi dihapus: ${quoted}`
  if (/Bahan dibuat/i.test(description) && quoted) return `Bahan baru ditambahkan: ${quoted}`
  if (/Created inventory item/i.test(description) && quoted) return `Bahan baru ditambahkan: ${quoted}`
  if (/Bahan diperbarui/i.test(description) && quoted) return `Bahan diperbarui: ${quoted}`
  if (/Updated inventory item/i.test(description) && quoted) return `Bahan diperbarui: ${quoted}`
  if (/Bahan dihapus/i.test(description) && quoted) return `Bahan dihapus: ${quoted}`
  if (/Deleted inventory item/i.test(description) && quoted) return `Bahan dihapus: ${quoted}`
  if (/Produk dibuat/i.test(description) && quoted) return `Produk baru ditambahkan: ${quoted}`
  if (/Created product/i.test(description) && quoted) return `Produk baru ditambahkan: ${quoted}`
  if (/Produk diperbarui/i.test(description) && quoted) return `Produk diperbarui: ${quoted}`
  if (/Updated product/i.test(description) && quoted) return `Produk diperbarui: ${quoted}`
  if (/Produk dihapus/i.test(description) && quoted) return `Produk dihapus: ${quoted}`
  if (/Deleted product/i.test(description) && quoted) return `Produk dihapus: ${quoted}`
  if (/Penjualan dibuat/i.test(description) && quoted) return `Penjualan dicatat: ${quoted}`
  if (/Created sale/i.test(description) && quoted) return `Penjualan dicatat: ${quoted}`
  if (/Penjualan diperbarui/i.test(description) && quoted) return `Penjualan diperbarui: ${quoted}`
  if (/Updated sale/i.test(description) && quoted) return `Penjualan diperbarui: ${quoted}`
  if (/Penjualan dihapus/i.test(description) && quoted) return `Penjualan dihapus: ${quoted}`
  if (/Deleted sale/i.test(description) && quoted) return `Penjualan dihapus: ${quoted}`

  return description
}

function translateCheckout(description: string) {
  const checkoutId = description.match(/Checkout kasir \((\d+) item\)(?: — (.+))?/i)
  if (checkoutId) return `Checkout ${checkoutId[1]} item${checkoutId[2] ? ` via ${checkoutId[2].toUpperCase()}` : ""}`
  const checkout = description.match(/Checked out cart \((\d+) items?\)(?: — (.+))?/i)
  if (!checkout) return "Checkout kasir selesai"
  return `Checkout ${checkout[1]} item${checkout[2] ? ` via ${checkout[2].toUpperCase()}` : ""}`
}

function getQuotedValue(value: string) {
  return value.match(/"([^"]+)"/)?.[1]
}

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso))
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value)
}

function getTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "baru saja"
  if (mins < 60) return `${mins}m yang lalu`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}j yang lalu`
  const days = Math.floor(hours / 24)
  return `${days}h yang lalu`
}
