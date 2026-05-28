"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const id = React.useId()

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {React.isValidElement<{ id?: string }>(children)
        ? React.cloneElement(children, { id })
        : children}
    </div>
  )
}
