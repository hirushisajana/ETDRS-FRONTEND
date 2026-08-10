import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { staffApi } from '../../api';
import { LoadingSpinner, StatusBadge } from '../../components/shared';
import { STAFF_ROLES } from '../../types/staff';
import type { StaffRole } from '../../types/staff';

const steps = ['Staff details', 'Review & send', 'Awaiting activation'];

export default function StaffInviteReviewPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const staffId = Number(id);

  const [tab, setTab] = useState<'preview' | 'edit'>('preview');
  const [toEmail, setToEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [sent, setSent] = useState(false);

  const { data: staff, isLoading } = useQuery({
    queryKey: ['staff', staffId],
    queryFn: () => staffApi.getById(staffId),
  });

  const { data: previewHtml, isLoading: previewLoading } = useQuery({
    queryKey: ['staff', staffId, 'preview'],
    queryFn: () => staffApi.getPreview(staffId),
    enabled: !!staffId,
  });

  useEffect(() => {
    if (staff) {
      setToEmail(staff.email);
      const roleLabel = STAFF_ROLES.find((r) => r.role === staff.role)?.label || staff.role;
      setSubject(`You're invited to join the Trust Registration System as ${roleLabel}`);
    }
  }, [staff]);

  const sendMutation = useMutation({
    mutationFn: () => staffApi.sendInvite(staffId),
    onSuccess: () => setSent(true),
  });

  const discardMutation = useMutation({
    mutationFn: () => staffApi.delete(staffId),
    onSuccess: () => navigate('/staff'),
  });

  const roleInfo = STAFF_ROLES.find((r) => r.role === (staff?.role as StaffRole));
  const roleLabel = roleInfo?.label || staff?.role || '';

  if (isLoading) return <LoadingSpinner />;
  if (!staff) return null;

  if (sent) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                i < 3 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'
              }`}>{i < 2 ? '✓' : i + 1}</div>
              <span className={`text-xs ${i < 3 ? 'text-green-700 font-medium' : 'text-gray-400'}`}>{s}</span>
              {i < 2 && <div className="w-8 h-px bg-gray-200" />}
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-8 max-w-sm mx-auto">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Invitation Sent Successfully</h2>
          <p className="text-sm text-gray-500 mb-6">An invitation email has been sent to {staff.email}</p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => navigate('/staff')} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
              Back to Staff
            </button>
            <button
              onClick={() => {
                setSent(false);
                navigate('/staff/new');
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-maroon-700 rounded-md hover:bg-maroon-800"
            >
              Add Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm text-gray-400 mb-4">
        <button onClick={() => navigate('/staff')} className="hover:text-gray-600">Staff</button>
        <span>/</span>
        <span className="text-gray-700 font-medium">Review Invitation</span>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
              i < 2 ? 'bg-maroon-700 text-white' : i === 2 ? 'bg-gray-200 text-gray-400' : 'bg-gray-200 text-gray-400'
            }`}>
              {i < 2 ? '✓' : i + 1}
            </div>
            <span className={`text-xs ${i < 2 ? 'text-maroon-700 font-medium' : 'text-gray-400'}`}>{s}</span>
            {i < 2 && <div className={`w-8 h-px ${i < 1 ? 'bg-maroon-700' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {/* Staff summary card */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800 mb-4 flex items-center gap-2">
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        This invitation has not been sent yet. Review the details below before sending.
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-maroon-700 text-white flex items-center justify-center text-sm font-bold">
            {staff.fullName.charAt(0)}
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-gray-900">{staff.fullName}</h2>
            <p className="text-sm text-gray-500">{staff.email}</p>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{roleLabel}</span>
              <StatusBadge status={staff.status} />
            </div>
          </div>
          {staff.invitedByName && (
            <div className="text-right">
              <p className="text-xs text-gray-400">Invited by</p>
              <p className="text-xs font-medium text-gray-700">{staff.invitedByName}</p>
            </div>
          )}
        </div>
      </div>

      {/* Email preview */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setTab('preview')}
            className={`px-4 py-2.5 text-sm font-medium ${tab === 'preview' ? 'text-maroon-700 border-b-2 border-maroon-700' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Preview
          </button>
          <button
            onClick={() => setTab('edit')}
            className={`px-4 py-2.5 text-sm font-medium ${tab === 'edit' ? 'text-maroon-700 border-b-2 border-maroon-700' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Edit
          </button>
        </div>

        {tab === 'edit' ? (
          <div className="p-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
              <input value={toEmail} onChange={(e) => setToEmail(e.target.value)} className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Subject</label>
              <input value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md" />
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-2 border-b border-gray-100">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400 w-8">To:</span>
              <span className="text-gray-800">{toEmail}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400 w-8">Sub:</span>
              <span className="text-gray-800">{subject}</span>
            </div>
          </div>
        )}

        <div className="border-t border-gray-100">
          {previewLoading ? (
            <div className="p-8 text-center text-sm text-gray-400">Loading preview...</div>
          ) : (
            <iframe
              srcDoc={previewHtml || ''}
              title="Email preview"
              className="w-full border-0"
              style={{ height: '400px' }}
            />
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => discardMutation.mutate()}
          disabled={discardMutation.isPending}
          className="text-sm text-gray-400 hover:text-red-600 font-medium"
        >
          {discardMutation.isPending ? 'Discarding...' : 'Discard'}
        </button>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/staff')} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
            Back
          </button>
          <button
            onClick={() => sendMutation.mutate()}
            disabled={sendMutation.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-maroon-700 rounded-md hover:bg-maroon-800 disabled:opacity-50"
          >
            {sendMutation.isPending ? 'Sending...' : 'Confirm & Send Invitation'}
          </button>
        </div>
      </div>

      {sendMutation.isError && (
        <p className="text-sm text-red-600 mt-2">Failed to send invite. Please try again.</p>
      )}
    </div>
  );
}
