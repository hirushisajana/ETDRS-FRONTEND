import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { publicAuthApi } from '../../api'

const labelStyle = 'block text-sm font-medium text-maroon-900 mb-1'
const inputStyle =
  'w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-maroon-500/20 focus:border-maroon-500 outline-none transition-all'

export default function PublicResetPasswordPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      await publicAuthApi.resetPassword({
        token,
        newPassword: password,
        confirmPassword: confirm,
      })
      navigate('/register')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-maroon-900 to-maroon-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <img src="/national.jpg?v=2" alt="" className="h-10 w-auto" />
          <span className="text-maroon-400 text-lg font-thin">|</span>
          <img src="/RGD.png" alt="" className="h-10 w-auto" />
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-maroon-900">Reset Password</h1>
            <p className="text-sm text-maroon-400 mt-1">Public Portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}
            <div>
              <label className={labelStyle}>New password</label>
              <input type="password" className={inputStyle} value={password}
                onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div>
              <label className={labelStyle}>Confirm new password</label>
              <input type="password" className={inputStyle} value={confirm}
                onChange={(e) => setConfirm(e.target.value)} required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-maroon-900 hover:bg-maroon-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
              {loading ? 'Resetting...' : 'Reset password'}
            </button>
            <div className="text-center">
              <Link to="/register" className="text-sm text-maroon-700 hover:text-maroon-900">
                Back to sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}