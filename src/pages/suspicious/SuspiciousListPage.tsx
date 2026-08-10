import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { suspiciousApi } from '../../api';
import { useAuth } from '../../contexts';
import { PageHeader, Card, DataTable, StatusBadge } from '../../components/shared';
import type { SuspiciousReport } from '../../types';
import { formatDateTime } from '../../lib/format';

export default function SuspiciousListPage() {
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<SuspiciousReport | null>(null);
  const [sendingDefence, setSendingDefence] = useState(false);
  const [sendingFiu, setSendingFiu] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const { data: reports, isLoading } = useQuery({
    queryKey: ['suspicious'],
    queryFn: () => suspiciousApi.getAll(),
  });

  const isSuperAdmin = hasRole('SUPER_ADMIN') || hasRole('IT_ADMIN');
  const isRegistryAdmin = hasRole('REGISTRY_ADMIN');

  const handleAcknowledge = async (id: number) => {
    try {
      await suspiciousApi.acknowledge(id);
      queryClient.invalidateQueries({ queryKey: ['suspicious'] });
    } catch (err) {
      console.error('Failed to acknowledge', err);
    }
  };

  const handleSendDefence = async (id: number) => {
    setSendingDefence(true);
    try {
      await suspiciousApi.sendToDefence(id);
      queryClient.invalidateQueries({ queryKey: ['suspicious'] });
    } catch {
      alert('Failed to send to Ministry of Defence');
    } finally {
      setSendingDefence(false);
    }
  };

  const handleSendFiu = async (id: number) => {
    setSendingFiu(true);
    try {
      await suspiciousApi.sendToFiu(id);
      queryClient.invalidateQueries({ queryKey: ['suspicious'] });
    } catch {
      alert('Failed to send to Central Bank FIU');
    } finally {
      setSendingFiu(false);
    }
  };

  const handleDownloadPdf = async (report: SuspiciousReport) => {
    setDownloading(true);
    try {
      const blob = await suspiciousApi.downloadPdf(report.id);
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `suspicious-report-${report.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Failed to download report PDF');
    } finally {
      setDownloading(false);
    }
  };

  const columns = [
    { key: 'id', header: 'Report #' },
    { key: 'trustName', header: 'Trust Name' },
    {
      key: 'reportedByName',
      header: isSuperAdmin ? 'Reporter Role' : 'Reported By',
      render: (item: SuspiciousReport) => isSuperAdmin ? 'Registry Staff' : item.reportedByName,
    },
    {
      key: 'concerns',
      header: 'Concerns',
      render: (item: SuspiciousReport) => {
        if (!item.concerns) return '—';
        const labels: Record<string, string> = {
          MONEY_LAUNDERING: 'ML',
          TERRORISM_FINANCING: 'TF',
          FRAUD: 'Fraud',
          IDENTITY_ISSUES: 'ID',
          OTHER: 'Other',
        };
        return item.concerns.split(', ').map((c) => labels[c] || c).join(', ');
      },
    },
    {
      key: 'reportStatus',
      header: 'Status',
      render: (item: SuspiciousReport) => <StatusBadge status={item.reportStatus} />,
    },
    {
      key: 'sentToDefence',
      header: 'Defence',
      render: (item: SuspiciousReport) => item.sentToDefence ? 'Yes' : '—',
    },
    {
      key: 'sentToFiu',
      header: 'FIU',
      render: (item: SuspiciousReport) => item.sentToFiu ? 'Yes' : '—',
    },
    {
      key: 'createdAt',
      header: 'Reported',
      render: (item: SuspiciousReport) => formatDateTime(item.createdAt),
    },
    {
      key: 'actions',
      header: '',
      render: (item: SuspiciousReport) => (
        <div className="flex items-center gap-1">
          <button className="btn btn-sm btn-ghost" onClick={() => setSelected(item)}>
            View
          </button>
          {item.reportStatus === 'SUBMITTED' && isSuperAdmin && (
            <button className="btn btn-sm btn-primary" onClick={() => handleAcknowledge(item.id)}>
              Acknowledge
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Suspicious Activity Reports" description="Review and manage suspicious activity reports" />
      <Card>
        <DataTable
          columns={columns}
          data={reports || []}
          keyExtractor={(item) => item.id}
          isLoading={isLoading}
          emptyMessage="No suspicious reports"
        />
      </Card>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Suspicious Report #{selected.id}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{selected.trustName || 'Untitled Trust'}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400">Trust Name</p>
                  <p className="text-sm font-medium text-gray-900">{selected.trustName || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Daybook Entry</p>
                  <p className="text-sm font-medium text-gray-900">#{selected.daybookEntryId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Reported by</p>
                  <p className="text-sm font-medium text-gray-900">
                    {isSuperAdmin ? 'Registry Staff' : selected.reportedByName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Status</p>
                  <div className="mt-0.5"><StatusBadge status={selected.reportStatus} /></div>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Reported at</p>
                  <p className="text-sm font-medium text-gray-900">{formatDateTime(selected.createdAt)}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">Reason</p>
                <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-800">{selected.reason}</div>
              </div>

              {selected.concerns && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Concerns</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.concerns.split(', ').map((c) => (
                      <span key={c} className="px-2.5 py-1 text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full">
                        {c.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selected.partiesSummary && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Parties</p>
                  <p className="text-sm text-gray-700">{selected.partiesSummary}</p>
                </div>
              )}

              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Transmission Status</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-3 rounded-lg border ${selected.sentToDefence ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${selected.sentToDefence ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-sm font-medium text-gray-700">Ministry of Defence</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {selected.sentToDefenceAt ? formatDateTime(selected.sentToDefenceAt) : 'Not sent'}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg border ${selected.sentToFiu ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${selected.sentToFiu ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-sm font-medium text-gray-700">Central Bank FIU</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {selected.sentToFiuAt ? formatDateTime(selected.sentToFiuAt) : 'Not sent'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                {isRegistryAdmin && !selected.sentToDefence && (
                  <button
                    onClick={() => handleSendDefence(selected.id)}
                    disabled={sendingDefence}
                    className="px-3 py-1.5 text-xs font-medium bg-gray-800 hover:bg-gray-900 disabled:bg-gray-300 text-white rounded-md transition-colors disabled:cursor-not-allowed cursor-pointer"
                  >
                    {sendingDefence ? 'Sending...' : 'Send to Defence'}
                  </button>
                )}
                {isRegistryAdmin && !selected.sentToFiu && (
                  <button
                    onClick={() => handleSendFiu(selected.id)}
                    disabled={sendingFiu}
                    className="px-3 py-1.5 text-xs font-medium bg-blue-700 hover:bg-blue-800 disabled:bg-gray-300 text-white rounded-md transition-colors disabled:cursor-not-allowed cursor-pointer"
                  >
                    {sendingFiu ? 'Sending...' : 'Send to FIU'}
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isSuperAdmin && selected.reportStatus === 'SUBMITTED' && (
                  <button
                    onClick={() => handleAcknowledge(selected.id)}
                    className="px-3 py-1.5 text-xs font-medium bg-green-700 hover:bg-green-800 text-white rounded-md transition-colors cursor-pointer"
                  >
                    Acknowledge
                  </button>
                )}
                {isSuperAdmin && (
                  <button
                    onClick={() => handleDownloadPdf(selected)}
                    disabled={downloading}
                    className="px-3 py-1.5 text-xs font-medium bg-maroon-700 hover:bg-maroon-800 disabled:bg-gray-300 text-white rounded-md transition-colors disabled:cursor-not-allowed cursor-pointer"
                  >
                    {downloading ? 'Downloading...' : 'Download PDF'}
                  </button>
                )}
                <button
                  onClick={() => setSelected(null)}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}