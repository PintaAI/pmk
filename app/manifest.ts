import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Central-Pempek",
    short_name: "Pempek",
    description:
      "Aplikasi manajemen bisnis produksi pempek — kelola stok, produksi, dan penjualan dalam satu platform",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#1e293b",
    orientation: "portrait-primary",
    categories: ["business"],
    lang: "id",
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
