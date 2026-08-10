import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { scanApi } from '../../api';
import { PageHeader, Card, DataTable } from '../../components/shared';

export default function ScanPage() {
  const queryClient = useQueryClient();
  const [selectedFolio, setSelectedFolio] = useState<{ id: number; daybookNumber: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: pendingScans, isLoading } = useQuery({
    queryKey: ['scan', 'pending'],
    queryFn: scanApi.getPendingScans,
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedFolio) return;

    setUploading(true);
    try {
      await scanApi.uploadDeed(selectedFolio.id, file);
      setSelectedFolio(null);
      queryClient.invalidateQueries({ queryKey: ['scan'] });
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setUploading(false);
    }
  };

  const columns = [
    { key: 'id', header: 'Folio ID' },
    { key: 'daybookNumber', header: 'Daybook #' },
    { key: 'trustName', header: 'Trust Name' },
    {
      key: 'actions',
      header: 'Upload',
      render: (item: { id: number; daybookNumber: string; trustName: string }) => (
        <button className="btn btn-sm btn-primary" onClick={() => setSelectedFolio(item)}>
          Upload Scan
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Scan Upload" description="Upload deed scan files for folios" />

      {selectedFolio && (
        <Card title={`Upload Scan for Folio #${selectedFolio.id} (${selectedFolio.daybookNumber})`}>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
            disabled={uploading}
            className="form-input"
          />
          {uploading && <p>Uploading...</p>}
          <button className="btn btn-secondary mt-1" onClick={() => setSelectedFolio(null)}>Cancel</button>
        </Card>
      )}

      <Card>
        <DataTable
          columns={columns}
          data={pendingScans || []}
          keyExtractor={(item) => item.id}
          isLoading={isLoading}
          emptyMessage="No scans pending upload"
        />
      </Card>
    </div>
  );
}
