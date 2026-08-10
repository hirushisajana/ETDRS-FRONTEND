import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { folioApi } from '../../api';
import { LoadingSpinner, StatusBadge } from '../../components/shared';
import type { Folio } from '../../types';

export default function FolioChainViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const folioId = Number(id);

  const { data: chain, isLoading } = useQuery({
    queryKey: ['folio', folioId, 'chain'],
    queryFn: () => folioApi.getChain(folioId),
  });

  if (isLoading) return <LoadingSpinner />;

  const folios: Folio[] = chain || [];

  return (
    <div className="p-6 lg:p-8 max-w-[900px]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-900">Folio Chain</h1>
          <p className="text-sm text-slate-500">
            {folios.length > 0
              ? `${folios.length} folio${folios.length > 1 ? 's' : ''} in chain`
              : 'No chain data available'}
          </p>
        </div>
      </div>

      {folios.length === 0 ? (
        <div className="py-20 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-50 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-500">No chain data</p>
          <p className="text-xs text-slate-400 mt-1">This folio has no linked entries in its chain</p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical connecting line */}
          <div className="absolute left-[31px] top-4 bottom-4 w-0.5 bg-slate-200" />

          {folios.map((folio, idx) => {
            const isOriginal = folio.folioType === 'ORIGINAL';
            return (
              <div key={folio.id} className="relative flex gap-5 pb-8 last:pb-0">
                {/* Timeline dot */}
                <div className="relative z-10 shrink-0">
                  <div
                    className={`w-[62px] h-[62px] rounded-full border-2 flex items-center justify-center bg-white ${
                      isOriginal
                        ? 'border-blue-500 shadow-md shadow-blue-500/25'
                        : 'border-amber-400 shadow-sm shadow-amber-200'
                    }`}
                  >
                    <span className={`text-[10px] font-bold text-center leading-tight ${isOriginal ? 'text-blue-700' : 'text-amber-700'}`}>
                      {isOriginal ? 'ORIG' : `Q${idx}`}
                    </span>
                  </div>
                </div>

                {/* Content card */}
                <div
                  onClick={() => navigate(`/folio/${folio.id}`)}
                  className="flex-1 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-slate-900">
                          {folio.daybookNumber}
                        </span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          isOriginal ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {folio.folioType}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{folio.trustName || 'Untitled'}</p>
                    </div>
                    <StatusBadge status={folio.approvalStatus} />
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400">Volume</span>
                      <p className="font-medium text-slate-700 mt-0.5">{folio.volumeNumber || '-'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Folio #</span>
                      <p className="font-medium text-slate-700 mt-0.5">{folio.folioNumber || '-'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Year</span>
                      <p className="font-medium text-slate-700 mt-0.5">{folio.year}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400">{folio.trustCategory}</span>
                    <span className="text-slate-400">
                      {folio.createdAt ? new Date(folio.createdAt).toLocaleDateString() : '-'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
