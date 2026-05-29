"use client"

import { useCallback, useState } from "react"
import { Capacitor } from "@capacitor/core"
import { BluetoothSerial } from "@ascentio-it/capacitor-bluetooth-serial"
import { buildEscPosBytes, bytesToBtString, type EscPosReceipt } from "@/lib/escpos-print"

type BtPrinterDevice = { name: string; address: string }

const SAVED_PRINTER_KEY = "pmk.btPrinter"

export type BtPrintState =
  | { phase: "idle" }
  | { phase: "checking_permissions" }
  | { phase: "enabling" }
  | { phase: "scanning" }
  | { phase: "select_device"; devices: BtPrinterDevice[] }
  | { phase: "connecting"; deviceName: string }
  | { phase: "printing" }
  | { phase: "done" }
  | { phase: "error"; message: string }

export function useBtPrint() {
  const [state, setState] = useState<BtPrintState>({ phase: "idle" })

  const reset = useCallback(() => setState({ phase: "idle" }), [])

  const getSavedPrinter = useCallback((): BtPrinterDevice | null => {
    try {
      const raw = window.localStorage.getItem(SAVED_PRINTER_KEY)
      if (!raw) return null
      const printer = JSON.parse(raw) as Partial<BtPrinterDevice>
      if (typeof printer.name === "string" && typeof printer.address === "string") {
        return { name: printer.name, address: printer.address }
      }
    } catch {
      window.localStorage.removeItem(SAVED_PRINTER_KEY)
    }

    return null
  }, [])

  const savePrinter = useCallback((printer: BtPrinterDevice) => {
    window.localStorage.setItem(SAVED_PRINTER_KEY, JSON.stringify(printer))
  }, [])

  const forgetSavedPrinter = useCallback(() => {
    window.localStorage.removeItem(SAVED_PRINTER_KEY)
  }, [])

  const connectAndPrint = useCallback(
    async (deviceName: string, address: string, receipt: EscPosReceipt) => {
      setState({ phase: "connecting", deviceName })

      let connected = false

      try {
        await BluetoothSerial.connect({ address })
        connected = true

        setState({ phase: "printing" })

        const escpos = buildEscPosBytes(receipt)
        const btString = bytesToBtString(escpos)

        await BluetoothSerial.write({ address, value: btString })
        await new Promise((r) => setTimeout(r, 500))
      } finally {
        if (connected) {
          await BluetoothSerial.disconnect({ address }).catch(() => {})
        }
      }

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

        const savedPrinter = getSavedPrinter()
        if (savedPrinter) {
          try {
            await connectAndPrint(savedPrinter.name, savedPrinter.address, receipt)
            return
          } catch {
            forgetSavedPrinter()
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

        const printer = paired.devices.find((d) => {
          const name = d.name.toUpperCase()
          return name.includes("MP-58") || name.includes("MP58")
        })

        if (!printer) {
          setState({
            phase: "select_device",
            devices: paired.devices,
          })
          return
        }

        savePrinter(printer)
        await connectAndPrint(printer.name, printer.address, receipt)
      } catch (err) {
        setState({
          phase: "error",
          message: err instanceof Error ? err.message : "Gagal mencetak",
        })
      }
    },
    [connectAndPrint, forgetSavedPrinter, getSavedPrinter, savePrinter],
  )

  const selectAndPrint = useCallback(
    async (address: string, receipt: EscPosReceipt) => {
      try {
        const selectedPrinter = state.phase === "select_device"
          ? state.devices.find((d) => d.address === address)
          : null

        if (selectedPrinter) {
          savePrinter(selectedPrinter)
        }

        const selectedName = selectedPrinter?.name ?? address
        setState({ phase: "connecting", deviceName: selectedName })

        await connectAndPrint(selectedName, address, receipt)
      } catch (err) {
        setState({
          phase: "error",
          message: err instanceof Error ? err.message : "Gagal mencetak",
        })
      }
    },
    [connectAndPrint, savePrinter, state],
  )

  return { printState: state, printViaBluetooth, selectAndPrint, reset }
}

/** Returns true if running in native Capacitor (android/ios), not browser. */
export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform()
}
