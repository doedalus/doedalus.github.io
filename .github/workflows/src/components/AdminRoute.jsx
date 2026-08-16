import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <div className="spinner-text">Загрузка…</div>
  if (!user) return <Navigate to="/auth" state={{ from: location }} replace />
  if (user.role !== 'ADMIN') return <Navigate to="/" replace />

  return children
}
