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
        if (!cancelled) setError(err.detail || 'Could not load books')
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
      <div className="eyebrow">Esagila catalog</div>
      <h1>Books</h1>

      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Search by title or author…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <ErrorBanner message={error} />

      {loading ? (
        <div className="spinner-text">Loading…</div>
      ) : books.length === 0 ? (
        <div className="empty-state">
          <p>No books found. Try a different search.</p>
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
