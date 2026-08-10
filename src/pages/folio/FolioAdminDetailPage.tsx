import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { folioApi } from '../../api';
import { LoadingSpinner, StatusBadge } from '../../components/shared';
import type { Folio, Party, Property } from '../../types';

interface EmailForm {
  to: string;
  subject: string;
  body: string;
}

type Tab = 'general' | 'parties' | 'properties' | 'emailLogs';

const tabLabels: Record<Tab, string> = {
  general: 'General',
  parties: 'Parties',
  properties: 'Properties',
  emailLogs: 'Email Logs',
};

const generalFields: { key: keyof Folio; label: string }[] = [
  { key: 'folioNumber', label: 'Folio Number' },
  { key: 'daybookNumber', label: 'Daybook Number' },
  { key: 'trustName', label: 'Trust Name' },
  { key: 'trustType', label: 'Trust Type' },
  { key: 'trustCategory', label: 'Category' },
  { key: 'folioType', label: 'Folio Type' },
  { key: 'trustAddress', label: 'Trust Address' },
  { key: 'trustPurpose', label: 'Trust Purpose' },
  { key: 'remarks', label: 'Remarks' },
  { key: 'rejectionReason', label: 'Rejection Reason' },
  { key: 'reportReason', label: 'Report Reason' },
  { key: 'broughtForwardVolume', label: 'Brought Forward Volume' },
  { key: 'broughtForwardFolio', label: 'Brought Forward Folio' },
];

