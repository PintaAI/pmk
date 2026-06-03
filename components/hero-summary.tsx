import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/components/form/helpers"
import type { BusinessMetrics } from "@/components/form/record-helpers"
import { cn } from "@/lib/utils"

export function HeroSummary({ metrics }: { metrics: BusinessMetrics }) {
  const isProfitPositive = metrics.profit >= 0

  return (
    <section className="m-0 bg-[#fffaf1] p-0 text-slate-950">
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-orange-700">
              Ringkasan hari ini
            </p>
            <h1 className="mt-2 text-[2.55rem] font-black leading-none tracking-tight">
              {formatCurrency(metrics.profit)}
            </h1>
          </div>
          <Badge
            className={cn(
              "mt-0.5 border-0 px-3 py-1 text-xs font-semibold",
              isProfitPositive
                ? "bg-emerald-100 text-emerald-700"
                : "bg-red-100 text-red-700"
            )}
          >
            {isProfitPositive ? "Profit" : "Rugi"}
          </Badge>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-orange-200/70 pt-3 md:grid-cols-4">
          <HeroMetric label="Omzet" value={formatCurrency(metrics.revenue)} tone="warm" />
          <HeroMetric label="Belanja" value={formatCurrency(metrics.expense)} />
          <HeroMetric label="Terjual" value={`${metrics.sold} porsi`} />
          <HeroMetric label="Stok" value={`${metrics.stock} porsi`} tone="warm" />
        </div>
      </div>
    </section>
  )
}

function HeroMetric({
  label,
  value,
  tone = "default",
}: {
  label: string
  value: string
  tone?: "default" | "warm"
}) {
  return (
    <div className="min-w-0">
      <p
        className={cn(
          "text-xs font-medium",
          tone === "warm" ? "text-orange-700" : "text-slate-500"
        )}
      >
        {label}
      </p>
      <p className="mt-0.5 truncate text-sm font-semibold text-slate-950">{value}</p>
    </div>
  )
}
