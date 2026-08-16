import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import Pagination from '../components/Pagination.jsx'
import ErrorBanner from '../components/ErrorBanner.jsx'

const LIMIT = 20

export default function UserLibrary() {
  const { userId } = useParams()
  const [skip, setSkip] = useState(0)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    api
      .getUserLibrary(userId, { skip, limit: LIMIT })
      .then((data) => {
        if (!cancelled) setItems(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.detail || 'Не удалось загрузить библиотеку пользователя')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [userId, skip])

  const username = items[0]?.user?.username

  return (
    <div className="page">
      <div className="eyebrow">Библиотека пользователя</div>
      <h1>{username || `Пользователь #${userId}`}</h1>

      <ErrorBanner message={error} />

      {loading ? (
        <div className="spinner-text">Загрузка…</div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <p>У этого пользователя пока нет книг в библиотеке.</p>
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
