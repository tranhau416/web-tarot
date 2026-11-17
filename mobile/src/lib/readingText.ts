/**
 * The light markdown of a reading (same rules as frontend/app/components/ReadingText.tsx):
 * headings (`#…` or a line that is only `**…**`), bullets (`-`, `*`, `•`, `1.`), paragraphs,
 * and inline **bold** / *italic*.
 */
export type Inline = { text: string; style?: "bold" | "italic" }

export type Block =
  | { type: "heading"; text: string }
  | { type: "paragraph"; parts: Inline[] }
  | { type: "bullets"; items: Inline[][] }

export function parseInline(line: string): Inline[] {
  return line
    .split(/(\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g)
    .filter((part) => part !== "")
    .map((part) => {
      if (part.startsWith("**") && part.endsWith("**") && part.length > 4) return { text: part.slice(2, -2), style: "bold" }
      if (part.startsWith("*") && part.endsWith("*") && part.length > 2) return { text: part.slice(1, -1), style: "italic" }
      return { text: part }
    })
}

export function parseReading(text: string): Block[] {
  const blocks: Block[] = []
  let bullets: Inline[][] = []
  const flush = () => {
    if (bullets.length) blocks.push({ type: "bullets", items: bullets })
    bullets = []
  }

  for (const raw of text.split("\n")) {
    const line = raw.trim()
    if (!line) {
      flush()
      continue
    }
    const heading = line.match(/^#{1,4}\s+(.*)$/) ?? line.match(/^\*\*([^*]+)\*\*:?$/)
    if (heading) {
      flush()
      blocks.push({ type: "heading", text: heading[1].replace(/\*\*/g, "") })
      continue
    }
    const bullet = line.match(/^(?:[-*•]|\d+[.)])\s+(.*)$/)
    if (bullet) {
      bullets.push(parseInline(bullet[1]))
      continue
    }
    flush()
    blocks.push({ type: "paragraph", parts: parseInline(line) })
  }
  flush()
  return blocks
}
