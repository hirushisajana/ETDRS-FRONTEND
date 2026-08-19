import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { daybookApi } from '../../api';
import { useAuth } from '../../contexts';
import { LoadingSpinner, EmptyState, StatusBadge } from '../../components/shared';
import type { DaybookEntry, DaybookEntryStatus, TrustType } from '../../types';

type TypeFilter = 'All' | TrustType;
type StatusFilter = 'All' | DaybookEntryStatus;

const STATUS_OPTIONS: DaybookEntryStatus[] = [
  'PENDING',
  'DAYBOOK_ENTERED',
  'FOLIO_CREATED',
  'FOLIO_SUBMITTED',
  'SCAN_UPLOADED',
  'PENDING_REGISTRAR_VERIFICATION',
  'REPORTED_PENDING_VERIFICATION',
  'REJECTED_PENDING_VERIFICATION',
  'REGISTERED',
  'REJECTED',
  'REPORTED',
  'PENDING_CORRECTION',
  'READY_FOR_HANDOVER',
  'HANDED_OVER',
  'SUPERSEDED',
  'SUSPICIOUS_FLAGGED',
];

function statusHint(status: DaybookEntryStatus): string | null {
  switch (status) {
    case 'REGISTERED': return 'Registered';
    case 'READY_FOR_HANDOVER': return 'Ready for handover';
    case 'HANDED_OVER': return 'Handed over';
    case 'REJECTED': return 'Rejected';
    case 'REPORTED': return 'Reported';
    case 'SUPERSEDED': return 'Superseded';
    case 'SUSPICIOUS_FLAGGED': return 'Flagged';
    default: return null;
  }
}

function money(value: number | null | undefined): string {
  return value != null ? `Rs ${value.toLocaleString()}` : '-';
}

const HEADERS: { key: string; label: string }[] = [
  { key: 'index', label: '#' },
  { key: 'daybookNumber', label: 'Day Book #' },
  { key: 'deedType', label: 'Deed Type' },
  { key: 'deedNumber', label: 'Deed #' },
  { key: 'submitterName', label: 'Submitter' },
  { key: 'notaryName', label: 'Notary' },
  { key: 'clientName', label: 'Client' },
  { key: 'valueOfAmount', label: 'Value (Rs)' },
  { key: 'division', label: 'Division' },
  { key: 'volume', label: 'Volume' },
  { key: 'folioRef', label: 'Folio Ref' },
  { key: 'serviceType', label: 'Service' },
  { key: 'registrationFee', label: 'Fee (Rs)' },
  { key: 'status', label: 'Status' },
];

const COLUMN_COUNT = HEADERS.length;

