import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { scanApi, folioApi } from '../../api';
import { LoadingSpinner, StatusBadge } from '../../components/shared';

export default function DeedViewerPage() {
  const { folioId: folioIdParam } = useParams();
  const navigate = useNavigate();
  const folioId = Number(folioIdParam);
  const [pdfState, setPdfState] = useState<{ id: number; url: string | null; error: boolean }>({ id: 0, url: null, error: false });

  const { data: folio, isLoading: folioLoading } = useQuery({
    queryKey: ['folio', folioId],
    queryFn: () => folioApi.getById(folioId),
    enabled: !!folioId,
  });

  useEffect(() => {
    if (!folioId) return;
    let cancelled = false;
    scanApi.getDeedFile(folioId)
      .then((blob) => {
        if (!cancelled) setPdfState({ id: folioId, url: URL.createObjectURL(blob), error: false });
      })
      .catch(() => {
        if (!cancelled) setPdfState({ id: folioId, url: null, error: true });
      });
    return () => { cancelled = true; };
  }, [folioId]);

  const pdfStale = pdfState.id !== folioId;
  const pdfUrl = pdfStale ? null : pdfState.url;
  const pdfLoading = pdfStale || (!pdfState.url && !pdfState.error);
  const pdfError = !pdfStale && pdfState.error;

  useEffect(() => {
    return () => { if (pdfUrl) URL.revokeObjectURL(pdfUrl); };
  }, [pdfUrl]);

  const handleDownload = () => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `deed-${folio?.daybookNumber || folioId}.pdf`;
    a.click();
  };

  if (folioLoading) return <LoadingSpinner />;

  return (
    <div className="p-6 lg:p-8 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              Deed Viewer — {folio?.daybookNumber || `Folio #${folioId}`}
            </h1>
            <p className="text-sm text-gray-500">
              {folio?.trustName || 'Untitled'} &middot; {folio?.trustType}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {folio && <StatusBadge status={folio.approvalStatus} />}
          {pdfUrl && (
            <>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Download
              </button>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-maroon-700 bg-maroon-50 border border-maroon-200 rounded-lg hover:bg-maroon-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
                Open in new tab
              </a>
            </>
          )}
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 bg-gray-100 rounded-xl border border-gray-200 overflow-hidden min-h-0">
        {pdfLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <LoadingSpinner />
              <p className="text-sm text-gray-500 mt-2">Loading deed document...</p>
            </div>
          </div>
        ) : pdfUrl ? (
          <embed src={pdfUrl} type="application/pdf" className="w-full h-full" />
        ) : pdfError ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">No deed document available</h3>
              <p className="text-xs text-gray-500">
                {folio?.hasScan === false
                  ? 'This folio has no scan uploaded yet. Please contact the scan user.'
                  : 'The deed document could not be loaded. It may not have been uploaded yet.'}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
