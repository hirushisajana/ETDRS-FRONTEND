import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { userApi, registryApi } from '../../api';
import { PageHeader, Card } from '../../components/shared';
import type { UserRole, HeadOfficeRole } from '../../types';

const roles: { value: UserRole; label: string }[] = [
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'HEAD_OFFICE', label: 'Head Office' },
  { value: 'REGISTRY_ADMIN', label: 'Registry Admin' },
  { value: 'COUNTER_USER', label: 'Counter User' },
  { value: 'DAYBOOK_USER', label: 'Daybook User' },
  { value: 'FOLIO_USER', label: 'Folio User' },
];

const headOfficeRoles: { value: HeadOfficeRole; label: string }[] = [
  { value: 'AUDITOR', label: 'Auditor' },
  { value: 'MONITOR', label: 'Monitor' },
  { value: 'SUPERVISOR', label: 'Supervisor' },
];

const inputClass =
  'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function UserFormPage() {
  const navigate = useNavigate();
  const { data: registries } = useQuery({
    queryKey: ['registries'],
    queryFn: registryApi.getAll,
  });

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: '' as UserRole | '',
    headOfficeRole: '' as HeadOfficeRole | '',
    registryId: '',
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (formData.role === 'HEAD_OFFICE') {
        await userApi.createHeadOffice({
          fullName: formData.fullName,
          email: formData.email,
          headOfficeRole: formData.headOfficeRole as HeadOfficeRole,
        });
      } else if (formData.role === 'REGISTRY_ADMIN') {
        await userApi.createRegistryAdmin({
          fullName: formData.fullName,
          email: formData.email,
          registryId: Number(formData.registryId),
        });
      } else {
        await userApi.createStaff({
          fullName: formData.fullName,
          email: formData.email,
          role: formData.role as UserRole,
          registryId: formData.registryId ? Number(formData.registryId) : undefined,
        });
      }
      navigate('/users');
    } catch (err) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setError(msg || 'Failed to create user.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-[720px] p-6 lg:p-8">
      <PageHeader title="Add User" description="Create a new system user" />
      {error && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <Card>
        <form onSubmit={handleSubmit}>
          <Field label="Full Name" required>
            <input
              className={inputClass}
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
          </Field>
          <Field label="Email" required>
            <input
              type="email"
              className={inputClass}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </Field>
          <Field label="Role" required>
            <select
              className={`${inputClass} cursor-pointer appearance-none`}
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              required
            >
              <option value="">Select role...</option>
              {roles.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </Field>

          {formData.role === 'HEAD_OFFICE' && (
            <Field label="Head Office Role" required>
              <select
                className={`${inputClass} cursor-pointer appearance-none`}
                value={formData.headOfficeRole}
                onChange={(e) => setFormData({ ...formData, headOfficeRole: e.target.value as HeadOfficeRole })}
                required
              >
                <option value="">Select...</option>
                {headOfficeRoles.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </Field>
          )}

          {formData.role && formData.role !== 'HEAD_OFFICE' && formData.role !== 'SUPER_ADMIN' && (
            <Field label="Registry" required>
              <select
                className={`${inputClass} cursor-pointer appearance-none`}
                value={formData.registryId}
                onChange={(e) => setFormData({ ...formData, registryId: e.target.value })}
                required
              >
                <option value="">Select registry...</option>
                {registries?.map((r) => (
                  <option key={r.id} value={r.id}>{r.name} ({r.registryCode})</option>
                ))}
              </select>
            </Field>
          )}

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
              onClick={() => navigate('/users')}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:from-blue-500 hover:to-blue-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}