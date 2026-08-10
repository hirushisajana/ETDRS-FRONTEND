import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { publicApi } from '../../api'

const roleLabel: Record<string, string> = {
  AUTHOR_SETTLOR: 'Author / Settlor',
  TRUSTEE: 'Trustee',
  CO_TRUSTEE: 'Co-trustee',
  BENEFICIARY: 'Beneficiary',
  BENEFICIAL_OWNER: 'Beneficial owner',
}

export default function PublicTrustDetailPage() {
  const { folioId } = useParams()
  const navigate = useNavigate()
  const id = Number(folioId)

  const { data: trust, isLoading, error } = useQuery({
    queryKey: ['public-trust', id],
    queryFn: () => publicApi.getTrustDetail(id),
    enabled: Number.isFinite(id),
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">
        Loading trust details...
      </div>
    )
  }

  if (error || !trust) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white border border-red-200 text-red-700 text-sm rounded-xl px-6 py-5 max-w-md">
          {(error as Error)?.message || 'Unable to load this trust.'}
          <div className="mt-4">
            <button onClick={() => navigate('/portal')}
              className="px-4 py-2 bg-maroon-900 hover:bg-maroon-800 text-white text-sm rounded-lg transition-colors">
              Back to my trusts
            </button>
          </div>
        </div>
      </div>
    )
  }

  const t = trust

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
          <button onClick={() => navigate('/portal')}
            className="px-4 py-2 text-sm text-maroon-100 bg-maroon-800 hover:bg-maroon-700 rounded-lg transition-colors">
            My trusts
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={() => navigate('/portal')}
          className="text-sm text-maroon-700 hover:text-maroon-900 mb-4">
          &larr; Back to my trusts
        </button>

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="bg-maroon-50 border-b border-maroon-100 px-6 py-5">
            <h1 className="text-2xl font-bold text-maroon-900">{t.trustName}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Daybook: <span className="font-medium text-gray-700">{t.daybookNumber}</span>
              {' · '}Registry: <span className="font-medium text-gray-700">{t.registryName}</span>
            </p>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Trust type</p>
                <p className="font-medium text-gray-800">{t.trustType}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Category</p>
                <p className="font-medium text-gray-800">{t.trustCategory}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Approval status</p>
                <p className="font-medium text-gray-800">{t.approvalStatus}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Certificate</p>
                <p className={`font-medium ${t.certificateStatus === 'ACTIVE' ? 'text-green-600' : 'text-orange-600'}`}>
                  {t.certificateStatus}
                  {t.certificateExpiry ? ` · ${t.certificateExpiry}` : ''}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Trust address</p>
                <p className="font-medium text-gray-800">{t.trustAddress || 'Not provided'}</p>
              </div>
            </div>

            {t.trustPurpose && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Purpose</h3>
                <p className="text-sm text-gray-600 whitespace-pre-line">{t.trustPurpose}</p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Parties</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 uppercase tracking-wide border-b border-gray-200">
                      <th className="py-2 pr-4">Role</th>
                      <th className="py-2 pr-4">Type</th>
                      <th className="py-2">Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {t.parties.map((p, i) => (
                      <tr key={i} className="border-b border-gray-100 last:border-0">
                        <td className="py-2.5 pr-4 font-medium text-gray-800">
                          {roleLabel[p.partyRole] || p.partyRole}
                        </td>
                        <td className="py-2.5 pr-4 text-gray-600">{p.partyType}</td>
                        <td className="py-2.5 text-gray-600">{p.fullName || p.groupDescription || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {t.properties.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Trust property</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {t.properties.map((p, i) => (
                    <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm">
                      <p className="font-medium text-gray-800">{p.propertyType}</p>
                      <p className="text-gray-600 mt-0.5">
                        {p.amount ? `${p.currency ?? 'Rs'} ${p.amount}` : ''}
                        {p.landAmount ? `Land: Rs ${p.landAmount}` : ''}
                        {p.vehicleDetails}
                        {p.otherDescription}
                        {p.propertyValue ? `Value: Rs ${p.propertyValue}` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}