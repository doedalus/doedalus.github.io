// Decorative placeholder "cover" used for every book card and the book
// detail page. There are no real cover images in the backend, so this
// renders a consistent, original illustration (an embossed frame with an
// open-book emblem) plus the book's first letter as a typographic mark —
// enough visual weight to break up plain text without pretending to be a
// real cover. The accent color is picked deterministically from the book's
// title, so the same book always looks the same but a grid of different
// books gets some warm-toned variety instead of one flat repeated color.

// A small family of muted, desaturated hues — genuinely different colors,
// not just shades of the site's amber accent — but all pitched at a
// similar tone/brightness so none of them fights the dark UI around them.
const ACCENT_VARIANTS = [
  '#D6A756', // amber (brand)
  '#5FA8A0', // teal
  '#C96A4A', // terracotta
  '#7FA37A', // sage green
  '#6C8EBF', // slate blue
  '#9B7BB8', // plum
  '#C77DA0', // dusty rose
]

function pickAccent(title) {
  const str = title || ''
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return ACCENT_VARIANTS[Math.abs(hash) % ACCENT_VARIANTS.length]
}

export default function BookCover({ title, size = 'card' }) {
  const initial = title?.trim()?.[0]?.toUpperCase() || '?'
  const accent = pickAccent(title)

  return (
    <div
      className={`book-cover book-cover--${size}`}
      style={{ '--cover-accent': accent }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 120 168" className="book-cover__art" preserveAspectRatio="none">
        <rect x="4" y="4" width="112" height="160" rx="3" fill="none" stroke="var(--cover-accent)" strokeWidth="1" opacity="0.4" />
        <rect x="10" y="10" width="100" height="148" rx="2" fill="none" stroke="var(--cover-accent)" strokeWidth="0.6" opacity="0.28" />
        <circle cx="13" cy="13" r="1.6" fill="var(--cover-accent)" opacity="0.55" />
        <circle cx="107" cy="13" r="1.6" fill="var(--cover-accent)" opacity="0.55" />
        <circle cx="13" cy="155" r="1.6" fill="var(--cover-accent)" opacity="0.55" />
        <circle cx="107" cy="155" r="1.6" fill="var(--cover-accent)" opacity="0.55" />
        <path
          d="M60 66 C60 60 49 55 36 55 L36 108 C49 108 60 113 60 119 C60 113 71 108 84 108 L84 55 C71 55 60 60 60 66 Z"
          fill="none"
          stroke="var(--cover-accent)"
          strokeWidth="1.4"
          opacity="0.5"
        />
        <line x1="60" y1="66" x2="60" y2="119" stroke="var(--cover-accent)" strokeWidth="1" opacity="0.4" />
      </svg>
      <span className="book-cover__initial">{initial}</span>
    </div>
  )
}
