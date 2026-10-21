import { Fragment, type ReactNode } from "react"

/** Inline markdown tối giản: **đậm** và *nghiêng*. */
function renderInline(line: string): ReactNode[] {
  return line.split(/(\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={i} className="text-light font-semibold">{part.slice(2, -2)}</strong>
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={i} className="text-glow">{part.slice(1, -1)}</em>
    }
    return <Fragment key={i}>{part}</Fragment>
  })
}

/** Block markdown tối giản: tiêu đề (#, hoặc dòng chỉ có **...**), gạch đầu dòng, đoạn văn. */
function renderBlocks(text: string): ReactNode[] {
  const blocks: ReactNode[] = []
  let bullets: string[] = []

  const flushBullets = () => {
    if (bullets.length === 0) return
    const items = bullets
    bullets = []
    blocks.push(
      <ul key={`ul-${blocks.length}`} className="list-none space-y-2 pl-1">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2">
            <span aria-hidden="true" className="text-gold select-none">✦</span>
            <span>{renderInline(item)}</span>
          </li>
        ))}
      </ul>,
    )
  }

  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim()
    if (!line) {
      flushBullets()
      continue
    }

    const heading = line.match(/^#{1,4}\s+(.*)$/) ?? line.match(/^\*\*([^*]+)\*\*:?$/)
    if (heading) {
      flushBullets()
      blocks.push(
        <h3 key={`h-${blocks.length}`} className="font-serif text-xl text-light pt-3">
          {heading[1].replace(/\*\*/g, "")}
        </h3>,
      )
      continue
    }

    const bullet = line.match(/^(?:[-*•]|\d+[.)])\s+(.*)$/)
    if (bullet) {
      bullets.push(bullet[1])
      continue
    }

    flushBullets()
    blocks.push(<p key={`p-${blocks.length}`}>{renderInline(line)}</p>)
  }
  flushBullets()
  return blocks
}

/** Lời đọc bài: chữ serif, độ rộng dòng ~65 ký tự để dễ đọc. */
export default function ReadingText({ text, children }: { text: string; children?: ReactNode }) {
  return (
    <div className="max-w-[65ch] font-serif text-lg text-pearl leading-relaxed space-y-4">
      {renderBlocks(text)}
      {children}
    </div>
  )
}
