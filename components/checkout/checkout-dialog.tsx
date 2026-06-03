"use client"

import * as React from "react"
import { Banknote, QrCode, CreditCard, Wallet } from "lucide-react"

import { QrisDisplay } from "@/components/qris/qris-display"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatCurrency } from "@/components/form/helpers"
import type { CartRow, PaymentMethod } from "@/components/form/types"
import { paymentMethodLabels, paymentMethods, cashDenominations } from "@/components/form/constants"
import { useQris } from "@/hooks/use-qris"
import { convertToDynamic } from "@/lib/qris"

const paymentIcons: Record<PaymentMethod, React.ReactNode> = {
  cash: <Banknote className="size-4" />,
  qris: <QrCode className="size-4" />,
  transfer: <CreditCard className="size-4" />,
  ewallet: <Wallet className="size-4" />,
}

type CheckoutDialogProps = {
  open: boolean
  cartRows: CartRow[]
  total: number
  printerStatusLabel?: string
  onOpenChange: (open: boolean) => void
  onConfirm: (paymentMethod: PaymentMethod, amountPaid: number) => void
}

export function CheckoutDialog({
  open,
  cartRows,
  total,
  printerStatusLabel,
  onOpenChange,
  onConfirm,
}: CheckoutDialogProps) {
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>("cash")
  const [amountPaid, setAmountPaid] = React.useState(0)
  const [prevOpen, setPrevOpen] = React.useState(open)
  const { staticQRIS, merchantName, merchantCity } = useQris()

  if (open && !prevOpen) {
    setPaymentMethod("cash")
    setAmountPaid(0)
  }
  if (open !== prevOpen) {
    setPrevOpen(open)
  }

  const change = amountPaid > total ? amountPaid - total : 0
  const isCash = paymentMethod === "cash"
  const isQris = paymentMethod === "qris"
  const dynamicQris = React.useMemo(() => {
    if (!isQris || !staticQRIS || total <= 0) return null

    try {
      return convertToDynamic(staticQRIS, total)
    } catch {
      return null
    }
  }, [isQris, staticQRIS, total])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pilih pembayaran</DialogTitle>
          <DialogDescription>
            Total: {formatCurrency(total)} · {cartRows.length} item
          </DialogDescription>
          {printerStatusLabel && (
            <p className="text-xs font-medium text-slate-500">{printerStatusLabel}</p>
          )}
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {paymentMethods.map((method) => (
              <Button
                key={method}
                type="button"
                variant={paymentMethod === method ? "default" : "outline"}
                className="justify-start gap-2"
                onClick={() => setPaymentMethod(method)}
              >
                {paymentIcons[method]}
                {paymentMethodLabels[method]}
              </Button>
            ))}
          </div>

          {isCash && (
            <div className="space-y-3">
              <div>
                <p className="mb-2 text-xs font-medium text-slate-500">Jumlah dibayar</p>
                <div className="flex flex-wrap gap-1.5">
                  {cashDenominations.map((denom) => {
                    const newAmount = amountPaid + denom
                    const isOvershoot = isCash && newAmount > total && amountPaid >= total
                    return (
                      <Button
                        key={denom}
                        type="button"
                        variant={amountPaid === denom && amountPaid === total ? "default" : "outline"}
                        size="sm"
                        disabled={isOvershoot}
                        onClick={() => setAmountPaid(amountPaid + denom)}
                      >
                        {formatCurrency(denom)}
                      </Button>
                    )
                  })}
                </div>
                {amountPaid > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-destructive"
                    onClick={() => setAmountPaid(0)}
                  >
                    Reset
                  </Button>
                )}
              </div>

              <div className="rounded-lg border bg-slate-50 p-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Total</span>
                  <span className="font-medium">{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Dibayar</span>
                  <span className={amountPaid > 0 ? "font-medium" : "text-slate-400"}>
                    {amountPaid > 0 ? formatCurrency(amountPaid) : "—"}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-1 text-sm font-bold">
                  <span>{change > 0 ? "Kembali" : "Kurang"}</span>
                  <span className={change > 0 ? "text-green-600" : "text-red-600"}>
                    {formatCurrency(change > 0 ? change : total - amountPaid)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {isQris && (
            <div className="space-y-3">
              {dynamicQris ? (
                <>
                  <div className="rounded-xl border border-orange-200 bg-orange-50 p-3 text-center">
                    <p className="text-xs font-medium uppercase tracking-wide text-orange-700">Scan QRIS</p>
                    <p className="mt-1 text-2xl font-black text-slate-950">{formatCurrency(total)}</p>
                    {(merchantName || merchantCity) && (
                      <p className="mt-1 text-xs text-slate-500">
                        {[merchantName, merchantCity].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>
                  <QrisDisplay payload={dynamicQris} />
                  <p className="text-center text-xs text-slate-500">
                    Minta pelanggan scan QR ini, lalu tekan konfirmasi setelah pembayaran diterima.
                  </p>
                </>
              ) : (
                <div className="rounded-xl border border-dashed border-orange-300 bg-orange-50 p-4 text-sm text-orange-900">
                  <p className="font-semibold">QRIS belum dikonfigurasi</p>
                  <p className="mt-1 text-xs">
                    Buka tombol pengaturan di header, lalu upload gambar QRIS statis merchant terlebih dahulu.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            className="bg-orange-600 text-white hover:bg-orange-700"
            disabled={(isCash && amountPaid < total) || (isQris && !dynamicQris)}
            onClick={() => onConfirm(paymentMethod, isCash ? amountPaid : total)}
          >
            Konfirmasi pembayaran
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
