import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts'

export default function LoginPage() {
  const { login, isLoading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid email or password')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-maroon-900 to-maroon-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <img src="/national.jpg?v=2" alt="" className="h-10 w-auto" />
          <span className="text-maroon-400 text-lg font-thin">|</span>
          <img src="/RGD.png" alt="" className="h-10 w-auto" />
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-maroon-900">Staff Login</h1>
            <p className="text-sm text-maroon-400 mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-maroon-500/20 focus:border-maroon-500 outline-none transition-all"
                placeholder="you@domain.gov.lk"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-maroon-500/20 focus:border-maroon-500 outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-maroon-900 hover:bg-maroon-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col items-center gap-2 text-xs text-gray-500">
            <Link to="/activate" className="text-maroon-700 hover:text-maroon-900 transition-colors">
              Activate account
            </Link>
            <Link to="/forgot-password" className="text-maroon-700 hover:text-maroon-900 transition-colors">
              Forgot password?
            </Link>
          </div>
        </div>

        <p className="text-center mt-6">
          <Link to="/" className="text-xs text-maroon-300/60 hover:text-maroon-200 transition-colors">
            &larr; Back to home
          </Link>
        </p>
      </div>
    </div>
  )
}
