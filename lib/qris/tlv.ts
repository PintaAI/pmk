export type TLVElement = {
  tag: string
  length: number
  value: string
  children?: TLVElement[]
}

export function parseTLV(input: string): TLVElement[] {
  const elements: TLVElement[] = []
  let index = 0

  while (index < input.length) {
    if (index + 4 > input.length) {
      throw new Error("Payload TLV tidak lengkap")
    }

    const tag = input.slice(index, index + 2)
    const lengthText = input.slice(index + 2, index + 4)
    const length = Number(lengthText)

    if (!/^\d{2}$/.test(tag) || !/^\d{2}$/.test(lengthText) || Number.isNaN(length)) {
      throw new Error("Format tag atau panjang TLV tidak valid")
    }

    const valueStart = index + 4
    const valueEnd = valueStart + length

    if (valueEnd > input.length) {
      throw new Error(`Nilai tag ${tag} melebihi panjang payload`)
    }

    const value = input.slice(valueStart, valueEnd)
    const element: TLVElement = { tag, length, value }

    if (isNestedTag(tag)) {
      try {
        element.children = parseTLV(value)
      } catch {
        // Some provider-specific values are not parseable as sub-TLV; keep the raw value.
      }
    }

    elements.push(element)
    index = valueEnd
  }

  return elements
}

export function buildTLV(elements: TLVElement[]): string {
  return elements
    .map((element) => {
      const value = element.children ? buildTLV(element.children) : element.value
      const length = value.length.toString().padStart(2, "0")
      return `${element.tag}${length}${value}`
    })
    .join("")
}

export function getTag(elements: TLVElement[], tag: string) {
  return elements.find((element) => element.tag === tag)
}

export function withoutTags(elements: TLVElement[], tags: string[]) {
  return elements.filter((element) => !tags.includes(element.tag))
}

function isNestedTag(tag: string) {
  const numericTag = Number(tag)
  return (numericTag >= 26 && numericTag <= 51) || tag === "62" || tag === "64"
}
