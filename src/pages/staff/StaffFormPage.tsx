import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { staffApi } from '../../api';
import { LoadingSpinner } from '../../components/shared';
import { STAFF_ROLES } from '../../types/staff';
import type { StaffMember, StaffRole } from '../../types/staff';

const roleIcons: Record<StaffRole, string> = {
  COUNTER_USER: 'M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12',
  DAYBOOK_USER: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
  FOLIO_USER: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
};

export default function StaffFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedRole = searchParams.get('role') as StaffRole | null;

  const { data: staff, isLoading } = useQuery({
    queryKey: ['staff'],
    queryFn: staffApi.getAll,
  });

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<StaffRole | null>(preselectedRole);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSlot = (role: StaffRole): StaffMember | undefined =>
    staff?.find((s) => s.role === role);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!selectedRole || !fullName.trim() || !email.trim()) return;
    if (selectedRole && getSlot(selectedRole)) {
      setError('This role slot is already filled. Please select another role.');
      return;
    }
    setSaving(true);
    try {
      const result = await staffApi.create({ fullName: fullName.trim(), email: email.trim(), role: selectedRole });
      navigate(`/staff/${result.id}/review`);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
      const message = axiosErr?.response?.data?.message || axiosErr?.message || 'Failed to create staff. Please try again.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <button onClick={() => navigate('/staff')} className="text-sm text-gray-400 hover:text-gray-600 mb-1 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Staff
        </button>
        <h1 className="text-lg font-bold text-gray-900">Create Staff Account</h1>
        <p className="text-sm text-gray-500 mt-0.5">Assign a role and enter their details to create a staff invitation.</p>
      </div>

      {/* Role picker */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {STAFF_ROLES.map(({ role, label, description }) => {
          const slot = getSlot(role);
          const open = !slot;

          return (
            <button
              key={role}
              type="button"
              disabled={!open}
              onClick={() => setSelectedRole(role)}
              className={`relative rounded-xl border-2 p-4 text-left transition-all ${
                selectedRole === role
                  ? 'border-maroon-700 bg-maroon-50/30 ring-1 ring-maroon-700'
                  : open
                    ? 'border-gray-200 bg-white hover:border-gray-300'
                    : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
              }`}
            >
              {!open && (
                <span className="absolute top-2 right-2 text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                  Filled
                </span>
              )}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  selectedRole === role ? 'bg-maroon-100 text-maroon-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={roleIcons[role]} />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{label}</p>
                  <p className="text-xs text-gray-400">{description}</p>
                  {!open && slot && (
                    <p className="text-xs text-gray-400 mt-0.5">Currently: {slot.fullName}</p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Nimal Perera"
            required
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-maroon-600 focus:border-maroon-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. nimal@trs.lk"
            required
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-maroon-600 focus:border-maroon-600"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="button" onClick={() => navigate('/staff')} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
            Cancel
          </button>
          <button
            type="submit"
            disabled={!selectedRole || !fullName.trim() || !email.trim() || saving}
            className="px-4 py-2 text-sm font-medium text-white bg-maroon-700 rounded-md hover:bg-maroon-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Create & Review Invitation'}
          </button>
        </div>
      </form>
    </div>
  );
}
