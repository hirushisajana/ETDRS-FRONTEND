import { useState } from 'react'
import { Link } from 'react-router-dom'
import { publicAuthApi } from '../../api'

type IdType = 'NIC' | 'PASSPORT' | 'COMPANY'

const labelStyle = 'block text-sm font-medium text-maroon-900 mb-1'
const inputStyle =
  'w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-maroon-500/20 focus:border-maroon-500 outline-none transition-all'
const selectorStyle =
  'flex-1 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer'

export default function PublicForgotPasswordPage() {
  const [idType, setIdType] = useState<IdType>('NIC')
  const [idValue, setIdValue] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await publicAuthApi.forgotPassword({
        identityType: idType,
        identityValue: idValue.trim(),
      })
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
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
            <h1 className="text-xl font-bold text-maroon-900">Forgot Password</h1>
            <p className="text-sm text-maroon-400 mt-1">Public Portal</p>
          </div>

          {submitted ? (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
              If an account exists for that identity, a password reset link has been sent to the
              registered email address.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                  {error}
                </div>
              )}
              <div>
                <span className={labelStyle}>Identity type</span>
                <div className="flex gap-2">
                  {(['NIC', 'PASSPORT', 'COMPANY'] as IdType[]).map((t) => (
                    <button key={t} type="button" onClick={() => setIdType(t)}
                      className={`${selectorStyle} ${idType === t ? 'bg-maroon-700 text-white' : 'bg-maroon-50 text-maroon-700 hover:bg-maroon-100'}`}>
                      {t === 'COMPANY' ? 'Company' : t === 'PASSPORT' ? 'Passport' : 'NIC'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelStyle}>
                  {idType === 'COMPANY' ? 'Company registration number' : idType === 'PASSPORT' ? 'Passport number' : 'NIC number'}
                </label>
                <input type="text" className={inputStyle} value={idValue}
                  onChange={(e) => setIdValue(e.target.value)} required />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-maroon-900 hover:bg-maroon-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
              <div className="text-center">
                <Link to="/register" className="text-sm text-maroon-700 hover:text-maroon-900">
                  Back to sign in
                </Link>
              </div>
            </form>
          )}
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