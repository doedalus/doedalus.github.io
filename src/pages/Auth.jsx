import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import ErrorBanner from '../components/ErrorBanner.jsx'
import { ApiError } from '../api/client'

export default function Auth() {
  const [tab, setTab] = useState('login')
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [registerForm, setRegisterForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(loginForm.username, loginForm.password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : 'Could not sign in')
    } finally {
      setBusy(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await register(registerForm.username, registerForm.email, registerForm.password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : 'Could not register')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page page--narrow">
      <div className="eyebrow">Library access</div>
      <h1>{tab === 'login' ? 'Sign in' : 'Register'}</h1>

      <div className="tabs">
        <button className={tab === 'login' ? 'active' : ''} onClick={() => { setTab('login'); setError('') }}>
          Sign in
        </button>
        <button className={tab === 'register' ? 'active' : ''} onClick={() => { setTab('register'); setError('') }}>
          Register
        </button>
      </div>

      <ErrorBanner message={error} />

      {tab === 'login' ? (
        <form onSubmit={handleLogin} className="panel">
          <div className="field">
            <label htmlFor="login-username">Username</label>
            <input
              id="login-username"
              required
              minLength={3}
              maxLength={30}
              value={loginForm.username}
              onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              required
              minLength={8}
              maxLength={128}
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
            />
          </div>
          <button className="btn btn--primary" disabled={busy} type="submit">
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="panel">
          <div className="field">
            <label htmlFor="reg-username">Username</label>
            <input
              id="reg-username"
              required
              minLength={3}
              maxLength={30}
              value={registerForm.username}
              onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              type="email"
              required
              value={registerForm.email}
              onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              required
              minLength={8}
              maxLength={128}
              value={registerForm.password}
              onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
            />
            <span className="field-hint">At least 8 characters</span>
          </div>
          <button className="btn btn--primary" disabled={busy} type="submit">
            {busy ? 'Registering…' : 'Register'}
          </button>
        </form>
      )}
    </div>
  )
}
