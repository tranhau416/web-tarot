/// <reference types="node" />
import assert from "node:assert/strict"
import { test } from "node:test"
import { createSseParser } from "./sse"

test("events split across chunks are joined", () => {
  const p = createSseParser()
  assert.deepEqual(p.push('data: {"type":"tok'), [])
  assert.deepEqual(p.push('en","text":"Xin "}\n\ndata: {"type":"token","text":"chào"}\n'), [
    { type: "token", text: "Xin " },
    { type: "token", text: "chào" },
  ])
})

test("malformed and non-data lines are skipped", () => {
  const p = createSseParser()
  assert.deepEqual(p.push(': ping\nevent: x\ndata: {oops\ndata: {"no_type":1}\ndata: {"type":"done"}\n'), [{ type: "done" }])
})

test("flush parses a last event without a trailing newline", () => {
  const p = createSseParser()
  assert.deepEqual(p.push('data: {"type":"error","message":"hỏng"}'), [])
  assert.deepEqual(p.flush(), [{ type: "error", message: "hỏng" }])
  assert.deepEqual(p.flush(), [])
})
