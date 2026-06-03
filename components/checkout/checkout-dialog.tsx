"use client"

import * as React from "react"
import { Banknote, QrCode, CreditCard, Wallet } from "lucide-react"

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

  if (open && !prevOpen) {
    setPaymentMethod("cash")
    setAmountPaid(0)
  }
  if (open !== prevOpen) {
    setPrevOpen(open)
  }

  const change = amountPaid > total ? amountPaid - total : 0
  const isCash = paymentMethod === "cash"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pilih pembayaran</DialogTitle>
          <DialogDescription>Total: {formatCurrency(total)}</DialogDescription>
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
        </div>

        <DialogFooter>
          <Button
            type="button"
            className="bg-orange-600 text-white hover:bg-orange-700"
            disabled={isCash && amountPaid < total}
            onClick={() => onConfirm(paymentMethod, isCash ? amountPaid : total)}
          >
            Konfirmasi pembayaran
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
