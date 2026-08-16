import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="page empty-state">
      <h1>404</h1>
      <p>Такой таблички в архиве нет.</p>
      <Link to="/" className="btn btn--primary" style={{ display: 'inline-block', marginTop: 14 }}>
        В каталог
      </Link>
    </div>
  )
}
