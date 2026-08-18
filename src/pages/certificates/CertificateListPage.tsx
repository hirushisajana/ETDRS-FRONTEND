import { useQuery } from '@tanstack/react-query';
import { certificateApi } from '../../api';
import { PageHeader, Card, DataTable, StatusBadge } from '../../components/shared';
import type { RegistrationCertificate } from '../../types';
import { formatDate } from '../../lib/format';

export default function CertificateListPage() {
  const { data: certificates, isLoading } = useQuery({
    queryKey: ['certificates'],
    queryFn: () => certificateApi.getAll(),
  });

  const columns = [
    { key: 'id', header: 'Cert #' },
    { key: 'daybookNumber', header: 'Daybook #' },
    { key: 'trustName', header: 'Trust Name' },
    { key: 'registryName', header: 'Registry' },
    {
      key: 'certificateType',
      header: 'Type',
      render: (item: RegistrationCertificate) => (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
          item.certificateType === 'RENEWAL'
            ? 'bg-blue-50 text-blue-700 ring-blue-600/20'
            : 'bg-violet-50 text-violet-700 ring-violet-600/20'
        }`}>
          {item.certificateType ?? 'ORIGINAL'}
        </span>
      ),
    },
    {
      key: 'issuedDate',
      header: 'Issued',
      render: (item: RegistrationCertificate) => formatDate(item.issuedDate),
    },
    {
      key: 'expiryDate',
      header: 'Expires',
      render: (item: RegistrationCertificate) => formatDate(item.expiryDate),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: RegistrationCertificate) => <StatusBadge status={item.status} />,
    },
    {
      key: 'active',
      header: 'Active',
      render: (item: RegistrationCertificate) => (
        item.active === false ? (
          <span className="text-xs font-medium text-slate-400">Superseded</span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Current
          </span>
        )
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (item: RegistrationCertificate) => (
        <div className="btn-group">
          <button className="btn btn-sm btn-secondary"
            onClick={() => certificateApi.download(item.id).then(blob => {
              const url = URL.createObjectURL(blob);
              window.open(url, '_blank');
            })}>
            Download
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Certificates" description="Manage registration certificates" />
      <Card>
        <DataTable
          columns={columns}
          data={certificates || []}
          keyExtractor={(item) => item.id}
          isLoading={isLoading}
          emptyMessage="No certificates found"
        />
      </Card>
    </div>
  );
}
