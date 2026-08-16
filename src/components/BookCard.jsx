import { Link } from 'react-router-dom'
import BookCover from './BookCover.jsx'

export default function BookCard({ book }) {
  return (
    <Link to={`/books/${book.id}`} className="book-card" style={{ textDecoration: 'none' }}>
      <div className="book-card__cover">
        <BookCover title={book.title} />
        {book.avg_rating != null && (
          <span className="rating-badge book-card__rating">★ {book.avg_rating.toFixed(1)}</span>
        )}
      </div>
      <h3>{book.title}</h3>
      <div className="author">{book.author}</div>
      <p className="description">{book.description}</p>
    </Link>
  )
}
