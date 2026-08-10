import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { registryApi } from '../../api/registry';

export default function InviteReviewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const registryId = Number(searchParams.get('registryId'));

  const [tab, setTab] = useState<'preview' | 'edit'>('preview');
  const [toEmail, setToEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [sending, setSending] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const { data: review, isLoading: reviewLoading } = useQuery({
    queryKey: ['invite-review', registryId],
    queryFn: () => registryApi.getInviteReview(registryId),
    enabled: !!registryId,
  });

  const { data: preview, isLoading: previewLoading } = useQuery({
    queryKey: ['invite-preview', registryId],
    queryFn: () => registryApi.getInvitePreview(registryId),
    enabled: !!registryId,
  });

  useEffect(() => {
    if (preview) {
      setToEmail(preview.to);
      setSubject(preview.subject);
    }
  }, [preview]);

  const handleSend = async () => {
    setSending(true);
    setError('');
    try {
      await registryApi.sendInvite(registryId, { to: toEmail, subject });
      setSent(true);
    } catch {
      setError('Failed to send invite. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleDiscard = async () => {
    setDiscarding(true);
    setError('');
    try {
      await registryApi.discardInvite(registryId);
      navigate('/dashboard/super-admin/registries');
    } catch {
      setError('Failed to discard invite.');
      setDiscarding(false);
    }
  };

  if (!registryId) {
    return (
      <div className="p-6 lg:p-8 max-w-[900px]">
        <p className="text-sm text-gray-400">No registry specified.</p>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="p-6 lg:p-8 max-w-[900px]">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
            <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Invite sent successfully</h2>
          <p className="text-sm text-gray-400 mb-6">
            An invitation email has been sent to <strong className="text-gray-600">{toEmail}</strong>.
            The recipient has 48 hours to activate their account.
          </p>
          <button
            onClick={() => navigate('/dashboard/super-admin/registries')}
            className="px-5 py-2 bg-maroon-700 text-white text-sm font-medium rounded-lg hover:bg-maroon-800 transition-colors"
          >
            Back to registries
          </button>
        </div>
      </div>
    );
  }

  const isLoading = reviewLoading || previewLoading;

  return (
    <div className="p-6 lg:p-8 max-w-[900px]">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-5">
        <button onClick={() => navigate('/dashboard/super-admin/registries')} className="hover:text-maroon-700 transition-colors">
          Land registries
        </button>
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <button onClick={() => navigate('/dashboard/super-admin/registries/new')} className="hover:text-maroon-700 transition-colors">
          Register new registry
        </button>
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <span className="text-gray-700 font-medium">Review invite</span>
      </nav>

      <h1 className="text-xl font-semibold text-gray-900 mb-6">Review invite before sending</h1>

      {/* Progress stepper */}
      <div className="flex items-center gap-0 mb-7">
        {[
          { label: 'Registry details', state: 'done' as const },
          { label: 'Review & send invite', state: 'current' as const },
          { label: 'Awaiting activation', state: 'pending' as const },
        ].map((step, i) => (
          <div key={step.label} className="flex items-center flex-1">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step.state === 'done' ? 'bg-emerald-500 text-white' :
                step.state === 'current' ? 'bg-maroon-700 text-white ring-2 ring-maroon-700/20' :
                'bg-gray-100 text-gray-300'
              }`}>
                {step.state === 'done' ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span className={`text-xs font-medium ${
                step.state === 'done' ? 'text-emerald-700' :
                step.state === 'current' ? 'text-maroon-700' :
                'text-gray-300'
              }`}>{step.label}</span>
            </div>
            {i < 2 && (
              <div className={`flex-1 h-px mx-3 ${
                step.state === 'done' ? 'bg-emerald-300' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-maroon-700 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Explanatory line */}
          <div className="mb-6 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
            <div className="flex gap-2.5">
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <p>
                The registry record below will be saved immediately. The invite email is <strong>NOT</strong> sent until you confirm.
              </p>
            </div>
          </div>

          {/* Summary card */}
          {review && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-6">
              <div className="px-6 py-4 border-b border-gray-50">
                <h2 className="text-sm font-semibold text-gray-900">Registry summary</h2>
              </div>
              <div className="p-6">
                <div className="grid sm:grid-cols-4 gap-6">
                  <div>
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-1">Name</p>
                    <p className="text-sm font-medium text-gray-900">{review.registryName}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-1">Code</p>
                    <p className="text-sm font-mono font-medium text-maroon-700">{review.registryCode}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-1">Province / District</p>
                    <p className="text-sm text-gray-600">{review.province || '—'} / {review.district || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-1">Status</p>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Saved — Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Email preview section */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-6">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Email preview</h2>
              <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => setTab('preview')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    tab === 'preview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Preview
                </button>
                <button
                  onClick={() => setTab('edit')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    tab === 'edit' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Edit recipient / subject
                </button>
              </div>
            </div>

            {tab === 'edit' ? (
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                  <input
                    type="email"
                    value={toEmail}
                    onChange={(e) => setToEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700 text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700 text-gray-700"
                  />
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4 text-xs text-gray-400">
                  <span><strong className="text-gray-600">To:</strong> {toEmail}</span>
                  <span><strong className="text-gray-600">Subject:</strong> {subject}</span>
                </div>
                {preview?.html && (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <iframe
                      srcDoc={preview.html}
                      title="Email preview"
                      className="w-full"
                      style={{ height: '520px', border: 'none' }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleDiscard}
              disabled={discarding}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            >
              {discarding ? 'Discarding...' : 'Discard invite'}
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard/super-admin/registries/new')}
                className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                &larr; Back to edit
              </button>
              <button
                onClick={handleSend}
                disabled={sending || !toEmail || !subject}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-maroon-700 text-white text-sm font-medium rounded-lg hover:bg-maroon-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                {sending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.981l7.5-4.039a2.25 2.25 0 012.134 0l7.5 4.039a2.25 2.25 0 011.183 1.98V19.5z" />
                    </svg>
                    Confirm &amp; send invite
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
