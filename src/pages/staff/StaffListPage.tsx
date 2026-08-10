import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { staffApi } from '../../api';
import { LoadingSpinner, StatusBadge } from '../../components/shared';
import { STAFF_ROLES } from '../../types/staff';
import type { StaffMember, StaffRole } from '../../types/staff';

const roleIcons: Record<StaffRole, string> = {
  COUNTER_USER: 'M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12',
  DAYBOOK_USER: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
  FOLIO_USER: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
};

export default function StaffListPage() {
  const navigate = useNavigate();
  const [preview, setPreview] = useState<{ html: string; name: string } | null>(null);
  const [resendingId, setResendingId] = useState<number | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const { data: staff, isLoading } = useQuery({
    queryKey: ['staff'],
    queryFn: staffApi.getAll,
  });

  const getSlot = (role: StaffRole): StaffMember | undefined =>
    staff?.find((s) => s.role === role);

  const filledCount = STAFF_ROLES.filter((r) => getSlot(r.role)).length;

  const isPending = (s: StaffMember) =>
    s.status !== 'ACTIVE' && s.status !== 'DRAFT';

  const handleView = async (member: StaffMember) => {
    setPreviewLoading(true);
    try {
      const html = await staffApi.getPreview(member.id);
      setPreview({ html, name: member.fullName });
    } catch {
      alert('Could not load email preview');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleResend = async (member: StaffMember) => {
    setResendingId(member.id);
    try {
      await staffApi.sendInvite(member.id);
      alert(`Invitation re-sent to ${member.email}`);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      alert(axiosErr?.response?.data?.message || 'Failed to resend invitation');
    } finally {
      setResendingId(null);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-lg font-bold text-gray-900">Staff Management</h1>
        <p className="text-sm text-gray-500 mt-0.5">
           Manage your registry's staff members. Each registry can have one person per role (3 total).
        </p>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            {STAFF_ROLES.map(({ role, label, description }) => {
              const member = getSlot(role);
              const filled = !!member;

              return (
                <div
                  key={role}
                  onClick={() => {
                    if (filled) navigate(`/staff/${member!.id}/review`);
                    else navigate(`/staff/new?role=${role}`);
                  }}
                  className={`rounded-xl border-2 p-5 transition-all cursor-pointer ${
                    filled
                      ? 'border-gray-200 bg-white hover:border-gray-300'
                      : 'border-dashed border-gray-300 bg-gray-50 hover:border-maroon-400 hover:bg-maroon-50/30'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      filled ? 'bg-gray-100 text-gray-600' : 'bg-maroon-100 text-maroon-600'
                    }`}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={roleIcons[role]} />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{label}</p>
                      <p className="text-xs text-gray-400">{description}</p>
                    </div>
                  </div>

                  {filled ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-maroon-700 text-white text-[10px] font-semibold flex items-center justify-center">
                          {member!.fullName.charAt(0)}
                        </div>
                        <span className="text-sm text-gray-800 font-medium truncate">{member!.fullName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <StatusBadge status={member!.status === 'ACTIVE' ? 'ACTIVE' : member!.inviteExpiresAt ? 'PENDING' : 'DRAFT'} />
                        <span className="text-xs text-gray-400">{member!.email}</span>
                      </div>
                      {isPending(member!) && (
                        <div className="flex items-center gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleView(member!)}
                            className="text-[11px] font-medium text-gray-500 hover:text-gray-700 underline"
                          >
                            {previewLoading && preview?.name === member!.fullName ? 'Loading...' : 'View Email'}
                          </button>
                          <button
                            onClick={() => handleResend(member!)}
                            disabled={resendingId === member!.id}
                            className="text-[11px] font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50"
                          >
                            {resendingId === member!.id ? 'Sending...' : 'Resend Invite'}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-16">
                      <div className="text-center">
                        <svg className="w-6 h-6 text-gray-300 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        <span className="text-xs text-gray-400 font-medium">Add Staff</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-xs text-gray-400 mt-4">
            {filledCount} of {STAFF_ROLES.length} staff slots filled
          </p>
        </>
      )}

      {/* Email Preview Modal */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setPreview(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-800">Invitation Email — {preview.name}</h3>
              <button onClick={() => setPreview(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <iframe srcDoc={preview.html} title="Email preview" className="w-full border-0" style={{ height: '70vh' }} />
          </div>
        </div>
      )}

      {/* Loading overlay for preview */}
      {previewLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg px-6 py-4 shadow-xl flex items-center gap-3">
            <svg className="animate-spin h-5 w-5 text-maroon-700" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm text-gray-700">Loading email preview...</span>
          </div>
        </div>
      )}
    </div>
  );
}
