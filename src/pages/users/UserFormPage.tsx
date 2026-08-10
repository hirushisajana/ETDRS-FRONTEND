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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      console.error('Failed to create user', err);
    }
  };

  return (
    <div>
      <PageHeader title="Add User" description="Create a new system user" />
      <Card>
        <form onSubmit={handleSubmit} className="form">
          <div className="form-field">
            <label className="form-label">Full Name *</label>
            <input
              className="form-input"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
          </div>
          <div className="form-field">
            <label className="form-label">Email *</label>
            <input
              type="email"
              className="form-input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="form-field">
            <label className="form-label">Role *</label>
            <select
              className="form-select"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              required
            >
              <option value="">Select role...</option>
              {roles.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {formData.role === 'HEAD_OFFICE' && (
            <div className="form-field">
              <label className="form-label">Head Office Role *</label>
              <select
                className="form-select"
                value={formData.headOfficeRole}
                onChange={(e) => setFormData({ ...formData, headOfficeRole: e.target.value as HeadOfficeRole })}
                required
              >
                <option value="">Select...</option>
                {headOfficeRoles.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
          )}

          {formData.role && formData.role !== 'HEAD_OFFICE' && formData.role !== 'SUPER_ADMIN' && (
            <div className="form-field">
              <label className="form-label">Registry *</label>
              <select
                className="form-select"
                value={formData.registryId}
                onChange={(e) => setFormData({ ...formData, registryId: e.target.value })}
                required
              >
                <option value="">Select registry...</option>
                {registries?.map((r) => (
                  <option key={r.id} value={r.id}>{r.name} ({r.registryCode})</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/users')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">Create User</button>
          </div>
        </form>
      </Card>
    </div>
  );
}
