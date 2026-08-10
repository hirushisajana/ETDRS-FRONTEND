import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { publicAuthApi, publicApi } from '../../api'
import type { PublicTrustResponse } from '../../types'

interface StoredUser {
  displayName?: string
  identityType?: string
  identityValue?: string
}

export default function PublicPortalHome() {
  const navigate = useNavigate()

  const stored: StoredUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('public_auth_user') || '{}')
    } catch {
      return {}
    }
  })()

  const { data: trusts, isLoading, error } = useQuery({
    queryKey: ['public-my-trusts'],
    queryFn: publicApi.getMyTrusts,
  })

  const handleLogout = async () => {
    try {
      await publicAuthApi.logout()
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('public_auth_token')
      localStorage.removeItem('public_auth_user')
      navigate('/register')
    }
  }

  const badgeColor = (status: string | undefined) => {
    switch (status) {
      case 'REGISTERED':
        return 'bg-green-100 text-green-700'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700'
      case 'REJECTED':
        return 'bg-red-100 text-red-700'
      case 'REPORTED':
      case 'SUSPICIOUS':
        return 'bg-orange-100 text-orange-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-maroon-900">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/national.jpg?v=2" alt="" className="h-9 w-auto" />
            <span className="text-maroon-400 text-lg font-thin">|</span>
            <img src="/RGD.png" alt="" className="h-9 w-auto" />
            <div className="ml-2">
              <p className="text-white font-semibold leading-tight">Public Portal</p>
              <p className="text-xs text-maroon-200/70">Trust Registration System</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="px-4 py-2 text-sm text-maroon-100 bg-maroon-800 hover:bg-maroon-700 rounded-lg transition-colors">
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-maroon-900">
          Welcome, {stored.displayName || 'Guest'}
        </h1>
        <p className="text-gray-500 mt-1 mb-6">
          Here are the trusts associated with your {stored.identityType ?? 'identity'}.
        </p>

        {isLoading && (
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-500">
            Loading your trusts...
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6">
            {(error as Error).message}
          </div>
        )}

        {!isLoading && !error && trusts && trusts.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-500">
            No registered trusts were found for your identity.
          </div>
        )}

        {!isLoading && !error && trusts && trusts.length > 0 && (
          <div className="grid gap-4">
            {trusts.map((trust: PublicTrustResponse) => (
              <button
                key={trust.folioId}
                onClick={() => navigate(`/portal/trust/${trust.folioId}`)}
                className="bg-white border border-gray-200 rounded-xl p-6 text-left hover:shadow-md hover:border-maroon-300 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-maroon-900">{trust.trustName}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Daybook: <span className="font-medium text-gray-700">{trust.daybookNumber}</span>
                      {' · '}Registry: <span className="font-medium text-gray-700">{trust.registryName}</span>
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${badgeColor(trust.approvalStatus)}`}>
                    {trust.approvalStatus}
                  </span>
                </div>
                <div className="mt-4 text-xs text-gray-500 flex flex-wrap gap-x-4 gap-y-1">
                  <span>Type: <span className="text-gray-700 font-medium">{trust.trustType}</span></span>
                  <span>Category: <span className="text-gray-700 font-medium">{trust.trustCategory}</span></span>
                  <span>
                    Certificate:{' '}
                    <span className={`font-medium ${trust.certificateStatus === 'ACTIVE' ? 'text-green-600' : 'text-orange-600'}`}>
                      {trust.certificateStatus}
                    </span>
                  </span>
                  {trust.parties.length > 0 && (
                    <span>Parties: <span className="text-gray-700 font-medium">{trust.parties.length}</span></span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}