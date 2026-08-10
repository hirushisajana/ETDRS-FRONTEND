import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { registryApi } from '../../api/registry';

const inputClass =
  'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';

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
      <div className="max-w-[900px] p-6 lg:p-8">
        <p className="text-sm text-slate-400">No registry specified.</p>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="max-w-[900px] p-6 lg:p-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
            <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="mb-2 text-lg font-bold tracking-tight text-slate-900">Invite sent successfully</h2>
          <p className="mb-6 text-sm text-slate-400">
            An invitation email has been sent to <strong className="text-slate-600">{toEmail}</strong>.
            The recipient has 48 hours to activate their account.
          </p>
          <button
            onClick={() => navigate('/dashboard/super-admin/registries')}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:from-blue-500 hover:to-blue-400 active:scale-[0.98]"
          >
            Back to registries
          </button>
        </div>
      </div>
    );
  }

  const isLoading = reviewLoading || previewLoading;

  return (
    <div className="max-w-[900px] p-6 lg:p-8">
      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-2 text-sm text-slate-400">
        <button onClick={() => navigate('/dashboard/super-admin/registries')} className="transition-colors hover:text-blue-700">
          Land registries
        </button>
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <button onClick={() => navigate('/dashboard/super-admin/registries/new')} className="transition-colors hover:text-blue-700">
          Register new registry
        </button>
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <span className="font-medium text-slate-700">Review invite</span>
      </nav>

      <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">Review invite before sending</h1>

      {/* Progress stepper */}
      <div className="mb-7 flex items-center gap-0">
        {[
          { label: 'Registry details', state: 'done' as const },
          { label: 'Review & send invite', state: 'current' as const },
          { label: 'Awaiting activation', state: 'pending' as const },
        ].map((step, i) => (
          <div key={step.label} className="flex flex-1 items-center">
            <div className="flex items-center gap-2">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                step.state === 'done' ? 'bg-emerald-500 text-white' :
                step.state === 'current' ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-600/20' :
                'bg-slate-100 text-slate-300'
              }`}>
                {step.state === 'done' ? (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span className={`text-xs font-medium ${
                step.state === 'done' ? 'text-emerald-700' :
                step.state === 'current' ? 'text-blue-700' :
                'text-slate-300'
              }`}>{step.label}</span>
            </div>
            {i < 2 && (
              <div className={`mx-3 h-px flex-1 ${
                step.state === 'done' ? 'bg-emerald-300' : 'bg-slate-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-5 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
        </div>
      ) : (
        <>
          {/* Explanatory line */}
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <div className="flex gap-2.5">
              <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <p>
                The registry record below will be saved immediately. The invite email is <strong>NOT</strong> sent until you confirm.
              </p>
            </div>
          </div>

          {/* Summary card */}
          {review && (
            <div className="mb-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-4">
                <h2 className="text-sm font-semibold text-slate-900">Registry summary</h2>
              </div>
              <div className="p-6">
                <div className="grid gap-6 sm:grid-cols-4">
                  <div>
                    <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-slate-400">Name</p>
                    <p className="text-sm font-medium text-slate-900">{review.registryName}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-slate-400">Code</p>
                    <p className="font-mono text-sm font-medium text-blue-700">{review.registryCode}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-slate-400">Province / District</p>
                    <p className="text-sm text-slate-600">{review.province || '—'} / {review.district || '—'}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-slate-400">Status</p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Saved — Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Email preview section */}
          <div className="mb-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-sm font-semibold text-slate-900">Email preview</h2>
              <div className="flex items-center rounded-xl bg-slate-100 p-0.5">
                <button
                  onClick={() => setTab('preview')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    tab === 'preview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Preview
                </button>
                <button
                  onClick={() => setTab('edit')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    tab === 'edit' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Edit recipient / subject
                </button>
              </div>
            </div>

            {tab === 'edit' ? (
              <div className="space-y-4 p-6">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">To</label>
                  <input
                    type="email"
                    value={toEmail}
                    onChange={(e) => setToEmail(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="mb-4 flex items-center gap-4 text-xs text-slate-400">
                  <span><strong className="text-slate-600">To:</strong> {toEmail}</span>
                  <span><strong className="text-slate-600">Subject:</strong> {subject}</span>
                </div>
                {preview?.html && (
                  <div className="overflow-hidden rounded-2xl border border-slate-200">
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
              className="rounded-xl px-4 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50"
            >
              {discarding ? 'Discarding...' : 'Discard invite'}
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard/super-admin/registries/new')}
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
              >
                &larr; Back to edit
              </button>
              <button
                onClick={handleSend}
                disabled={sending || !toEmail || !subject}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:from-blue-500 hover:to-blue-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Sending...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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