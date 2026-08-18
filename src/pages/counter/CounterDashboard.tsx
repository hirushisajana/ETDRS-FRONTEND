import { useQuery } from '@tanstack/react-query';
import { daybookApi } from '../../api';
import { StatusBadge, LoadingSpinner } from '../../components/shared';
import { useAuth } from '../../contexts';
import type { DaybookEntry } from '../../types';

interface DashboardProps {
  onViewEntry: (entry: DaybookEntry) => void;
}

const cards = [
  {
    label: 'Total Requests (YTD)',
    accent: 'border-l-maroon-700',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    iconBg: 'bg-maroon-50 text-maroon-700',
  },
  {
    label: 'One-Day Services',
    accent: 'border-l-blue-600',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    iconBg: 'bg-blue-50 text-blue-700',
  },
  {
    label: 'General Services',
    accent: 'border-l-emerald-600',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
    iconBg: 'bg-emerald-50 text-emerald-700',
  },
  {
    label: 'Next Daybook Numbers',
    accent: 'border-l-slate-600',
    icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
    iconBg: 'bg-slate-100 text-slate-700',
  },
];

export default function CounterDashboard({ onViewEntry }: DashboardProps) {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();

  const { data: expressNext } = useQuery({
    queryKey: ['next-number', 'EXPRESS'],
    queryFn: () => daybookApi.getNextNumber('EXPRESS'),
    staleTime: 60_000,
  });

  const { data: normalNext } = useQuery({
    queryKey: ['next-number', 'NORMAL'],
    queryFn: () => daybookApi.getNextNumber('NORMAL'),
    staleTime: 60_000,
  });

  const { data: yearlyEntries, isLoading } = useQuery({
    queryKey: ['daybook', 'by-year', currentYear],
    queryFn: () => daybookApi.getByYear(currentYear),
    placeholderData: (prev) => prev,
  });

  const entries = yearlyEntries || [];
  const oneDayCount = entries.filter((e) => e.serviceType === 'ONE_DAY').length;
  const generalCount = entries.filter((e) => e.serviceType === 'GENERAL').length;
  const totalCount = entries.length;

  const pendingCorrectionEntries = entries.filter(
    (e) => e.status === 'PENDING_CORRECTION'
  );

  const statValues = [
    totalCount,
    oneDayCount,
    generalCount,
    null, // next numbers are special
  ];

  return (
    <div className="space-y-5">
      {/* Registry Header */}
      {user?.registryName && (
        <div className="flex items-center gap-2 px-1">
          <div className="w-6 h-6 rounded-md bg-maroon-100 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-maroon-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-gray-800">{user.registryName}</span>
          <span className="text-xs text-gray-400">| Counter Dashboard</span>
        </div>
      )}
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <div
            key={card.label}
            className={`bg-white rounded-xl border border-gray-200 border-l-[3px] ${card.accent} p-5 shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">
                {card.label}
              </p>
              <div className={`p-2 rounded-lg ${card.iconBg} shrink-0 ml-2`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 tabular-nums">
              {statValues[i] !== null ? statValues[i] : (
                <span className="flex items-center gap-2 text-base">
                  <span className="font-mono bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                    E: <span className="text-maroon-700 font-semibold">{expressNext?.split('/').pop() ?? '...'}</span>
                  </span>
                  <span className="font-mono bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                    N: <span className="text-slate-700 font-semibold">{normalNext?.split('/').pop() ?? '...'}</span>
                  </span>
                </span>
              )}
            </p>
          </div>
        ))}
      </div>

      {/* Re-submission Alerts */}
      {pendingCorrectionEntries.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-orange-50 overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 bg-red-100/50 border-b border-red-200">
            <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-red-800">
                {pendingCorrectionEntries.length} Re-submission{pendingCorrectionEntries.length > 1 ? 's' : ''} Required
              </p>
              <p className="text-xs text-red-600">
                {pendingCorrectionEntries.length === 1 ? 'This entry' : 'These entries'} require re-submission to proceed
              </p>
            </div>
          </div>
          <div className="divide-y divide-red-100">
            {pendingCorrectionEntries.map((e) => (
              <div key={e.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50/50 transition-colors">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-mono text-gray-800">{e.daybookNumber}</span>
                  <span className="text-sm text-gray-500 ml-2">— {e.clientName ?? 'N/A'}</span>
                </div>
                <StatusBadge status={e.status} />
                <button
                  onClick={() => onViewEntry(e)}
                  className="text-xs font-medium text-maroon-700 hover:text-maroon-800 underline shrink-0"
                >
                  Re-submit
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoading && <LoadingSpinner />}
    </div>
  );
}
