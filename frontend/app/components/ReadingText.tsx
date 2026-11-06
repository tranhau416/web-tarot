import { Fragment, type ReactNode } from "react"

/** Inline markdown tối giản: **đậm** và *nghiêng*. */
function renderInline(line: string): ReactNode[] {
  return line.split(/(\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={i} className="font-semibold text-light">{part.slice(2, -2)}</strong>
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={i} className="italic text-light">{part.slice(1, -1)}</em>
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
      <ul key={`ul-${blocks.length}`} className="flex flex-col gap-3.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3.5">
            <span aria-hidden="true" className="mt-[0.72em] h-1.5 w-1.5 flex-none rotate-45 bg-gold" />
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
        <h3 key={`h-${blocks.length}`} className="pt-3 text-[19px] sm:text-xl font-semibold leading-snug text-light">
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

/** Lời đọc bài: Be Vietnam Pro 18px, giãn dòng 1.75, tối đa ~66 ký tự mỗi dòng. */
export default function ReadingText({ text, children }: { text: string; children?: ReactNode }) {
  return (
    <div className="flex max-w-[66ch] flex-col gap-4 text-[17px] sm:text-lg leading-[1.75] text-read">
      {renderBlocks(text)}
      {children}
    </div>
  )
}
