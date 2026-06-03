import { get } from "@vercel/blob"

export async function GET(request: Request) {
  const token = process.env.BLOB_READ_WRITE_TOKEN
  const { searchParams } = new URL(request.url)
  const pathname = searchParams.get("pathname")

  if (!token) {
    return new Response("BLOB_READ_WRITE_TOKEN belum dikonfigurasi.", { status: 500 })
  }

  if (!pathname || !pathname.startsWith("products/")) {
    return new Response("Invalid product image pathname.", { status: 400 })
  }

  const result = await get(pathname, {
    access: "private",
    token,
  })

  if (!result?.stream) {
    return new Response("Product image not found.", { status: 404 })
  }

  const headers = new Headers({
    "Content-Type": result.blob.contentType,
    "Content-Length": result.blob.size.toString(),
  })
  headers.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400")

  return new Response(result.stream, { headers })
}
