import { Link } from 'react-router-dom'
import BookCover from './BookCover.jsx'

export default function BookCard({ book }) {
  return (
    <Link to={`/books/${book.id}`} className="book-card" style={{ textDecoration: 'none' }}>
      <BookCover title={book.title} />
      <h3>{book.title}</h3>
      <div className="author">{book.author}</div>
      <p className="description">{book.description}</p>
    </Link>
  )
}
