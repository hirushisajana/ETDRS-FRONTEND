import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { daybookApi } from '../../api';
import { LoadingSpinner, StatusBadge } from '../../components/shared';
import DayBookTemplate from '../../components/daybook/DayBookTemplate';

export default function DaybookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: entry, isLoading } = useQuery({
    queryKey: ['daybook', 'detail', Number(id)],
    queryFn: () => daybookApi.getById(Number(id)),
    enabled: !!id,
  });

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) return <LoadingSpinner />;
  if (!entry) return <div className="p-6 text-red-600">Entry not found</div>;

  return (
    <div className="p-6 lg:p-8">
      {/* Action Bar */}
      <div className="no-print flex items-center justify-between flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Day Book Entry &mdash; {entry.daybookNumber}</h1>
            <p className="text-sm text-slate-500">
              {entry.trustType} &middot; {entry.trustCategory} &middot; Year {entry.year}
            </p>
          </div>
          <StatusBadge status={entry.status} />
        </div>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-maroon-700 bg-maroon-50 border border-maroon-200 rounded-xl hover:bg-maroon-100 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
          </svg>
          Print Entry
        </button>
      </div>

      {/* Day Book Entry Sheet */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden print:shadow-none print:border-0">
        <DayBookTemplate entry={entry} />
      </div>
    </div>
  );
}