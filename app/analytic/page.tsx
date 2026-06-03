import { getAnalytics } from "@/actions/analytics"
import { BarChart3Icon, TrendingDownIcon, TrendingUpIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function AnalyticPage() {
  const data = await getAnalytics()

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className="min-h-svh bg-[#fffaf1]">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6">
          <header>
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-[2.2rem] font-black leading-none tracking-tight">Analisis</h1>
              <div className="grid size-9 shrink-0 place-items-center rounded-full bg-orange-100 text-orange-700 [&_svg]:size-4">
                <BarChart3Icon className="size-4" />
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-500">Ringkasan penjualan dan performa bisnis.</p>
          </header>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <MetricCard
              label="Omzet"
              value={formatCurrency(data.totalRevenue)}
              icon={<TrendingUpIcon className="size-4" />}
              tone="warm"
            />
            <MetricCard
              label="Belanja"
              value={formatCurrency(data.totalExpense)}
              icon={<TrendingDownIcon className="size-4" />}
            />
            <MetricCard
              label="Profit"
              value={formatCurrency(data.profit)}
              icon={<BarChart3Icon className="size-4" />}
              tone={data.profit >= 0 ? "warm" : "danger"}
            />
          </div>

          {data.monthlySales.length > 0 && (
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Penjualan per bulan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 text-xs font-semibold text-slate-400">
                    <span>Bulan</span>
                    <div className="flex gap-6">
                      <span>Transaksi</span>
                      <span>Omzet</span>
                    </div>
                  </div>
                  {data.monthlySales.map((row) => (
                    <div
                      key={row.month}
                      className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50"
                    >
                      <span className="font-medium text-slate-700">{row.month}</span>
                      <div className="flex gap-6">
                        <span className="w-12 text-right tabular-nums text-slate-500">{row.count}</span>
                        <span className="w-24 text-right tabular-nums font-medium text-slate-900">
                          {formatCurrency(row.revenue)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Produk terlaris</CardTitle>
              </CardHeader>
              <CardContent>
                {data.topProducts.length === 0 ? (
                  <p className="text-sm text-slate-400">Belum ada data penjualan.</p>
                ) : (
                  <div className="space-y-2">
                    {data.topProducts.map((product, index) => (
                      <div
                        key={product.name}
                        className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-slate-50"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="shrink-0 text-xs font-bold text-slate-300">#{index + 1}</span>
                          <span className="truncate text-sm">{product.name}</span>
                        </div>
                        <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-700">
                          {product.quantity} terjual
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Data bisnis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <CountRow label="Total produk" value={data.counts.products} />
                  <CountRow label="Total bahan" value={data.counts.inventoryItems} />
                  <CountRow label="Total belanja" value={data.counts.purchases} />
                  <CountRow label="Total produksi" value={data.counts.productions} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

function MetricCard({
  label,
  value,
  icon,
  tone = "default",
}: {
  label: string
  value: string
  icon: React.ReactNode
  tone?: "default" | "warm" | "danger"
}) {
  return (
    <Card className="bg-white">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between gap-2">
          <p className={cn("text-xs font-medium", tone === "warm" ? "text-orange-700" : tone === "danger" ? "text-red-600" : "text-slate-500")}>
            {label}
          </p>
          <div
            className={cn(
              "grid size-7 place-items-center rounded-full",
              tone === "warm" ? "bg-orange-100 text-orange-700" : tone === "danger" ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-500"
            )}
          >
            {icon}
          </div>
        </div>
        <p className="mt-1 text-2xl font-black tracking-tight">{value}</p>
      </CardContent>
    </Card>
  )
}

function CountRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-semibold tabular-nums text-slate-900">{value}</span>
    </div>
  )
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value)
}
