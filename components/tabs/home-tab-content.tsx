"use client"

import type { ActivityLogRecord } from "@/components/form/types"
import type { BusinessMetrics } from "@/components/form/record-helpers"
import { cn } from "@/lib/utils"

type HomeTabContentProps = {
  metrics: BusinessMetrics
}

export function HomeTabContent({ metrics }: HomeTabContentProps) {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Aktivitas</h2>
        <span className="text-xs text-slate-400">{metrics.recentActivities.length} terbaru</span>
      </div>

      <div className="divide-y divide-orange-100 rounded-2xl bg-white px-3">
        {metrics.recentActivities.length === 0 && <EmptyActivity />}
        {metrics.recentActivities.map((log) => (
          <ActivityRow key={log.id} log={log} />
        ))}
      </div>
    </section>
  )
}

const actionConfig: Record<string, { label: string; dot: string }> = {
  created: { label: "Buat", dot: "bg-emerald-500" },
  updated: { label: "Ubah", dot: "bg-blue-500" },
  deleted: { label: "Hapus", dot: "bg-red-400" },
  checked_out: { label: "Kasir", dot: "bg-orange-500" },
}

const kindLabels: Record<string, string> = {
  product: "Produk",
  inventory: "Inventaris",
  sale: "Penjualan",
  purchase: "Pembelian",
  production: "Produksi",
}

function ActivityRow({ log }: { log: ActivityLogRecord }) {
  const config = actionConfig[log.action] ?? {
    label: log.action,
    dot: "bg-slate-400",
  }
  const kindLabel = kindLabels[log.kind] ?? log.kind
  const timeAgo = getTimeAgo(log.createdAt)

  return (
    <div className="flex items-start gap-3 py-3">
      <div className={cn("mt-1.5 size-2 shrink-0 rounded-full", config.dot)} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-950">{log.description}</p>
        <p className="mt-0.5 text-xs text-slate-400">
          {kindLabel} · {config.label} · {timeAgo}
        </p>
      </div>
    </div>
  )
}

function EmptyActivity() {
  return (
    <p className="py-5 text-center text-sm text-slate-400">Belum ada aktivitas</p>
  )
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
