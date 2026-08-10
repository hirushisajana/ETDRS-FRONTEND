import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { registryApi } from '../../api';

const provinces = [
  'Central', 'Eastern', 'North Central', 'Northern',
  'North Western', 'Sabaragamuwa', 'Southern', 'Uva', 'Western',
];

const inputClass =
  'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

function SectionCard({ title, muted, children }: { title: string; muted?: boolean; children: React.ReactNode }) {
  return (
    <div className={`mb-6 rounded-3xl border shadow-sm ${muted ? 'border-slate-200 bg-slate-50' : 'border-slate-200 bg-white'}`}>
      <div className={`border-b px-6 py-4 ${muted ? 'border-slate-200' : 'border-slate-100'}`}>
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      </div>
      <div className="space-y-5 p-6">{children}</div>
    </div>
  );
}

export default function RegistryFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isSuperAdmin = location.pathname.startsWith('/dashboard/super-admin');
  const backPath = isSuperAdmin ? '/dashboard/super-admin/registries' : '/registries';

  const [form, setForm] = useState({
    name: '',
    registryCode: '',
    province: '',
    district: '',
    contactNumber: '',
    officialEmail: '',
    address: '',
    registryAdminFullName: '',
    registryAdminEmail: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        registryCode: form.registryCode.toUpperCase(),
        province: form.province || undefined,
        district: form.district || undefined,
        contactNumber: form.contactNumber || undefined,
        officialEmail: form.officialEmail || undefined,
        address: form.address || undefined,
        registryAdminFullName: form.registryAdminFullName || undefined,
        registryAdminEmail: form.registryAdminEmail || undefined,
      };
      const created = await registryApi.create(payload);
      navigate(`/dashboard/super-admin/registries/new/review?registryId=${created.id}`);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setError(msg || 'Failed to create registry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-[900px] p-6 lg:p-8">
      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-2 text-sm text-slate-400">
        <button onClick={() => navigate(backPath)} className="transition-colors hover:text-blue-700">
          Land registries
        </button>
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <span className="font-medium text-slate-700">Register new registry</span>
      </nav>

      <h1 className="mb-4 text-2xl font-bold tracking-tight text-slate-900">Register new land registry</h1>

      {/* Error banner */}
      {error && (
        <div className="mb-5 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </div>
      )}

      {/* Info banner */}
      <div className="mb-7 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        <div className="flex gap-2.5">
          <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          <div>
            <p className="font-medium">What happens when you submit this form</p>
            <p className="mt-1 text-blue-700">
              A Registry Admin account will be created and an invite email sent automatically once the registry is registered.
              There is no cap on how many registries can exist in the system.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Section 1 — Registry details */}
        <SectionCard title="Registry details">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Registry name" required>
              <input
                type="text"
                value={form.name}
                onChange={set('name')}
                placeholder="e.g. Colombo Land Registry"
                required
                className={inputClass}
              />
            </Field>
            <Field
              label="Registry code"
              required
              hint={
                <>
                  Exactly 3 uppercase letters. Used in daybook numbers:{' '}
                  <span className="font-mono text-slate-500">{form.registryCode || 'XXX'}/E/000001/2026</span>
                </>
              }
            >
              <input
                type="text"
                value={form.registryCode}
                onChange={set('registryCode')}
                placeholder="e.g. CMB"
                maxLength={3}
                required
                className={`${inputClass} uppercase`}
              />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Province" required>
              <select
                value={form.province}
                onChange={set('province')}
                required
                className={`${inputClass} cursor-pointer appearance-none`}
              >
                <option value="">Select province</option>
                {provinces.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </Field>
            <Field label="District" required>
              <input
                type="text"
                value={form.district}
                onChange={set('district')}
                placeholder="e.g. Colombo"
                required
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Contact number" required>
              <input
                type="text"
                value={form.contactNumber}
                onChange={set('contactNumber')}
                placeholder="+94 11 xxxxxxx"
                required
                className={inputClass}
              />
            </Field>
            <Field label="Official email" required>
              <input
                type="email"
                value={form.officialEmail}
                onChange={set('officialEmail')}
                placeholder="colombo@rgd.gov.lk"
                required
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Address" required>
            <textarea
              value={form.address}
              onChange={set('address')}
              placeholder="Physical mailing address of the registry office"
              rows={3}
              required
              className={`${inputClass} resize-none`}
            />
          </Field>
        </SectionCard>

        {/* Section 2 — Registry Admin account */}
        <SectionCard muted title="Create Registry Admin for this registry">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full name" required>
              <input
                type="text"
                value={form.registryAdminFullName}
                onChange={set('registryAdminFullName')}
                placeholder="e.g. Kamal Perera"
                required
                className={inputClass}
              />
            </Field>
            <Field label="Email address" required>
              <input
                type="email"
                value={form.registryAdminEmail}
                onChange={set('registryAdminEmail')}
                placeholder="admin@rgd.gov.lk"
                required
                className={inputClass}
              />
            </Field>
          </div>
          <p className="text-xs text-slate-400">
            An invite email will be sent automatically with a 48-hour activation link once the registry is saved.
          </p>
        </SectionCard>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(backPath)}
            className="rounded-xl px-4 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:from-blue-500 hover:to-blue-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Saving...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                Register registry &amp; send invite
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}