import type { Folio, Party, Property } from '../../types';

interface Props {
  folio: Folio;
  parties?: Party[];
  properties?: Property[];
}

const REGISTERED_FAMILY = ['REGISTERED', 'READY_FOR_HANDOVER', 'HANDED_OVER'];

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 py-2 border-b border-dotted border-slate-300 last:border-0">
      <span className="w-40 text-[11px] font-semibold uppercase tracking-wide text-slate-500 shrink-0">{label}</span>
      <span className="text-sm text-slate-900">{value}</span>
    </div>
  );
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '-';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '-' : d.toLocaleDateString('en-GB');
}

export default function FolioTemplate({ folio, parties, properties }: Props) {
  const status = folio.approvalStatus;
  const isRegistered = REGISTERED_FAMILY.includes(status);
  const isRejected = status === 'REJECTED';
  const showVerification = (isRegistered || isRejected) && Boolean(folio.signatureAppliedAt);

  return (
    <div className="folio-content">
      {/* Official Register Header */}
      <div className="text-center border-b-4 border-double border-maroon-900 pb-4 mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-maroon-900">
          Registrar General's Department &mdash; Sri Lanka
        </p>
        <h2 className="text-xl font-serif font-bold text-slate-900 mt-1 tracking-wide">
          Register of Trust Deeds
        </h2>
        <div className="mx-auto mt-3 max-w-2xl grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Reference</div>
            <div className="text-sm font-mono font-bold text-slate-900">
              {folio.volumeNumber && folio.folioNumber
                ? `${folio.volumeNumber}/${folio.folioNumber}`
                : folio.folioNumber || 'PENDING'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Registry</div>
            <div className="text-sm font-semibold text-slate-900">{folio.registryCode || folio.registryName || '-'}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Daybook</div>
            <div className="text-sm font-semibold text-slate-900">{folio.daybookNumber || '-'}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Year</div>
            <div className="text-sm font-semibold text-slate-900">{String(folio.year || '-')}</div>
          </div>
        </div>
      </div>

      {/* Two-Page Spread (one logical folio = two physical pages) */}
      <div className="folio-spread grid md:grid-cols-2 border border-slate-300 shadow-sm print:shadow-none">
        {/* Page 1 — Folio Reference & Trust */}
        <section className="folio-page p-6">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-maroon-900 pb-2 border-b-2 border-slate-300 mb-4">
            Page 1 &middot; Folio Reference &amp; Trust
          </h3>

          <div className="mb-5">
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Registry &amp; Reference</h4>
            <DetailRow label="Land Registry" value={folio.registryName || '-'} />
            <DetailRow label="Registry Code" value={folio.registryCode || '-'} />
            <DetailRow label="Folio Number" value={`${folio.volumeNumber || '-'}/${folio.folioNumber || '-'}${folio.broughtForwardVolume ? ' (b/f)' : ''}`} />
            {folio.broughtForwardVolume && (
              <DetailRow label="Brought Forward From" value={`${folio.broughtForwardVolume}/${folio.broughtForwardFolio || ''}`} />
            )}
            <DetailRow label="Category" value={folio.trustCategory} />
            <DetailRow label="Folio Type" value={folio.folioType} />
          </div>

          <div className="mb-5">
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Trust Details</h4>
            <DetailRow label="Trust Name" value={folio.trustName || '-'} />
            <DetailRow label="Trust Address" value={folio.trustAddress || '-'} />
            <DetailRow label="Purpose" value={folio.trustPurpose || '-'} />
          </div>

          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Deed &amp; Notary</h4>
            <DetailRow label="Notary" value={folio.notaryName || '-'} />
            <DetailRow label="Deed Number" value={folio.deedNumber || '-'} />
            <DetailRow label="Attest Date" value={formatDate(folio.attestedDate)} />
          </div>
        </section>

        {/* Page 2 — Schedule of Parties & Property */}
        <section className="folio-page p-6 border-t border-slate-300 md:border-t-0 md:border-l">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-maroon-900 pb-2 border-b-2 border-slate-300 mb-4">
            Page 2 &middot; Schedule of Parties &amp; Property
          </h3>

          {parties && parties.length > 0 ? (
            <div className="mb-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-300">
                    <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-slate-500 uppercase">Role</th>
                    <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-slate-500 uppercase">Type</th>
                    <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-slate-500 uppercase">Name</th>
                    <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-slate-500 uppercase">ID Number</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dotted divide-slate-300">
                  {parties.map((p) => (
                    <tr key={p.id}>
                      <td className="px-2 py-1.5 text-slate-900">{p.partyRole}</td>
                      <td className="px-2 py-1.5 text-slate-600">{p.partyType}</td>
                      <td className="px-2 py-1.5 font-medium text-slate-900">{p.fullName || '-'}</td>
                      <td className="px-2 py-1.5 text-slate-600 font-mono text-xs">{p.idNumber || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic mb-6">No parties recorded.</p>
          )}

          {properties && properties.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-300">
                    <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-slate-500 uppercase">Type</th>
                    <th className="px-2 py-1.5 text-right text-[10px] font-semibold text-slate-500 uppercase">Amount (LKR)</th>
                    <th className="px-2 py-1.5 text-right text-[10px] font-semibold text-slate-500 uppercase">Value (LKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dotted divide-slate-300">
                  {properties.map((p) => (
                    <tr key={p.id}>
                      <td className="px-2 py-1.5 text-slate-900">{p.propertyType}</td>
                      <td className="px-2 py-1.5 text-right font-mono text-slate-900">
                        {p.amount != null ? p.amount.toLocaleString() : '-'}
                      </td>
                      <td className="px-2 py-1.5 text-right font-mono text-slate-900">
                        {p.propertyValue != null ? p.propertyValue.toLocaleString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">No properties recorded.</p>
          )}
        </section>
      </div>

      {/* Registrar Verification */}
      {showVerification && (
        <div className="folio-verification mt-6 border border-double border-maroon-900 bg-maroon-50/30 rounded-sm overflow-hidden print:break-inside-avoid">
          <div className="px-6 py-2 bg-maroon-900">
            <h3 className="text-xs font-serif font-bold uppercase tracking-[0.15em] text-white">
              Registrar Verification
            </h3>
          </div>
          <div className="p-6 flex items-stretch justify-between gap-6 flex-wrap">
            <div className="space-y-1.5 text-sm text-slate-800">
              <p>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Confirmed By: </span>
                {folio.registrarVerifiedBy || 'Registrar'}
              </p>
              <p>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Verification: </span>
                {folio.registrarVerificationType || status}
              </p>
              <p>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Signature Date: </span>
                {formatDate(folio.signatureAppliedAt)}
              </p>
            </div>

            <div className="flex items-end gap-8">
              {folio.registrarSignatureId ? (
                <div className="flex flex-col items-center gap-1">
                  <img
                    src={`/signature/${folio.registrarSignatureId}/file`}
                    alt="Registrar signature"
                    className="h-16 object-contain"
                  />
                  <span className="text-[10px] text-slate-500 font-medium">
                    Registrar's Signature
                  </span>
                </div>
              ) : (
                <div className="text-2xl font-serif italic text-slate-400 leading-none">&#120394;</div>
              )}

              {isRejected && (
                <div className="flex flex-col items-center gap-1">
                  <div className="w-24 h-24 rounded-full border-4 border-red-600 flex items-center justify-center -rotate-12 opacity-90">
                    <div className="text-center leading-tight">
                      <span className="block text-red-700 font-bold text-xs">REJECTED</span>
                      <span className="block text-red-700 text-[9px] font-semibold mt-0.5">Land Registry</span>
                      <span className="block text-red-700 text-[8px] tracking-wide mt-0.5">TRUST REGISTRATION</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">REJECTED SEAL</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Status & Footer */}
      <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span>Recorded by: {folio.createdByName || 'System'}</span>
          <span>Record date: {formatDate(folio.createdAt)}</span>
        </div>
        {folio.remarks && <span className="italic">"{folio.remarks}"</span>}
      </div>
    </div>
  );
}