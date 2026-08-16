import { useState } from 'react'

export default function RatingInput({ value, onChange, id = 'rating' }) {
  const [hover, setHover] = useState(null)
  const display = hover ?? value ?? 0

  return (
    <div className="star-rating" id={id} role="radiogroup" aria-label="Rating out of 10">
      <div className="star-rating__stars" onMouseLeave={() => setHover(null)}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            className={`star-rating__star${n <= display ? ' is-filled' : ''}`}
            onMouseEnter={() => setHover(n)}
            onFocus={() => setHover(n)}
            onBlur={() => setHover(null)}
            onClick={() => onChange(value === n ? null : n)}
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} out of 10`}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2.5l2.9 6.26 6.85.86-5.05 4.7 1.35 6.78L12 17.9l-6.05 3.2 1.35-6.78-5.05-4.7 6.85-.86L12 2.5z" />
            </svg>
          </button>
        ))}
      </div>
      <span className="star-rating__value">{value != null ? `${value} / 10` : 'No rating'}</span>
      {value != null && (
        <button type="button" className="star-rating__clear" onClick={() => onChange(null)}>
          Clear
        </button>
      )}
    </div>
  )
}
