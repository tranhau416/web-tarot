# Frontend Issues — Sacred Tarot

Audit of 51 issues found in the Next.js 16 / React 19 / Tailwind CSS 4 frontend.
Format: `[ ]` = pending, `[x]` = done.

---

## P1 — Critical

### Error Boundary
- [ ] 2a-1. Create `app/error.tsx` root error boundary (`'use client'`, dark theme, "Try again" button)

### Accessibility — Semantic HTML & ARIA
- [ ] 2b-1. `CardReveal.tsx`: Change `<div onClick>` → `<button type="button" aria-label="Chọn lá ${card.card_name}">`
- [ ] 2b-2. `IntentionInput.tsx`: Add visible `<label htmlFor="intention-input">` linked to textarea
- [ ] 2b-3. `DrawButton.tsx`: Add `aria-busy={isLoading}` and descriptive `aria-label`
- [ ] 2b-4. `SpreadSelector.tsx`: Add `aria-label` and `aria-pressed` to each spread button
- [ ] 2b-5. `LegalGate.tsx`: Add `id` to each `<input>`, `htmlFor` to `<label>`, `aria-describedby` on disclaimer

### Color Contrast (WCAG AA)
- [ ] 2c-1. `IntentionInput.tsx`: `placeholder:text-silver/50` → `placeholder:text-silver/60`
- [ ] 2c-2. `IntentionInput.tsx`: Counter `text-silver/40` → `text-silver/70`
- [ ] 2c-3. `CardReveal.tsx`: Numerology `text-silver/50` → `text-silver/70`
- [ ] 2c-4. `page.tsx`: Disclaimer `text-silver/60` → `text-silver/80`
- [ ] 2c-5. `page.tsx`: Error border `border-red-500/30` → `border-red-500/50`
- [ ] 2c-6. `InterpretationPanel.tsx`: Quantum source footer `text-silver/60` → `text-silver/80`
- [ ] 2c-7. `InterpretationPanel.tsx`: Byte value `text-silver/30` → `text-silver/50`
- [ ] 2c-8. `LegalGate.tsx`: Consent text `text-silver/50` → `text-silver/70`
- [ ] 2c-9. `SpreadSelector.tsx`: Symbol unselected `text-silver/50` → `text-silver/70`

---

## P2 — High (UX)

### Mobile Responsiveness
- [ ] 3a-1. `page.tsx` hero: `py-16` → `py-8 sm:py-12 md:py-16`
- [ ] 3a-2. `page.tsx` hero: emoji `text-7xl` → `text-5xl sm:text-7xl`
- [ ] 3a-3. `page.tsx` hero h1: add `text-4xl` base breakpoint
- [ ] 3a-4. `CardReveal.tsx`: `flex flex-wrap` → `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`
- [ ] 3a-5. `DrawButton.tsx`: `py-4 px-8` → `py-3 sm:py-4 px-5 sm:px-8`
- [ ] 3a-6. `InterpretationPanel.tsx`: `p-6` → `p-4 sm:p-6`

### Loading & Error States
- [ ] 3b-1. `AIReading.tsx`: Replace animate-pulse loading → skeleton shimmer UI with 3 lines
- [ ] 3b-2. `AIReading.tsx`: Empty state "Không có nội dung." → detailed message with icon
- [ ] 3b-3. `page.tsx`: Error div — add dismiss button (X) and "Thử lại" button
- [ ] 3b-4. `AIReading.tsx`: Auto-scroll to bottom when streaming (scrollRef + useEffect)

### User Flow Clarity
- [ ] 3c-1. `page.tsx`: Show loading indicator when streaming but no drawResponse yet

---

## P3 — Medium (Code Quality & Performance)

### React Performance
- [ ] 4a-1. `CardReveal.tsx`: Wrap `CardItem` with `React.memo()`
- [ ] 4a-2. `page.tsx`: Wrap `handleDraw`, `handleDrawResult`, `handleDrawAgain` with `useCallback`

### Next.js Best Practices
- [ ] 4b-1. `SpreadSelector.tsx`: Remove `"use client"` (pure presentational)
- [ ] 4b-2. `DrawButton.tsx`: Remove `"use client"` (pure presentational)
- [ ] 4b-3. `AIReading.tsx`: Add `eslint-disable-next-line react-hooks/exhaustive-deps` comment on useEffect `[]`

### Code Quality
- [ ] 4c-1. `IntentionInput.tsx`: Change placeholder to Vietnamese
- [ ] 4c-2. Create `frontend/app/lib/constants.ts` with `STORAGE_KEYS`, `CARD_FLIP_DELAY_BASE`, `CARD_FLIP_DELAY_INTERVAL`
- [ ] 4c-3. `LegalGate.tsx`: Import and use `STORAGE_KEYS` from constants
- [ ] 4c-4. `CardReveal.tsx`: Import and use flip delay constants
- [ ] 4c-5. `api.ts`: Add `isStreamEvent` type guard after JSON.parse

---

## P4 — Nice-to-have

### Bundle Optimization
- [ ] 5a-1. `layout.tsx`: Audit and remove unused font weights (Inter 300, EB Garamond 600)
- [ ] 5a-2. Review and verify heading hierarchy h1→h2→h3 across app

### i18n Foundation
- [ ] 5b-1. Create `frontend/app/lib/strings.ts` centralizing all hardcoded strings

---

## New Files to Create
- [ ] `frontend/app/error.tsx`
- [ ] `frontend/app/lib/constants.ts`
- [ ] `frontend/app/lib/strings.ts`
- [ ] `frontend/ISSUES.md` ← this file

## Files to Modify
- [ ] `frontend/app/page.tsx`
- [ ] `frontend/app/layout.tsx`
- [ ] `frontend/app/globals.css`
- [ ] `frontend/app/components/CardReveal.tsx`
- [ ] `frontend/app/components/AIReading.tsx`
- [ ] `frontend/app/components/InterpretationPanel.tsx`
- [ ] `frontend/app/components/SpreadSelector.tsx`
- [ ] `frontend/app/components/IntentionInput.tsx`
- [ ] `frontend/app/components/DrawButton.tsx`
- [ ] `frontend/app/components/LegalGate.tsx`
- [ ] `frontend/app/lib/api.ts`
