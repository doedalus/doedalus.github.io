export default function Pagination({ skip, limit, count, onPrev, onNext }) {
  const page = Math.floor(skip / limit) + 1
  const hasPrev = skip > 0
  const hasNext = count === limit // heuristic: a full page means there's likely more

  return (
    <div className="pagination">
      <button className="btn btn--small btn--ghost" onClick={onPrev} disabled={!hasPrev}>
        ← Prev
      </button>
      <span>Page {page}</span>
      <button className="btn btn--small btn--ghost" onClick={onNext} disabled={!hasNext}>
        Next →
      </button>
    </div>
  )
}