export default function DaybookListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('All');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');

  const { data: entries, isLoading } = useQuery({
    queryKey: ['daybook', 'by-year', year],
    queryFn: () => daybookApi.getByYear(year),
    placeholderData: (prev) => prev,
  });

  const filtered = (entries || []).filter((e) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || Object.values(e).some((v) =>
      v != null && String(v).toLowerCase().includes(q)
    );
    const matchesType = typeFilter === 'All' || e.trustType === typeFilter;
    const matchesStatus = statusFilter === 'All' || e.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const groups: { type: TrustType; label: string; rows: DaybookEntry[] }[] = [
    { type: 'EXPRESS', label: 'Book I — Express Trusts', rows: [] },
    { type: 'NORMAL', label: 'Book II — Normal Trusts', rows: [] },
  ];
  for (const group of groups) {
    group.rows = filtered.filter((e) => e.trustType === group.type);
  }

  let runningNumber = 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Toolbar */}
      <div className="no-print flex items-center justify-between flex-wrap gap-3 mb-4">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Digital Day Book &mdash; Register</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Official register of day book entries by year &middot; {user?.registryName || 'All registries'}
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-maroon-700 bg-maroon-50 border border-maroon-200 rounded-xl hover:bg-maroon-100 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
          </svg>
          Print Register
        </button>
      </div>

      {/* Filters */}
      <div className="no-print flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 font-medium">Year:</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value) || currentYear)}
            className="w-24 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-maroon-600 focus:border-maroon-600"
          />
        </div>
        <input
          placeholder="Search any field..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[180px] px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-maroon-600 focus:border-maroon-600"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
          className="w-36 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-maroon-600 focus:border-maroon-600"
        >
          <option value="All">All Types</option>
          <option value="EXPRESS">Express Trust</option>
          <option value="NORMAL">Normal Trust</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="w-44 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-maroon-600 focus:border-maroon-600"
        >
          <option value="All">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <span className="text-sm text-gray-400">{filtered.length} entries</span>
      </div>

      {/* Register Sheet */}
      {isLoading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <EmptyState message={`No daybook entries found for ${year}`} />
      ) : (
        <div className="daybook-register bg-white border border-slate-300 rounded-sm shadow-sm print:shadow-none print:border-0 overflow-hidden">
          {/* Official Register Header */}
          <div className="text-center border-b-4 border-double border-maroon-900 px-6 pt-7 pb-4 print:pt-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-maroon-900">
              Registrar General's Department &mdash; Sri Lanka
            </p>
            <h2 className="text-xl font-serif font-bold text-slate-900 mt-1 tracking-wide">
              Day Book &mdash; Register of Entries
            </h2>
            <p className="text-xs text-slate-500 mt-1.5">
              Year {year} &middot; {user?.registryName || 'All Registries'}
            </p>
          </div>

          {/* Scrollable Register Table */}
          <div className="max-h-[70vh] overflow-auto print:max-h-none print:overflow-visible">
            <table className="w-full min-w-[1150px] text-sm border-collapse">
              <thead>
                <tr className="sticky top-0 z-20 bg-maroon-900">
                  {HEADERS.map((col) => (
                    <th
                      key={col.key}
                      className="border border-slate-600/40 px-2.5 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-white whitespace-nowrap"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => (
                  <GroupRows
                    key={group.type}
                    group={group}
                    getNumber={() => { runningNumber += 1; return runningNumber; }}
                    onSelect={(entry) => navigate(`/daybook/${entry.id}`)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Register Footer */}
          <div className="px-6 py-3 border-t-2 border-double border-maroon-900 text-xs text-slate-500 flex items-center justify-between flex-wrap gap-2">
            <span>
              Register of {year} &middot; {filtered.length} entries &middot; {user?.registryName || 'All Registries'}
            </span>
            <span>Generated by Trust Registration System</span>
          </div>
        </div>
      )}
    </div>
  );
}

function GroupRows({
  group,
  getNumber,
  onSelect,
}: {
  group: { type: TrustType; label: string; rows: DaybookEntry[] };
  getNumber: () => number;
  onSelect: (entry: DaybookEntry) => void;
}) {
  return (
    <>
      <tr className="sticky top-[38px] z-10 bg-maroon-50">
        <td colSpan={COLUMN_COUNT} className="border border-slate-500/40 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-maroon-900">
          {group.label}
          {group.rows.length === 0 && ' — no entries'}
        </td>
      </tr>
      {group.rows.map((entry) => {
        const hint = statusHint(entry.status);
        return (
          <tr
            key={entry.id}
            onClick={() => onSelect(entry)}
            className="cursor-pointer transition-colors hover:bg-maroon-50/40"
          >
            <td className="border border-slate-300 px-2.5 py-2 text-center text-xs font-semibold text-slate-500 tabular-nums">
              {getNumber()}
            </td>
            <td className="border border-slate-300 px-2.5 py-2 font-mono text-xs font-semibold text-slate-900 whitespace-nowrap">
              {entry.daybookNumber}
            </td>
            <td className="border border-slate-300 px-2.5 py-2 text-slate-700 whitespace-nowrap">{entry.deedType || '-'}</td>
            <td className="border border-slate-300 px-2.5 py-2 text-slate-700 whitespace-nowrap">{entry.deedNumber || '-'}</td>
            <td className="border border-slate-300 px-2.5 py-2 text-slate-700 whitespace-nowrap">{entry.submitterName || '-'}</td>
            <td className="border border-slate-300 px-2.5 py-2 text-slate-700 whitespace-nowrap">{entry.notaryName || '-'}</td>
            <td className="border border-slate-300 px-2.5 py-2 text-slate-700 whitespace-nowrap">{entry.clientName || '-'}</td>
            <td className="border border-slate-300 px-2.5 py-2 text-right text-slate-700 tabular-nums whitespace-nowrap">{money(entry.valueOfAmount)}</td>
            <td className="border border-slate-300 px-2.5 py-2 text-slate-700 whitespace-nowrap">{entry.division || '-'}</td>
            <td className="border border-slate-300 px-2.5 py-2 text-slate-700 whitespace-nowrap">{entry.volume || '-'}</td>
            <td className="border border-slate-300 px-2.5 py-2 text-slate-700 whitespace-nowrap">{entry.folioRef || '-'}</td>
            <td className="border border-slate-300 px-2.5 py-2 text-slate-700 whitespace-nowrap">{entry.serviceType || '-'}</td>
            <td className="border border-slate-300 px-2.5 py-2 text-right text-slate-700 tabular-nums whitespace-nowrap">{money(entry.registrationFee)}</td>
            <td className="border border-slate-300 px-2.5 py-2 whitespace-nowrap">
              <div className="flex flex-col gap-0.5">
                <StatusBadge status={entry.status} />
                {hint && <span className="text-[10px] text-slate-500">{hint}</span>}
              </div>
            </td>
          </tr>
        );
      })}
    </>
  );
}