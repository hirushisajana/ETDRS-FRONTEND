import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { registryApi } from '../../api';

const provinces = [
  'Central', 'Eastern', 'North Central', 'Northern',
  'North Western', 'Sabaragamuwa', 'Southern', 'Uva', 'Western',
];

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
    <div className="p-6 lg:p-8 max-w-[900px]">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-5">
        <button onClick={() => navigate(backPath)} className="hover:text-maroon-700 transition-colors">
          Land registries
        </button>
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <span className="text-gray-700 font-medium">Register new registry</span>
      </nav>

      <h1 className="text-xl font-semibold text-gray-900 mb-4">Register new land registry</h1>

      {/* Error banner */}
      {error && (
        <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </div>
      )}

      {/* Info banner */}
      <div className="mb-7 px-4 py-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-800">
        <div className="flex gap-2.5">
          <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-900">Registry details</h2>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registry name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={set('name')}
                  placeholder="e.g. Colombo Land Registry"
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700 text-gray-700 placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registry code *</label>
                <input
                  type="text"
                  value={form.registryCode}
                  onChange={set('registryCode')}
                  placeholder="e.g. CMB"
                  maxLength={3}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700 text-gray-700 placeholder-gray-400 uppercase"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Exactly 3 uppercase letters. Used in daybook numbers: <span className="font-mono text-gray-500">{form.registryCode || 'XXX'}/E/000001/2026</span>
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Province *</label>
                <select
                  value={form.province}
                  onChange={set('province')}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700 text-gray-700 bg-white appearance-none cursor-pointer"
                >
                  <option value="">Select province</option>
                  {provinces.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
                <input
                  type="text"
                  value={form.district}
                  onChange={set('district')}
                  placeholder="e.g. Colombo"
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700 text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact number *</label>
                <input
                  type="text"
                  value={form.contactNumber}
                  onChange={set('contactNumber')}
                  placeholder="+94 11 xxxxxxx"
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700 text-gray-700 placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Official email *</label>
                <input
                  type="email"
                  value={form.officialEmail}
                  onChange={set('officialEmail')}
                  placeholder="colombo@rgd.gov.lk"
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700 text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
              <textarea
                value={form.address}
                onChange={set('address')}
                placeholder="Physical mailing address of the registry office"
                rows={3}
                required
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700 text-gray-700 placeholder-gray-400 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2 — Registry Admin account */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900">Create Registry Admin for this registry</h2>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full name *</label>
                <input
                  type="text"
                  value={form.registryAdminFullName}
                  onChange={set('registryAdminFullName')}
                  placeholder="e.g. Kamal Perera"
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700 text-gray-700 placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email address *</label>
                <input
                  type="email"
                  value={form.registryAdminEmail}
                  onChange={set('registryAdminEmail')}
                  placeholder="admin@rgd.gov.lk"
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700 text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>
            <p className="text-xs text-gray-400">
              An invite email will be sent automatically with a 48-hour activation link once the registry is saved.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(backPath)}
            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-maroon-700 text-white text-sm font-medium rounded-lg hover:bg-maroon-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
