import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import Pagination from '../components/Pagination.jsx'
import ErrorBanner from '../components/ErrorBanner.jsx'

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
        if (!cancelled) setError(err.detail || 'Не удалось загрузить библиотеку')
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
      <div className="eyebrow">Личное собрание</div>
      <h1>Моя библиотека</h1>

      <ErrorBanner message={error} />

      {loading ? (
        <div className="spinner-text">Загрузка…</div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <p>Вы ещё не добавили ни одной книги.</p>
          <Link to="/" className="btn btn--primary" style={{ display: 'inline-block', marginTop: 14 }}>
            Перейти в каталог
          </Link>
        </div>
      ) : (
        <div>
          {items.map((entry) => (
            <div className="review-card" key={entry.book.id}>
              <div className="review-card__head">
                <Link to={`/books/${entry.book.id}`}>
                  <strong>{entry.book.title}</strong> — {entry.book.author}
                </Link>
                {entry.rating != null ? (
                  <span className="rating-badge">{entry.rating} / 10</span>
                ) : (
                  <span className="rating-badge rating-badge--muted">Без оценки</span>
                )}
              </div>
              {entry.review && <p>{entry.review}</p>}
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
