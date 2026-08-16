import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <NavLink to="/" className="navbar__brand">
          <span className="mark">𒀭</span> Esagila
        </NavLink>
        <nav className="navbar__links">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            Catalog
          </NavLink>
          {user && (
            <NavLink to="/library" className={({ isActive }) => (isActive ? 'active' : '')}>
              My Library
            </NavLink>
          )}
          {user?.role === 'ADMIN' && (
            <NavLink to="/admin" className={({ isActive }) => (isActive ? 'active' : '')}>
              Manage Catalog
            </NavLink>
          )}
          {user ? (
            <>
              <span className="navbar__user">{user.username}</span>
              <button className="btn btn--ghost btn--small" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <NavLink to="/auth" className={({ isActive }) => (isActive ? 'active' : '')}>
              Sign in
            </NavLink>
          )}
        </nav>
      </div>
      <div className="rosette-divider rosette-divider--soft" />
    </header>
  )
}
