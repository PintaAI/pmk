"use client"

import { useCallback, useState } from "react"
import { Capacitor } from "@capacitor/core"
import { BluetoothSerial } from "@ascentio-it/capacitor-bluetooth-serial"
import { buildEscPosBytes, bytesToBtString, type EscPosReceipt } from "@/lib/escpos-print"

export type BtPrintState =
  | { phase: "idle" }
  | { phase: "checking_permissions" }
  | { phase: "enabling" }
  | { phase: "scanning" }
  | { phase: "select_device"; devices: { name: string; address: string }[] }
  | { phase: "connecting"; deviceName: string }
  | { phase: "printing" }
  | { phase: "done" }
  | { phase: "error"; message: string }

export function useBtPrint() {
  const [state, setState] = useState<BtPrintState>({ phase: "idle" })

  const reset = useCallback(() => setState({ phase: "idle" }), [])

  const connectAndPrint = useCallback(
    async (deviceName: string, address: string, receipt: EscPosReceipt) => {
      setState({ phase: "connecting", deviceName })

      await BluetoothSerial.connect({ address })

      setState({ phase: "printing" })

      const escpos = buildEscPosBytes(receipt)
      const btString = bytesToBtString(escpos)

      await BluetoothSerial.write({ address, value: btString })

      await new Promise((r) => setTimeout(r, 500))
      await BluetoothSerial.disconnect({ address })

      setState({ phase: "done" })
    },
    [],
  )

  const printViaBluetooth = useCallback(
    async (receipt: EscPosReceipt) => {
      if (!Capacitor.isNativePlatform()) return

      try {
        setState({ phase: "checking_permissions" })

        const permGranted = await BluetoothSerial.checkBluetoothPermissions()
        if (!permGranted) {
          setState({
            phase: "error",
            message: "Izin Bluetooth tidak diberikan. Buka pengaturan untuk mengizinkan.",
          })
          return
        }

        const btState = await BluetoothSerial.isEnabled()
        if (!btState.enabled) {
          setState({ phase: "enabling" })
          const canEnable = await BluetoothSerial.canEnable()
          if (canEnable.enabled) {
            await BluetoothSerial.enable()
          } else {
            setState({
              phase: "error",
              message: "Bluetooth tidak dapat diaktifkan. Silakan aktifkan secara manual.",
            })
            return
          }
        }

        setState({ phase: "scanning" })

        const paired = await BluetoothSerial.getPairedDevices()

        if (paired.devices.length === 0) {
          setState({
            phase: "error",
            message:
              "Tidak ditemukan printer yang dipasangkan. Pasangkan dulu MP-58N melalui pengaturan Android.",
          })
          return
        }

        const printer = paired.devices.find(
          (d) => d.name.toUpperCase().includes("MP-58") || d.name.toUpperCase().includes("MP58"),
        )

        if (!printer) {
          setState({
            phase: "select_device",
            devices: paired.devices,
          })
          return
        }

        await connectAndPrint(printer.name, printer.address, receipt)
      } catch (err) {
        setState({
          phase: "error",
          message: err instanceof Error ? err.message : "Gagal mencetak",
        })
      }
    },
    [connectAndPrint],
  )

  const selectAndPrint = useCallback(
    async (address: string, receipt: EscPosReceipt) => {
      try {
        setState((s) => {
          if (s.phase === "select_device") {
            const device = s.devices.find((d) => d.address === address)
            return { phase: "connecting" as const, deviceName: device?.name ?? address }
          }
          return s
        })

        await connectAndPrint(address, address, receipt)
      } catch (err) {
        setState({
          phase: "error",
          message: err instanceof Error ? err.message : "Gagal mencetak",
        })
      }
    },
    [connectAndPrint],
  )

  return { printState: state, printViaBluetooth, selectAndPrint, reset }
}

/** Returns true if running in native Capacitor (android/ios), not browser. */
export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform()
}
