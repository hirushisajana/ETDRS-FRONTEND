import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { folioApi } from '../../api';
import { LoadingSpinner, StatusBadge } from '../../components/shared';
import type { Folio } from '../../types';

interface EmailForm {
  to: string;
  subject: string;
  body: string;
}

export default function ReportedDeedsPage() {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('REPORTED');
  const [actionMsg, setActionMsg] = useState('');
  const [emailDialog, setEmailDialog] = useState<{ folioId: number; folioNumber: string; trustName: string; reportReason: string } | null>(null);
  const [emailForm, setEmailForm] = useState<EmailForm>({ to: '', subject: '', body: '' });

  const { data: folios, isLoading } = useQuery({
    queryKey: ['folios', 'by-status', filterStatus],
    queryFn: () => folioApi.getByStatus(filterStatus),
  });

  const sendEmailMutation = useMutation({
    mutationFn: ({ folioId, data }: { folioId: number; data: EmailForm }) =>
      folioApi.sendEmail(folioId, data),
    onSuccess: () => {
      setActionMsg('Email sent to notary');
      setEmailDialog(null);
      setTimeout(() => setActionMsg(''), 3000);
    },
    onError: (err: unknown) => {
      const e = err as { message?: string };
      setActionMsg(e?.message || 'Failed to send email');
    },
  });

  function openEmailDialog(f: Folio) {
    setEmailForm({
      to: '',
      subject: `Action Required: Issues Reported on Folio ${f.volumeNumber ? `${f.volumeNumber}/` : ''}${f.folioNumber || ''}`,
      body: `Dear Notary,

The deed you attested (Folio: ${f.volumeNumber ? `${f.volumeNumber}/` : ''}${f.folioNumber || ''}) has been reported with the following issues:

${f.reportReason || ''}

Please correct these issues within 2–3 working days and resend to the Land Registry.

This is an automated notification from the Trust Registration System.`,
    });
    setEmailDialog({
      folioId: f.id,
      folioNumber: f.volumeNumber ? `${f.volumeNumber}/${f.folioNumber || ''}` : f.folioNumber || `#${f.id}`,
      trustName: f.trustName || '',
      reportReason: f.reportReason || '',
    });
  }

  const statusFilters = ['REPORTED', 'REGISTERED', 'REJECTED', 'PENDING'];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-slate-900">Deed Records</h1>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Filter:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 outline-none"
          >
            {statusFilters.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {actionMsg && (
        <div className="mb-4 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          {actionMsg}
        </div>
      )}

      {isLoading ? (
        <LoadingSpinner />
      ) : !folios?.length ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-sm text-slate-400">
          No {filterStatus.toLowerCase()} folios found
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase">Folio</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase">Trust Name</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase">Type</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                {filterStatus === 'REPORTED' && (
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase">Report Reason</th>
                )}
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {folios.map((f: Folio) => (
                <tr key={f.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-2.5">
                    <button
                      onClick={() => navigate(`/folio/admin/${f.id}`)}
                      className="font-medium text-blue-700 hover:underline"
                    >
                      {f.volumeNumber ? `${f.volumeNumber}/${f.folioNumber || '-'}` : f.folioNumber || `#${f.id}`}
                    </button>
                  </td>
                  <td className="px-4 py-2.5 text-slate-900">{f.trustName || '-'}</td>
                  <td className="px-4 py-2.5 text-slate-600">{f.trustType}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={f.approvalStatus} /></td>
                  {filterStatus === 'REPORTED' && (
                    <td className="px-4 py-2.5 text-slate-600 max-w-xs truncate">{f.reportReason || '-'}</td>
                  )}
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {f.approvalStatus === 'REPORTED' && (
                        <>
                          <button
                            onClick={() => openEmailDialog(f)}
                            className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            Send Email
                          </button>
                          <button
                            onClick={() => navigate(`/folio/${f.id}/entry?registerAfterCorrection=true`)}
                            className="px-2.5 py-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                          >
                            Register
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => navigate(`/folio/admin/${f.id}`)}
                        className="px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Email Dialog */}
      {emailDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onClick={() => setEmailDialog(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900">Send Email to Notary</h3>
              <span className="text-xs text-slate-400">Folio: {emailDialog.folioNumber}</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">To (Notary Email)</label>
                <input
                  type="email"
                  value={emailForm.to}
                  onChange={(e) => setEmailForm({ ...emailForm, to: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 outline-none"
                  placeholder="notary@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Subject</label>
                <input
                  type="text"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Message</label>
                <textarea
                  value={emailForm.body}
                  onChange={(e) => setEmailForm({ ...emailForm, body: e.target.value })}
                  rows={10}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 outline-none resize-y font-mono"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  sendEmailMutation.mutate({ folioId: emailDialog.folioId, data: emailForm });
                }}
                disabled={sendEmailMutation.isPending || !emailForm.to.trim()}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors disabled:cursor-not-allowed cursor-pointer"
              >
                {sendEmailMutation.isPending ? 'Sending...' : 'Send Email'}
              </button>
              <button
                onClick={() => setEmailDialog(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
