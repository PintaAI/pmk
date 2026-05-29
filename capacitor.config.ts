import type { CapacitorConfig } from "@capacitor/cli"

const config: CapacitorConfig = {
  appId: "com.pempek.kasir",
  appName: "Pempek Kasir",
  webDir: "out",
  server: {
    url: "https://pmk-smoky.vercel.app",
    cleartext: false,
    allowNavigation: ["pmk-smoky.vercel.app"],
  },
  android: {
    allowMixedContent: false,
  },
}

export default config
