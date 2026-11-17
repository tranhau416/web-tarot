/// <reference types="node" />
import assert from "node:assert/strict"
import { test } from "node:test"
import { parseInline, parseReading } from "./readingText"

test("inline bold and italic", () => {
  assert.deepEqual(parseInline("Lá **Mặt Trời** mang *niềm vui*."), [
    { text: "Lá " },
    { text: "Mặt Trời", style: "bold" },
    { text: " mang " },
    { text: "niềm vui", style: "italic" },
    { text: "." },
  ])
})

test("headings, bullets and paragraphs", () => {
  const blocks = parseReading("**Mở đầu**\nĐoạn một.\n\n## Từng lá\n- Lá một\n2. Lá hai\n\nKết.")
  assert.deepEqual(
    blocks.map((b) => b.type),
    ["heading", "paragraph", "heading", "bullets", "paragraph"],
  )
  assert.deepEqual(blocks[0], { type: "heading", text: "Mở đầu" })
  const bullets = blocks[3]
  assert.equal(bullets.type, "bullets")
  if (bullets.type === "bullets") assert.equal(bullets.items.length, 2)
})

test("a bold run inside a sentence is not a heading", () => {
  assert.equal(parseReading("**Quá khứ** — lá Ba Cốc")[0].type, "paragraph")
})
