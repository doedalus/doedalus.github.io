import { useEffect, useState } from 'react'
import { api, ApiError } from '../api/client'
import ErrorBanner from '../components/ErrorBanner.jsx'
import Pagination from '../components/Pagination.jsx'

const LIMIT = 20
const emptyForm = { title: '', author: '', description: '' }

export default function Admin() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [skip, setSkip] = useState(0)

  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState('')

  const [createForm, setCreateForm] = useState(emptyForm)
  const [createError, setCreateError] = useState('')
  const [creating, setCreating] = useState(false)

  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState(emptyForm)
  const [rowError, setRowError] = useState({})
  const [rowBusy, setRowBusy] = useState({})

  const [forbidden, setForbidden] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search)
      setSkip(0)
    }, 350)
    return () => clearTimeout(t)
  }, [search])

  const load = () => {
    setLoading(true)
    setListError('')
    api
      .getBooks({ search: debouncedSearch, skip, limit: LIMIT })
      .then(setBooks)
      .catch((err) => setListError(err.detail || 'Could not load books'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [debouncedSearch, skip])

  const setBusyFor = (id, val) => setRowBusy((s) => ({ ...s, [id]: val }))
  const setErrorFor = (id, val) => setRowError((s) => ({ ...s, [id]: val }))

  const handleForbidden = (err) => {
    if (err instanceof ApiError && err.status === 403) {
      setForbidden(true)
      return true
    }
    return false
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreateError('')
    setCreating(true)
    try {
      await api.createBook(createForm)
      setCreateForm(emptyForm)
      load()
    } catch (err) {
      if (!handleForbidden(err)) setCreateError(err.detail || 'Could not create book')
    } finally {
      setCreating(false)
    }
  }

  const startEdit = (book) => {
    setEditingId(book.id)
    setEditForm({ title: book.title, author: book.author, description: book.description })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm(emptyForm)
  }

  const handleUpdate = async (id) => {
    setErrorFor(id, '')
    setBusyFor(id, true)
    try {
      const updated = await api.updateBook(id, editForm)
      setBooks((prev) => prev.map((b) => (b.id === id ? updated : b)))
      cancelEdit()
    } catch (err) {
      if (!handleForbidden(err)) setErrorFor(id, err.detail || 'Could not save book')
    } finally {
      setBusyFor(id, false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this book from the catalog? This will also delete all related entries and reviews.')) return
    setErrorFor(id, '')
    setBusyFor(id, true)
    try {
      await api.deleteBook(id)
      setBooks((prev) => prev.filter((b) => b.id !== id))
    } catch (err) {
      if (!handleForbidden(err)) setErrorFor(id, err.detail || 'Could not delete book')
    } finally {
      setBusyFor(id, false)
    }
  }

  return (
    <div className="page">
      <div className="eyebrow">Admins only</div>
      <h1>Manage Catalog</h1>

      {forbidden && (
        <div className="error-banner">
          Access denied: this account is not an administrator. Actions requiring admin
          rights are rejected by the server.
        </div>
      )}

      <h2 style={{ marginTop: 32 }}>Add a book</h2>
      <form onSubmit={handleCreate} className="panel">
        <ErrorBanner message={createError} />
        <div className="form-row">
          <div className="field">
            <label htmlFor="c-title">Title</label>
            <input
              id="c-title"
              required
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="c-author">Author</label>
            <input
              id="c-author"
              required
              value={createForm.author}
              onChange={(e) => setCreateForm({ ...createForm, author: e.target.value })}
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="c-description">Description</label>
          <textarea
            id="c-description"
            required
            value={createForm.description}
            onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
          />
        </div>
        <button className="btn btn--primary" type="submit" disabled={creating}>
          {creating ? 'Adding…' : 'Add book'}
        </button>
      </form>

      <div className="rosette-divider rosette-divider--soft" style={{ margin: '36px 0' }} />

      <h2>All books</h2>
      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Search by title or author…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <ErrorBanner message={listError} />

      {loading ? (
        <div className="spinner-text">Loading…</div>
      ) : books.length === 0 ? (
        <div className="empty-state">
          <p>No books found.</p>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Description</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id}>
                {editingId === book.id ? (
                  <>
                    <td>
                      <input
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        value={editForm.author}
                        onChange={(e) => setEditForm({ ...editForm, author: e.target.value })}
                      />
                    </td>
                    <td>
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      />
                      {rowError[book.id] && <div className="error-banner">{rowError[book.id]}</div>}
                    </td>
                    <td>
                      <div className="actions-row">
                        <button
                          className="btn btn--small btn--primary"
                          disabled={rowBusy[book.id]}
                          onClick={() => handleUpdate(book.id)}
                        >
                          Save
                        </button>
                        <button className="btn btn--small btn--ghost" onClick={cancelEdit}>
                          Cancel
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.description}</td>
                    <td>
                      <div className="actions-row">
                        <button className="btn btn--small btn--ghost" onClick={() => startEdit(book)}>
                          Edit
                        </button>
                        <button
                          className="btn btn--small btn--danger"
                          disabled={rowBusy[book.id]}
                          onClick={() => handleDelete(book.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
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
