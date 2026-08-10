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
