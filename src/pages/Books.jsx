import { useEffect, useState } from 'react'
import { api } from '../api/client'
import BookCard from '../components/BookCard.jsx'
import Pagination from '../components/Pagination.jsx'
import ErrorBanner from '../components/ErrorBanner.jsx'

const LIMIT = 20

export default function Books() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [skip, setSkip] = useState(0)
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search)
      setSkip(0)
    }, 350)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    api
      .getBooks({ search: debouncedSearch, skip, limit: LIMIT })
      .then((data) => {
        if (!cancelled) setBooks(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.detail || 'Не удалось загрузить книги')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [debouncedSearch, skip])

  return (
    <div className="page">
      <div className="eyebrow">Каталог Эсагилы</div>
      <h1>Книги</h1>

      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Поиск по названию или автору…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <ErrorBanner message={error} />

      {loading ? (
        <div className="spinner-text">Загрузка…</div>
      ) : books.length === 0 ? (
        <div className="empty-state">
          <p>Ничего не нашлось. Попробуйте другой запрос.</p>
        </div>
      ) : (
        <div className="book-grid">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}

      <Pagination
        skip={skip}
        limit={LIMIT}
        count={books.length}
        onPrev={() => setSkip(Math.max(0, skip - LIMIT))}
        onNext={() => setSkip(skip + LIMIT)}
      />
    </div>
  )
}
