import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { daybookApi } from '../../api';
import { LoadingSpinner, StatusBadge } from '../../components/shared';

const fields: { label: string; key: string; format?: 'date' | 'money' }[] = [
  { label: 'Daybook Number', key: 'daybookNumber' },
  { label: 'Status', key: 'status' },
  { label: 'Trust Type', key: 'trustType' },
  { label: 'Trust Category', key: 'trustCategory' },
  { label: 'Year', key: 'year' },
  { label: 'Sequence Number', key: 'sequenceNumber' },
  { label: 'Entry Type', key: 'entryType' },
  { label: 'Client Name', key: 'clientName' },
  { label: 'Client Email', key: 'clientEmail' },
  { label: 'Client Telephone', key: 'clientTelephone' },
  { label: 'Deed Number', key: 'deedNumber' },
  { label: 'Service Type', key: 'serviceType' },
  { label: 'Registration Fee', key: 'registrationFee', format: 'money' },
  { label: 'Receipt Delivery', key: 'receiptDelivery' },
  { label: 'Deed Type', key: 'deedType' },
  { label: 'Submitter Name', key: 'submitterName' },
  { label: 'Submitter Address', key: 'submitterAddress' },
  { label: 'Attested Date', key: 'attestedDate', format: 'date' },
  { label: 'Language', key: 'language' },
  { label: 'Notary', key: 'notaryName' },
  { label: 'Value of Amount (Rs)', key: 'valueOfAmount', format: 'money' },
  { label: 'Number of Lots', key: 'numberOfLots' },
  { label: 'Division', key: 'division' },
  { label: 'Volume', key: 'volume' },
  { label: 'Folio Reference', key: 'folioRef' },
  { label: 'Return Date', key: 'returnDate', format: 'date' },
  { label: 'Acceptor Signature', key: 'acceptorSignature' },
  { label: 'Acceptor Date', key: 'acceptorDate', format: 'date' },
  { label: 'Registrar Initials', key: 'registrarInitials' },
  { label: 'Remarks', key: 'remarks' },
  { label: 'Original Daybook', key: 'originalDaybookNumber' },
  { label: 'Quarterly Update #', key: 'quarterlyUpdateNumber' },
  { label: 'Created By', key: 'createdByName' },
];

export default function DaybookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: entry, isLoading } = useQuery({
    queryKey: ['daybook', 'detail', Number(id)],
    queryFn: () => daybookApi.getById(Number(id)),
    enabled: !!id,
  });

  if (isLoading) return <LoadingSpinner />;
  if (!entry) return <div className="p-6 text-red-600">Entry not found</div>;

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate(-1)} className="text-sm text-maroon-700 hover:underline">&larr; Back</button>
        <h1 className="text-lg font-bold text-gray-900">Daybook Entry — {entry.daybookNumber}</h1>
        <StatusBadge status={entry.status} />
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-700">Full Entry Details</h2>
        </div>
        <div className="p-5 grid grid-cols-3 gap-x-8 gap-y-3">
          {fields.map(({ label, key, format }) => {
            const raw = (entry as unknown as Record<string, unknown>)[key];
            let value: string;
            if (raw == null || raw === '') {
              value = '-';
            } else if (format === 'date') {
              value = new Date(String(raw)).toLocaleDateString('en-GB');
            } else if (format === 'money') {
              value = `Rs ${Number(raw).toLocaleString()}`;
            } else {
              value = String(raw);
            }
            return (
              <div key={key}>
                <div className="text-xs text-gray-500">{label}</div>
                <div className="text-sm text-gray-900 font-medium mt-0.5 break-words">{value}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
