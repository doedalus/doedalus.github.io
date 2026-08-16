import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import Pagination from '../components/Pagination.jsx'
import ErrorBanner from '../components/ErrorBanner.jsx'
import BookCover from '../components/BookCover.jsx'

const LIMIT = 20

export default function MyLibrary() {
  const [skip, setSkip] = useState(0)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    api
      .getMyLibrary({ skip, limit: LIMIT })
      .then((data) => {
        if (!cancelled) setItems(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.detail || 'Could not load your library')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [skip])

  return (
    <div className="page">
      <div className="eyebrow">Your collection</div>
      <h1>My Library</h1>

      <ErrorBanner message={error} />

      {loading ? (
        <div className="spinner-text">Loading…</div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <p>You haven't added any books yet.</p>
          <Link to="/" className="btn btn--primary" style={{ display: 'inline-block', marginTop: 14 }}>
            Browse the catalog
          </Link>
        </div>
      ) : (
        <div>
          {items.map((entry) => (
            <div className="review-card" key={entry.book.id}>
              <div className="review-card__row">
                <div className="review-card__cover">
                  <BookCover title={entry.book.title} size="mini" />
                </div>
                <div className="review-card__body">
                  <div className="review-card__head">
                    <Link to={`/books/${entry.book.id}`}>
                      <strong>{entry.book.title}</strong> — {entry.book.author}
                    </Link>
                    {entry.rating != null ? (
                      <span className="rating-badge">{entry.rating} / 10</span>
                    ) : (
                      <span className="rating-badge rating-badge--muted">No rating</span>
                    )}
                  </div>
                  {entry.review && <p>{entry.review}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination
        skip={skip}
        limit={LIMIT}
        count={items.length}
        onPrev={() => setSkip(Math.max(0, skip - LIMIT))}
        onNext={() => setSkip(skip + LIMIT)}
      />
    </div>
  )
}
