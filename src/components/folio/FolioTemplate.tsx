import type { Folio, Party, Property } from '../../types';

interface Props {
  folio: Folio;
  parties?: Party[];
  properties?: Property[];
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 py-2 border-b border-gray-100 last:border-0">
      <span className="w-44 text-xs font-semibold text-gray-500 uppercase shrink-0">{label}</span>
      <span className="text-sm text-gray-900">{value}</span>
    </div>
  );
}

export default function FolioTemplate({ folio, parties, properties }: Props) {
  return (
    <div className="folio-content">
      {/* Header */}
      <div className="bg-gradient-to-r from-maroon-900 to-maroon-700 -mx-6 -mt-6 px-6 py-5 mb-6 rounded-t-xl">
        <div className="text-[11px] font-medium text-maroon-200 uppercase tracking-wider">
          Registrar General's Department — Sri Lanka
        </div>
        <h2 className="text-lg font-bold text-white mt-1">Trust Deed Folio</h2>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-2xl font-bold text-white font-mono">
            {folio.volumeNumber ? `${folio.volumeNumber}/${folio.folioNumber || '-'}` : folio.folioNumber || '-'}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/20 text-white">
            {folio.trustType}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/20 text-white">
            {folio.folioType}
          </span>
        </div>
      </div>

      {/* Main Info Grid */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-1 mb-6">
        <DetailRow label="Land Registry" value={folio.registryName || '-'} />
        <DetailRow label="Registry Code" value={folio.registryCode || '-'} />
        <DetailRow label="Daybook Number" value={folio.daybookNumber || '-'} />
        <DetailRow label="Year" value={String(folio.year || '-')} />
        <DetailRow label="Folio Number" value={`${folio.volumeNumber || '-'}/${folio.folioNumber || '-'}${folio.broughtForwardVolume ? ' (b/f)' : ''}`} />
        {folio.broughtForwardVolume && (
          <DetailRow label="Brought Forward From" value={`${folio.broughtForwardVolume}/${folio.broughtForwardFolio || ''}`} />
        )}
        <DetailRow label="Category" value={folio.trustCategory} />
      </div>

      {/* Trust Details */}
      <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3 pb-1.5 border-b border-gray-200">
        Trust Details
      </h3>
      <div className="grid grid-cols-2 gap-x-8 gap-y-1 mb-6">
        <DetailRow label="Trust Name" value={folio.trustName || '-'} />
        <DetailRow label="Trust Address" value={folio.trustAddress || '-'} />
        <DetailRow label="Purpose" value={folio.trustPurpose || '-'} />
        <DetailRow label="Notary" value={folio.notaryName || '-'} />
        <DetailRow label="Deed Number" value={folio.deedNumber || '-'} />
        <DetailRow label="Attest Date" value={folio.attestedDate || '-'} />
      </div>

      {/* Parties */}
      {parties && parties.length > 0 && (
        <>
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3 pb-1.5 border-b border-gray-200">
            Parties
          </h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-y border-gray-200">
                  <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-500 uppercase">Role</th>
                  <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-500 uppercase">Type</th>
                  <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-500 uppercase">Name</th>
                  <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-500 uppercase">ID Number</th>
                  <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {parties.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50">
                    <td className="px-3 py-2 text-gray-900">{p.partyRole}</td>
                    <td className="px-3 py-2 text-gray-600">{p.partyType}</td>
                    <td className="px-3 py-2 font-medium text-gray-900">{p.fullName || '-'}</td>
                    <td className="px-3 py-2 text-gray-600 font-mono text-xs">{p.idNumber || '-'}</td>
                    <td className="px-3 py-2">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                        p.verificationStatus === 'VERIFIED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {p.verificationStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Properties */}
      {properties && properties.length > 0 && (
        <>
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3 pb-1.5 border-b border-gray-200">
            Properties
          </h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-y border-gray-200">
                  <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-500 uppercase">Type</th>
                  <th className="px-3 py-2 text-right text-[11px] font-semibold text-gray-500 uppercase">Amount (LKR)</th>
                  <th className="px-3 py-2 text-right text-[11px] font-semibold text-gray-500 uppercase">Value (LKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {properties.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50">
                    <td className="px-3 py-2 text-gray-900">{p.propertyType}</td>
                    <td className="px-3 py-2 text-right font-mono text-gray-900">
                      {p.amount != null ? p.amount.toLocaleString() : '-'}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-gray-900">
                      {p.propertyValue != null ? p.propertyValue.toLocaleString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Registrar Signature & Seal */}
      {folio.signatureAppliedAt && (
        <div className="mt-8 pt-5 border-t-2 border-gray-300 flex items-end justify-between gap-6 flex-wrap">
          <div>
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">
              Registrar Signature &amp; Seal
            </h4>
            <div className="space-y-1 text-sm text-gray-800">
              <p>
                <span className="text-gray-500 font-semibold">Confirmed By: </span>
                {folio.registrarVerifiedBy || 'Registrar'}
              </p>
              <p>
                <span className="text-gray-500 font-semibold">Verification: </span>
                {folio.registrarVerificationType || folio.approvalStatus}
              </p>
              <p>
                <span className="text-gray-500 font-semibold">Signature Date: </span>
                {new Date(folio.signatureAppliedAt).toLocaleDateString('en-GB')}
              </p>
              {folio.sealAppliedAt && (
                <p>
                  <span className="text-gray-500 font-semibold">Sealed Date: </span>
                  {new Date(folio.sealAppliedAt).toLocaleDateString('en-GB')}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            {folio.sealType === 'RED' && folio.sealAppliedAt ? (
              <>
                <div className="w-24 h-24 rounded-full border-4 border-red-600 flex items-center justify-center -rotate-12 opacity-90">
                  <div className="text-center leading-tight">
                    <span className="block text-red-700 font-bold text-xs">REJECTED</span>
                    <span className="block text-red-700 text-[9px] font-semibold mt-0.5">Land Registry</span>
                    <span className="block text-red-700 text-[8px] tracking-wide mt-0.5">TRUST REGISTRATION</span>
                  </div>
                </div>
                <span className="text-[10px] text-gray-400 font-medium">REJECTED SEAL</span>
              </>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <div className="px-3 py-1 border-2 border-green-600 -rotate-6 text-green-700 font-bold text-sm tracking-widest uppercase opacity-90">
                  Registered
                </div>
                <span className="text-[10px] text-gray-400 font-medium">REGISTERED STAMP</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status & Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span>Created by: {folio.createdByName || 'System'}</span>
          <span>Date: {folio.createdAt ? new Date(folio.createdAt).toLocaleDateString('en-GB') : '-'}</span>
        </div>
        {folio.remarks && <span className="italic">"{folio.remarks}"</span>}
      </div>
    </div>
  );
}
