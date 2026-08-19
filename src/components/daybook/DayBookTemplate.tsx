import type { DaybookEntry } from '../../types';
import { StatusBadge } from '../shared';

interface Props {
  entry: DaybookEntry;
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '-';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '-' : d.toLocaleDateString('en-GB');
}

function formatMoney(value: number | null | undefined): string {
  return value != null ? `Rs ${value.toLocaleString()}` : '-';
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 py-2 border-b border-dotted border-slate-300 last:border-0">
      <span className="w-40 text-[11px] font-semibold uppercase tracking-wide text-slate-500 shrink-0">{label}</span>
      <span className="text-sm text-slate-900">{value}</span>
    </div>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">{children}</h4>
  );
}

function statusHint(status: DaybookEntry['status']): string | null {
  switch (status) {
    case 'PENDING': return 'Awaiting day book entry';
    case 'DAYBOOK_ENTERED': return 'Day book data entered — folio being prepared';
    case 'FOLIO_CREATED': return 'Folio created';
    case 'FOLIO_SUBMITTED': return 'Submitted for registrar review';
    case 'SCAN_UPLOADED': return 'Deed scan uploaded';
    case 'PENDING_REGISTRAR_VERIFICATION': return 'Awaiting registrar verification';
    case 'REPORTED_PENDING_VERIFICATION': return 'Reported — awaiting registrar verification';
    case 'REJECTED_PENDING_VERIFICATION': return 'Rejection pending verification';
    case 'REGISTERED': return 'Registered';
    case 'REJECTED': return 'Rejected';
    case 'REPORTED': return 'Reported';
    case 'PENDING_CORRECTION': return 'Returned for correction';
    case 'READY_FOR_HANDOVER': return 'Ready for handover';
    case 'HANDED_OVER': return 'Handed over';
    case 'SUPERSEDED': return 'Superseded by quarterly update';
    case 'SUSPICIOUS_FLAGGED': return 'Flagged — not registered';
    default: return null;
  }
}

