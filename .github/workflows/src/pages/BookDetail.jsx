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
      setError(err.detail || 'Не удалось загрузить книгу')
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
      setNotice('Книга добавлена в вашу библиотеку.')
      loadBook()
    } catch (err) {
      setSaveError(err.detail || 'Не удалось добавить книгу')
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
      setNotice('Изменения сохранены.')
      loadBook()
    } catch (err) {
      setSaveError(err.detail || 'Не удалось сохранить изменения')
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async () => {
    if (!confirm('Убрать книгу из своей библиотеки?')) return
    setSaving(true)
    setSaveError('')
    try {
      await api.removeFromLibrary(bookId)
      setMyEntry(null)
      setForm({ rating: null, review: '' })
      setNotice('Книга удалена из вашей библиотеки.')
      loadBook()
    } catch (err) {
      setSaveError(err.detail || 'Не удалось удалить книгу')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="spinner-text">Загрузка…</div>
  if (error) {
    return (
      <div className="page">
        <ErrorBanner message={error} />
        <Link to="/">← Назад в каталог</Link>
      </div>
    )
  }
  if (!book) return null

  return (
    <div className="page">
      <Link to="/" className="eyebrow">
        ← Каталог
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
          <span className="rating-badge rating-badge--muted">Нет оценок</span>
        )}
      </div>

      <p style={{ marginTop: 18 }}>{book.description}</p>

      <div className="rosette-divider rosette-divider--soft" style={{ margin: '36px 0' }} />

      <h2>Ваша запись</h2>
      {!user ? (
        <p className="field-hint">
          <Link to="/auth">Войдите</Link>, чтобы добавить эту книгу в свою библиотеку и оставить отзыв.
        </p>
      ) : entryLoading ? (
        <div className="spinner-text">Загрузка…</div>
      ) : (
        <div className="panel">
          <ErrorBanner message={saveError} />
          {notice && <div className="success-banner">{notice}</div>}
          <form onSubmit={myEntry ? handleUpdate : handleAdd}>
            <div className="field">
              <label htmlFor="rating">Оценка</label>
              <RatingInput value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
            </div>
            <div className="field">
              <label htmlFor="review">Отзыв</label>
              <textarea
                id="review"
                maxLength={1000}
                placeholder="Что вы думаете об этой книге?"
                value={form.review}
                onChange={(e) => setForm({ ...form, review: e.target.value })}
              />
            </div>
            <div className="actions-row">
              <button className="btn btn--primary" type="submit" disabled={saving}>
                {myEntry ? (saving ? 'Сохраняем…' : 'Сохранить') : saving ? 'Добавляем…' : 'Добавить в библиотеку'}
              </button>
              {myEntry && (
                <button type="button" className="btn btn--danger" disabled={saving} onClick={handleRemove}>
                  Убрать из библиотеки
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="rosette-divider rosette-divider--soft" style={{ margin: '36px 0' }} />

      <h2>Отзывы {reviews.length > 0 && `(${reviews.length})`}</h2>
      {reviews.length === 0 ? (
        <div className="empty-state">
          <p>Пока никто не оставил отзыв на эту книгу.</p>
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
                  <span className="rating-badge rating-badge--muted">Без оценки</span>
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
