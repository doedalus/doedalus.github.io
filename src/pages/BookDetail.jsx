import { useEffect, useState, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, ApiError } from '../api/client'
import { useAuth } from '../context/AuthContext.jsx'
import ErrorBanner from '../components/ErrorBanner.jsx'
import RatingInput from '../components/RatingInput.jsx'
import BookCover from '../components/BookCover.jsx'

export default function BookDetail() {
  const { bookId } = useParams()
  const { user } = useAuth()

  const [book, setBook] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [myEntry, setMyEntry] = useState(null) // null = not in library, undefined = unknown yet
  const [entryLoading, setEntryLoading] = useState(false)
  const [form, setForm] = useState({ rating: null, review: '' })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [notice, setNotice] = useState('')

  const loadBook = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [b, r] = await Promise.all([api.getBook(bookId), api.getBookReviews(bookId)])
      setBook(b)
      setReviews(r)
    } catch (err) {
      setError(err.detail || 'Could not load this book')
    } finally {
      setLoading(false)
    }
  }, [bookId])

  const loadMyEntry = useCallback(async () => {
    if (!user) {
      setMyEntry(null)
      return
    }
    setEntryLoading(true)
    try {
      const entry = await api.getMyBookEntry(bookId)
      setMyEntry(entry)
      setForm({ rating: entry.rating, review: entry.review || '' })
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setMyEntry(null)
        setForm({ rating: null, review: '' })
      }
    } finally {
      setEntryLoading(false)
    }
  }, [bookId, user])

  useEffect(() => {
    loadBook()
  }, [loadBook])

  useEffect(() => {
    loadMyEntry()
  }, [loadMyEntry])

  const handleAdd = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaveError('')
    setNotice('')
    try {
      const entry = await api.addToLibrary(bookId, { rating: form.rating, review: form.review || null })
      setMyEntry(entry)
      setNotice('Book added to your library.')
      loadBook()
    } catch (err) {
      setSaveError(err.detail || 'Could not add this book')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaveError('')
    setNotice('')
    try {
      const entry = await api.updateLibraryEntry(bookId, { rating: form.rating, review: form.review || null })
      setMyEntry(entry)
      setNotice('Changes saved.')
      loadBook()
    } catch (err) {
      setSaveError(err.detail || 'Could not save changes')
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async () => {
    if (!confirm('Remove this book from your library?')) return
    setSaving(true)
    setSaveError('')
    try {
      await api.removeFromLibrary(bookId)
      setMyEntry(null)
      setForm({ rating: null, review: '' })
      setNotice('Book removed from your library.')
      loadBook()
    } catch (err) {
      setSaveError(err.detail || 'Could not remove this book')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="spinner-text">Loading…</div>
  if (error) {
    return (
      <div className="page">
        <ErrorBanner message={error} />
        <Link to="/">← Back to catalog</Link>
      </div>
    )
  }
  if (!book) return null

  return (
    <div className="page">
      <Link to="/" className="eyebrow">
        ← Catalog
      </Link>

      <div className="book-detail-head">
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ width: 110, flexShrink: 0 }}>
            <BookCover title={book.title} size="detail" />
          </div>
          <div>
            <h1>{book.title}</h1>
            <div className="eyebrow" style={{ marginBottom: 10 }}>
              {book.author}
            </div>
          </div>
        </div>
        {book.avg_rating != null ? (
          <span className="rating-badge">★ {book.avg_rating.toFixed(1)} / 10</span>
        ) : (
          <span className="rating-badge rating-badge--muted">No ratings yet</span>
        )}
      </div>

      <p style={{ marginTop: 18 }}>{book.description}</p>

      <div className="rosette-divider rosette-divider--soft" style={{ margin: '36px 0' }} />

      <h2>Your entry</h2>
      {!user ? (
        <p className="field-hint">
          <Link to="/auth">Sign in</Link> to add this book to your library and leave a review.
        </p>
      ) : entryLoading ? (
        <div className="spinner-text">Loading…</div>
      ) : (
        <div className="panel">
          <ErrorBanner message={saveError} />
          {notice && <div className="success-banner">{notice}</div>}
          <form onSubmit={myEntry ? handleUpdate : handleAdd}>
            <div className="field">
              <label htmlFor="rating">Rating</label>
              <RatingInput value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
            </div>
            <div className="field">
              <label htmlFor="review">Review</label>
              <textarea
                id="review"
                maxLength={1000}
                placeholder="What did you think of this book?"
                value={form.review}
                onChange={(e) => setForm({ ...form, review: e.target.value })}
              />
            </div>
            <div className="actions-row">
              <button className="btn btn--primary" type="submit" disabled={saving}>
                {myEntry ? (saving ? 'Saving…' : 'Save') : saving ? 'Adding…' : 'Add to library'}
              </button>
              {myEntry && (
                <button type="button" className="btn btn--danger" disabled={saving} onClick={handleRemove}>
                  Remove from library
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="rosette-divider rosette-divider--soft" style={{ margin: '36px 0' }} />

      <h2>Reviews {reviews.length > 0 && `(${reviews.length})`}</h2>
      {reviews.length === 0 ? (
        <div className="empty-state">
          <p>No one has reviewed this book yet.</p>
        </div>
      ) : (
        <div>
          {reviews.map((r) => (
            <div className="review-card" key={r.user.id}>
              <div className="review-card__head">
                <Link to={`/users/${r.user.id}/library`}>{r.user.username}</Link>
                {r.rating != null ? (
                  <span className="rating-badge">{r.rating} / 10</span>
                ) : (
                  <span className="rating-badge rating-badge--muted">No rating</span>
                )}
              </div>
              {r.review && <p>{r.review}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