export default function DayBookTemplate({ entry }: Props) {
  const hint = statusHint(entry.status);
  const received = entry.createdAt
    ? new Date(entry.createdAt).toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short' })
    : '-';

  return (
    <div className="daybook-content daybook-print daybook-entry">
      {/* Official Register Header */}
      <div className="text-center border-b-4 border-double border-maroon-900 pb-4 mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-maroon-900">
          Registrar General's Department &mdash; Sri Lanka
        </p>
        <h2 className="text-xl font-serif font-bold text-slate-900 mt-1 tracking-wide">Day Book of Entries</h2>
        <div className="mx-auto mt-3 max-w-3xl grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Day Book #</div>
            <div className="text-sm font-mono font-bold text-slate-900">{entry.daybookNumber || '-'}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Type</div>
            <div className="text-sm font-semibold text-slate-900">{entry.trustType}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Category</div>
            <div className="text-sm font-semibold text-slate-900">{entry.trustCategory}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Year</div>
            <div className="text-sm font-semibold text-slate-900">{String(entry.year)}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Status</div>
            <div className="mt-0.5 inline-flex"><StatusBadge status={entry.status} /></div>
          </div>
        </div>
      </div>

      {/* Status Strip */}
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap border border-maroon-900 bg-maroon-50/30 px-4 py-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Entry Status</div>
          <div className="mt-1 flex items-center gap-2">
            <StatusBadge status={entry.status} />
            {hint && <span className="text-xs text-slate-600">{hint}</span>}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Date &amp; Time of Receipt</div>
          <div className="text-sm font-medium text-slate-900 mt-1">{received}</div>
        </div>
      </div>

      {/* Two-Page Spread (one logical Day Book entry = two physical pages) */}
      <div className="grid md:grid-cols-2 border border-slate-300 shadow-sm print:shadow-none">
        {/* Page 1 — Registry, Client & Deed */}
        <section className="p-6">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-maroon-900 pb-2 border-b-2 border-slate-300 mb-4">
            Page 1 &middot; Registry, Client &amp; Deed
          </h3>

          <div className="mb-5">
            <SectionTitle>Registry &amp; Receipt</SectionTitle>
            <Row label="Day Book Number" value={entry.daybookNumber || '-'} />
            <Row label="Entry Type" value={entry.entryType} />
            <Row label="Service Type" value={entry.serviceType || '-'} />
            <Row label="Receipt Delivery" value={entry.receiptDelivery || '-'} />
            {entry.originalDaybookNumber && (
              <Row label="Original Day Book" value={entry.originalDaybookNumber} />
            )}
            {entry.quarterlyUpdateNumber != null && (
              <Row label="Quarterly Update #" value={String(entry.quarterlyUpdateNumber)} />
            )}
          </div>

          <div className="mb-5">
            <SectionTitle>Client &amp; Submitter</SectionTitle>
            <Row label="Client Name" value={entry.clientName || '-'} />
            <Row label="Client Email" value={entry.clientEmail || '-'} />
            <Row label="Client Telephone" value={entry.clientTelephone || '-'} />
            <Row label="Submitter Name" value={entry.submitterName || '-'} />
            <Row label="Submitter Address" value={entry.submitterAddress || '-'} />
          </div>

          <div>
            <SectionTitle>Deed &amp; Notary</SectionTitle>
            <Row label="Deed Type" value={entry.deedType || '-'} />
            <Row label="Deed Number" value={entry.deedNumber || '-'} />
            <Row label="Attested Date" value={formatDate(entry.attestedDate)} />
            <Row label="Language" value={entry.language || '-'} />
            <Row label="Notary" value={entry.notaryName || '-'} />
          </div>
        </section>

        {/* Page 2 — Financial, Reference & Completion */}
        <section className="p-6 border-t border-slate-300 md:border-t-0 md:border-l">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-maroon-900 pb-2 border-b-2 border-slate-300 mb-4">
            Page 2 &middot; Financial, Reference &amp; Completion
          </h3>

          <div className="mb-5">
            <SectionTitle>Financial Details</SectionTitle>
            <Row label="Value of Amount" value={formatMoney(entry.valueOfAmount)} />
            <Row label="Number of Lots" value={entry.numberOfLots != null ? String(entry.numberOfLots) : '-'} />
            <Row label="Registration Fee" value={formatMoney(entry.registrationFee)} />
          </div>

          <div className="mb-5">
            <SectionTitle>Division, Volume &amp; Folio Reference</SectionTitle>
            <Row label="Division" value={entry.division || '-'} />
            <Row label="Volume" value={entry.volume || '-'} />
            <Row label="Folio Reference" value={entry.folioRef || '-'} />
            {entry.folioRejectionReason && (
              <Row label="Rejection Reason" value={entry.folioRejectionReason} />
            )}
          </div>

          <div>
            <SectionTitle>Completion Details</SectionTitle>
            <Row label="Return Date" value={formatDate(entry.returnDate)} />
            <Row label="Acceptor Signature" value={entry.acceptorSignature || '-'} />
            <Row label="Acceptor Date" value={formatDate(entry.acceptorDate)} />
            <Row label="Registrar / Clerk Initials" value={entry.registrarInitials || '-'} />
          </div>

          {entry.remarks && (
            <div className="mt-5">
              <SectionTitle>Remarks</SectionTitle>
              <p className="text-sm text-slate-700 italic">"{entry.remarks}"</p>
            </div>
          )}
        </section>
      </div>

      {/* Status & Footer */}
      <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span>Recorded by: {entry.createdByName || 'System'}</span>
          <span>Record date: {formatDate(entry.createdAt)}</span>
        </div>
        <span>Last updated: {formatDate(entry.updatedAt)}</span>
      </div>
    </div>
  );
}