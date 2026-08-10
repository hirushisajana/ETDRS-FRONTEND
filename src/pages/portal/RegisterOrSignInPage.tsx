import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { publicAuthApi } from '../../api'
import type {
  PublicRegisterIndividualRequest,
  PublicRegisterCompanyRequest,
  PublicLoginRequest,
} from '../../types'

type Mode = 'register' | 'login'
type PartyTab = 'individual' | 'company'
type IndividualIdType = 'NIC' | 'PASSPORT'
type LoginIdType = 'NIC' | 'PASSPORT' | 'COMPANY'

const labelStyle =
  'block text-sm font-medium text-maroon-900 mb-1'
const inputStyle =
  'w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-maroon-500/20 focus:border-maroon-500 outline-none transition-all'
const selectorStyle =
  'flex-1 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer'

export default function RegisterOrSignInPage() {
  const navigate = useNavigate()

  const [mode, setMode] = useState<Mode>('register')
  const [partyTab, setPartyTab] = useState<PartyTab>('individual')

  // Registration state
  const [idType, setIdType] = useState<IndividualIdType>('NIC')
  const [indIdNumber, setIndIdNumber] = useState('')
  const [indFullName, setIndFullName] = useState('')
  const [indEmail, setIndEmail] = useState('')
  const [indPhone, setIndPhone] = useState('')

  const [compRegNumber, setCompRegNumber] = useState('')
  const [compName, setCompName] = useState('')
  const [compEmail, setCompEmail] = useState('')

  // Password setup state
  const [setupToken, setSetupToken] = useState('')
  const [maskedContact, setMaskedContact] = useState('')
  const [pw, setPw] = useState('')
  const [pwConfirm, setPwConfirm] = useState('')

  // Login state
  const [loginIdType, setLoginIdType] = useState<LoginIdType>('NIC')
  const [loginIdValue, setLoginIdValue] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  const clearMessages = () => {
    setError('')
    setSuccess('')
  }

  const handleRegisterIndividual = async (e: React.FormEvent) => {
    e.preventDefault()
    clearMessages()
    setLoading(true)
    try {
      const payload: PublicRegisterIndividualRequest = {
        idType,
        idNumber: indIdNumber.trim(),
        fullName: indFullName.trim(),
        email: indEmail.trim(),
        phone: indPhone.trim(),
      }
      const res = await publicAuthApi.registerIndividual(payload)
      setSetupToken(res.setupToken)
      setMaskedContact(res.maskedContact)
      setSuccess(res.message)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    clearMessages()
    setLoading(true)
    try {
      const payload: PublicRegisterCompanyRequest = {
        companyRegNumber: compRegNumber.trim(),
        companyName: compName.trim(),
        email: compEmail.trim(),
      }
      const res = await publicAuthApi.registerCompany(payload)
      setSetupToken(res.setupToken)
      setMaskedContact(res.maskedContact)
      setSuccess(res.message)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    clearMessages()
    if (pw !== pwConfirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      await publicAuthApi.setPassword({ setupToken, password: pw, confirmPassword: pwConfirm })
      setSuccess('Your account has been created. You can now sign in.')
      setSetupToken('')
      setPw('')
      setPwConfirm('')
      setMode('login')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to set password')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    clearMessages()
    setLoading(true)
    try {
      const payload: PublicLoginRequest = {
        identityType: loginIdType,
        identityValue: loginIdValue.trim(),
        password: loginPassword,
      }
      const res = await publicAuthApi.login(payload)
      localStorage.setItem('public_auth_token', res.token)
      localStorage.setItem('public_auth_user', JSON.stringify({
        displayName: res.displayName,
        identityType: res.identityType,
        identityValue: res.identityValue,
      }))
      navigate('/portal')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-maroon-900 to-maroon-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-center gap-2 mb-8">
          <img src="/national.jpg?v=2" alt="" className="h-10 w-auto" />
          <span className="text-maroon-400 text-lg font-thin">|</span>
          <img src="/RGD.png" alt="" className="h-10 w-auto" />
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-maroon-900 px-6 py-5 text-center">
            <h1 className="text-xl font-bold text-white">Public Portal</h1>
            <p className="text-sm text-maroon-200/70 mt-1">
              Register or sign in to view your trust details and certificates
            </p>
          </div>

          {/* Mode toggle */}
          <div className="p-4 pb-0">
            <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-maroon-50 border border-maroon-100">
              <button
                type="button"
                onClick={() => { setMode('register'); clearMessages() }}
                className={`${selectorStyle} ${mode === 'register' ? 'bg-maroon-900 text-white shadow' : 'text-maroon-700 hover:bg-maroon-100'}`}
              >
                First time here
              </button>
              <button
                type="button"
                onClick={() => { setMode('login'); clearMessages() }}
                className={`${selectorStyle} ${mode === 'login' ? 'bg-maroon-900 text-white shadow' : 'text-maroon-700 hover:bg-maroon-100'}`}
              >
                I already have an account
              </button>
            </div>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}
            {success && !setupToken && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
                {success}
              </div>
            )}

            {mode === 'register' && !setupToken && (
              <>
                {/* Company / Individual tabs */}
                <div className="flex gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => { setPartyTab('individual'); clearMessages() }}
                    className={`${selectorStyle} ${partyTab === 'individual' ? 'bg-maroon-700 text-white' : 'bg-maroon-50 text-maroon-700 hover:bg-maroon-100'}`}
                  >
                    Individual
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPartyTab('company'); clearMessages() }}
                    className={`${selectorStyle} ${partyTab === 'company' ? 'bg-maroon-700 text-white' : 'bg-maroon-50 text-maroon-700 hover:bg-maroon-100'}`}
                  >
                    Company
                  </button>
                </div>

                {partyTab === 'individual' ? (
                  <form onSubmit={handleRegisterIndividual} className="space-y-4">
                    {/* ID type selector */}
                    <div>
                      <span className={labelStyle}>Identity type</span>
                      <div className="flex gap-2">
                        {(['NIC', 'PASSPORT'] as IndividualIdType[]).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setIdType(t)}
                            className={`${selectorStyle} ${idType === t ? 'bg-maroon-700 text-white' : 'bg-maroon-50 text-maroon-700 hover:bg-maroon-100'}`}
                          >
                            {t === 'NIC' ? 'NIC' : 'Passport'}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-1.5">
                        {idType === 'NIC'
                          ? 'For Sri Lankan citizens (9 or 12 digit NIC).'
                          : 'For foreign trust parties registered with a passport number.'}
                      </p>
                    </div>

                    <div>
                      <label className={labelStyle}>{idType === 'NIC' ? 'NIC number' : 'Passport number'}</label>
                      <input type="text" className={inputStyle} value={indIdNumber}
                        onChange={(e) => setIndIdNumber(e.target.value)} required />
                    </div>
                    <div>
                      <label className={labelStyle}>Full name</label>
                      <input type="text" className={inputStyle} value={indFullName}
                        onChange={(e) => setIndFullName(e.target.value)} required />
                    </div>
                    <div>
                      <label className={labelStyle}>Email address</label>
                      <input type="email" className={inputStyle} value={indEmail}
                        onChange={(e) => setIndEmail(e.target.value)} required />
                    </div>
                    <div>
                      <label className={labelStyle}>Phone number</label>
                      <input type="tel" className={inputStyle} value={indPhone}
                        onChange={(e) => setIndPhone(e.target.value)} placeholder="Optional" />
                    </div>

                    <button type="submit" disabled={loading}
                      className="w-full py-2.5 bg-maroon-900 hover:bg-maroon-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
                      {loading ? 'Verifying...' : 'Verify & continue'}
                    </button>
                    <p className="text-xs text-gray-500 text-center">
                      You can only register if you are named on a registered trust deed.
                    </p>
                  </form>
                ) : (
                  <form onSubmit={handleRegisterCompany} className="space-y-4">
                    <div>
                      <label className={labelStyle}>Company registration number</label>
                      <input type="text" className={inputStyle} value={compRegNumber}
                        onChange={(e) => setCompRegNumber(e.target.value)} required />
                    </div>
                    <div>
                      <label className={labelStyle}>Company name</label>
                      <input type="text" className={inputStyle} value={compName}
                        onChange={(e) => setCompName(e.target.value)} required />
                    </div>
                    <div>
                      <label className={labelStyle}>Contact email</label>
                      <input type="email" className={inputStyle} value={compEmail}
                        onChange={(e) => setCompEmail(e.target.value)} required />
                    </div>

                    <button type="submit" disabled={loading}
                      className="w-full py-2.5 bg-maroon-900 hover:bg-maroon-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
                      {loading ? 'Verifying...' : 'Verify & continue'}
                    </button>
                    <p className="text-xs text-gray-500 text-center">
                      For companies named as a settlor, trustee, or beneficiary on a trust.
                    </p>
                  </form>
                )}
              </>
            )}

            {/* Set-password step */}
            {mode === 'register' && setupToken && (
              <form onSubmit={handleSetPassword} className="space-y-4">
                <div className="bg-maroon-50 border border-maroon-100 text-maroon-800 text-sm rounded-lg px-4 py-3">
                  {success && <p className="mb-1">{success}</p>}
                  <p>
                    A verification link has been sent to{' '}
                    <span className="font-semibold">{maskedContact}</span>, or use this page directly
                    to set your password now.
                  </p>
                </div>
                <div>
                  <label className={labelStyle}>Password</label>
                  <input type="password" className={inputStyle} value={pw}
                    onChange={(e) => setPw(e.target.value)} required />
                  <p className="text-xs text-gray-500 mt-1.5">
                    At least 8 characters with uppercase, lowercase, a number and a special character.
                  </p>
                </div>
                <div>
                  <label className={labelStyle}>Confirm password</label>
                  <input type="password" className={inputStyle} value={pwConfirm}
                    onChange={(e) => setPwConfirm(e.target.value)} required />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-2.5 bg-maroon-900 hover:bg-maroon-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
                  {loading ? 'Creating account...' : 'Set password & create account'}
                </button>
              </form>
            )}

            {/* Login */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <span className={labelStyle}>Identity type</span>
                  <div className="flex gap-2">
                    {(['NIC', 'PASSPORT', 'COMPANY'] as LoginIdType[]).map((t) => (
                      <button key={t} type="button" onClick={() => setLoginIdType(t)}
                        className={`${selectorStyle} ${loginIdType === t ? 'bg-maroon-700 text-white' : 'bg-maroon-50 text-maroon-700 hover:bg-maroon-100'}`}>
                        {t === 'COMPANY' ? 'Company' : t === 'PASSPORT' ? 'Passport' : 'NIC'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={labelStyle}>
                    {loginIdType === 'COMPANY' ? 'Company registration number' : loginIdType === 'PASSPORT' ? 'Passport number' : 'NIC number'}
                  </label>
                  <input type="text" className={inputStyle} value={loginIdValue}
                    onChange={(e) => setLoginIdValue(e.target.value)} required />
                </div>
                <div>
                  <label className={labelStyle}>Password</label>
                  <input type="password" className={inputStyle} value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)} required />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-2.5 bg-maroon-900 hover:bg-maroon-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
                <div className="text-center">
                  <Link to="/portal/forgot-password" className="text-sm text-maroon-700 hover:text-maroon-900">
                    Forgot password?
                  </Link>
                </div>
              </form>
            )}
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