export default function FolioAdminDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const folioId = Number(id);
  const [tab, setTab] = useState<Tab>('general');
  const [actionMsg, setActionMsg] = useState('');
  const [emailDialog, setEmailDialog] = useState(false);
  const [emailForm, setEmailForm] = useState<EmailForm>({ to: '', subject: '', body: '' });
  const [expandedEmailId, setExpandedEmailId] = useState<number | null>(null);

  const { data: folio, isLoading } = useQuery({
    queryKey: ['folio', folioId],
    queryFn: () => folioApi.getById(folioId),
  });

  const { data: parties } = useQuery({
    queryKey: ['folio', folioId, 'parties'],
    queryFn: () => folioApi.getParties(folioId),
    enabled: tab === 'parties',
  });

  const { data: properties } = useQuery({
    queryKey: ['folio', folioId, 'properties'],
    queryFn: () => folioApi.getProperties(folioId),
    enabled: tab === 'properties',
  });

  const { data: emailLogsRaw, isLoading: logsLoading } = useQuery({
    queryKey: ['folio', folioId, 'email-logs'],
    queryFn: () => folioApi.getEmailLogs(folioId),
    enabled: tab === 'emailLogs',
  });
  const emailLogs = Array.isArray(emailLogsRaw) ? emailLogsRaw : [];

  const sendEmailMutation = useMutation({
    mutationFn: (data: EmailForm) => folioApi.sendEmail(folioId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folio', folioId, 'email-logs'] });
      setActionMsg('Email sent to notary');
      setEmailDialog(false);
      setTimeout(() => setActionMsg(''), 3000);
    },
    onError: (err: unknown) => {
      const e = err as { message?: string };
      setActionMsg(e?.message || 'Failed to send email');
    },
  });

  function openEmailDialog() {
    setEmailForm({
      to: '',
      subject: `Action Required: Issues Reported on Folio ${folio?.volumeNumber ? `${folio.volumeNumber}/` : ''}${folio?.folioNumber || ''}`,
      body: `Dear Notary,

The deed you attested (Folio: ${folio?.volumeNumber ? `${folio.volumeNumber}/` : ''}${folio?.folioNumber || ''}) has been reported with the following issues:

${folio?.reportReason || ''}

Please correct these issues within 2–3 working days and resend to the Land Registry.

This is an automated notification from the Trust Registration System.`,
    });
    setEmailDialog(true);
  }

  const renderField = (key: keyof Folio) => {
    const val = folio![key];
    if (val === null || val === undefined) return '-';
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    return String(val);
  };

  if (isLoading) return <LoadingSpinner />;
  if (!folio) return null;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/folio/admin')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              Folio {folio.volumeNumber ? `${folio.volumeNumber}/${folio.folioNumber || '-'}` : folio.folioNumber || `#${folio.id}`}
            </h1>
            <p className="text-sm text-gray-500">
              {folio.trustName || 'Untitled'} &middot; {folio.trustType}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {folio.hasScan && (
            <button
              onClick={() => navigate(`/deed-viewer/${folio.id}`)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-maroon-700 bg-maroon-50 border border-maroon-200 rounded-lg hover:bg-maroon-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              View Deed
            </button>
          )}
          <StatusBadge status={folio.approvalStatus} />
        </div>
      </div>

      {actionMsg && (
        <div className="mb-4 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          {actionMsg}
        </div>
      )}

      {/* Action buttons for REPORTED folios */}
      {folio.approvalStatus === 'REPORTED' && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={openEmailDialog}
            className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            Send Email
          </button>
          <button
            onClick={() => navigate(`/folio/${folioId}/entry?registerAfterCorrection=true`)}
            className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
          >
            Review &amp; Register
          </button>
        </div>
      )}

      {/* Tab bar */}
      <div className="border-b border-gray-200 mb-4">
        <div className="flex gap-6">
          {(Object.keys(tabLabels) as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                tab === t
                  ? 'text-maroon-700 border-maroon-700'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              {tabLabels[t]}
            </button>
          ))}
        </div>
      </div>

      {/* General tab */}
      {tab === 'general' && (
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="grid grid-cols-3 gap-x-8 gap-y-3">
            {generalFields.map((field) => {
              const val = renderField(field.key);
              if (field.key === 'rejectionReason' && val === '-') return null;
              if (field.key === 'reportReason' && val === '-') return null;
              return (
                <div key={field.key}>
                  <span className="text-xs text-gray-400 uppercase tracking-wider">{field.label}</span>
                  <p className="text-sm text-gray-900 mt-0.5">{val}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Parties tab */}
      {tab === 'parties' && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Full Name</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">ID Number</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!parties?.length ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">No parties</td></tr>
              ) : (
                parties.map((p: Party) => (
                  <tr key={p.id}>
                    <td className="px-4 py-2.5 text-gray-900">{p.partyRole}</td>
                    <td className="px-4 py-2.5 text-gray-600">{p.partyType}</td>
                    <td className="px-4 py-2.5 text-gray-900 font-medium">{p.fullName || '-'}</td>
                    <td className="px-4 py-2.5 text-gray-600">{p.idNumber || '-'}</td>
                    <td className="px-4 py-2.5"><StatusBadge status={p.verificationStatus} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Properties tab */}
      {tab === 'properties' && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Details</th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase">Amount (LKR)</th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase">Value (LKR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!properties?.length ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-400">No properties</td></tr>
              ) : (
                properties.map((p: Property) => (
                  <tr key={p.id}>
                    <td className="px-4 py-2.5 text-gray-900">{p.propertyType}</td>
                    <td className="px-4 py-2.5 text-gray-600">{p.otherDescription || p.vehicleDetails || '-'}</td>
                    <td className="px-4 py-2.5 text-right text-gray-900 font-mono">
                      {p.amount != null ? p.amount.toLocaleString() : '-'}
                    </td>
                    <td className="px-4 py-2.5 text-right text-gray-900 font-mono">
                      {p.propertyValue != null ? p.propertyValue.toLocaleString() : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Email Logs tab */}
      {tab === 'emailLogs' && (
        <div className="space-y-3">
          {logsLoading ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-sm text-gray-400">
              Loading email logs...
            </div>
          ) : !emailLogs?.length ? (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center text-sm text-gray-400">
              No emails have been sent for this folio
            </div>
          ) : (
            emailLogs.map((log: any) => (
              <div key={log.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedEmailId(expandedEmailId === log.id ? null : log.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50/50 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 truncate">{log.subject}</span>
                      <span className={`shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                        log.status === 'SENT' ? 'bg-green-50 text-green-700' :
                        log.status === 'FAILED' ? 'bg-red-50 text-red-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-500">To: {log.recipient}</span>
                      <span className="text-xs text-gray-300">&middot;</span>
                      <span className="text-xs text-gray-500">{log.sentAt ? new Date(log.sentAt).toLocaleString() : '-'}</span>
                      <span className="text-xs text-gray-300">&middot;</span>
                      <span className="text-xs text-gray-500">{log.emailType}</span>
                    </div>
                  </div>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedEmailId === log.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                {expandedEmailId === log.id && (
                  <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/50">
                    <div className="mb-3">
                      <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">To:</span>
                      <p className="text-sm text-gray-900 mt-0.5">{log.recipient}</p>
                    </div>
                    <div className="mb-3">
                      <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Subject:</span>
                      <p className="text-sm text-gray-900 mt-0.5">{log.subject}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Message:</span>
                      <div
                        className="mt-1 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg p-3 whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: (log.body || '').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '') }}
                      />
                    </div>
                    {log.errorMessage && (
                      <div className="mt-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                        Error: {log.errorMessage}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Email Dialog */}
      {emailDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setEmailDialog(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Send Email to Notary</h3>
              <span className="text-xs text-gray-400">Folio: {folio?.volumeNumber ? `${folio.volumeNumber}/${folio.folioNumber || ''}` : folio?.folioNumber || `#${folio?.id}`}</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">To (Notary Email)</label>
                <input
                  type="email"
                  value={emailForm.to}
                  onChange={(e) => setEmailForm({ ...emailForm, to: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500/20 focus:border-maroon-500 outline-none"
                  placeholder="notary@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Subject</label>
                <input
                  type="text"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500/20 focus:border-maroon-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Message</label>
                <textarea
                  value={emailForm.body}
                  onChange={(e) => setEmailForm({ ...emailForm, body: e.target.value })}
                  rows={10}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500/20 focus:border-maroon-500 outline-none resize-y font-mono"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => sendEmailMutation.mutate(emailForm)}
                disabled={sendEmailMutation.isPending || !emailForm.to.trim()}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 disabled:bg-gray-300 text-white text-sm font-medium rounded-lg transition-colors disabled:cursor-not-allowed cursor-pointer"
              >
                {sendEmailMutation.isPending ? 'Sending...' : 'Send Email'}
              </button>
              <button
                onClick={() => setEmailDialog(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
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
