import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RejectedDeedsPage from '../pages/counter/RejectedDeedsPage';
import { daybookApi } from '../api';
import type { Folio } from '../types';

vi.mock('../api', () => ({
  daybookApi: {
    getRejected: vi.fn(),
  },
}));

const rejectedFolio: Folio = {
  id: 1,
  daybookEntryId: 1,
  daybookNumber: 'CLB/E/000001/2026',
  registryId: 5,
  registryName: 'Colombo Land Registry',
  registryCode: 'CLB',
  trustType: 'EXPRESS',
  trustCategory: 'LOCAL',
  folioType: 'ORIGINAL',
  year: 2026,
  volumeNumber: 'Vol-01',
  folioNumber: 'Folio-0001',
  broughtForwardVolume: null,
  broughtForwardFolio: null,
  trustName: 'Jayasuriya Family Trust',
  trustAddress: 'Colombo',
  trustPurpose: 'Education',
  purposeFormat: 'PARAGRAPH',
  updateDetails: null,
  approvalStatus: 'REJECTED',
  rejectionReason: 'Missing trustee signature',
  reportReason: null,
  proposedDecision: 'REGISTER',
  proposedDecisionReason: null,
  registrarVerifiedBy: 'Mr. Registrar',
  registrarVerifiedAt: '2026-08-02T10:00:00',
  registrarVerificationType: 'VERIFY',
  registrationCompletedAt: null,
  handoverDate: null,
  handoverTime: null,
  handedOverBy: null,
  collectorIdType: null,
  collectorIdNumber: null,
  collectorFullName: null,
  collectorRelationship: null,
  collectorAcknowledged: null,
  registrarSignatureId: null,
  signatureAppliedAt: null,
  hasSignedFolio: false,
  signedFolioFilePath: null,
  certificateNumber: null,
  deliveryMethod: null,
  handoverRemarks: null,
  sealType: 'RED',
  sealAppliedAt: null,
  scanFilePath: null,
  hasScan: false,
  sentToRegistrarGeneral: false,
  sentToLandRegistrar: false,
  sentAt: null,
  remarks: null,
  notaryName: null,
  notaryId: null,
  instrumentNumber: null,
  instrumentDate: null,
  deedNumber: 'Deed-1001',
  attestedDate: null,
  registrarGeneralSignatureDate: null,
  createdByName: null,
  createdAt: '2026-08-01T10:00:00',
  updatedAt: '2026-08-02T10:00:00',
  parties: null,
  properties: null,
};

const renderPage = (folios: Folio[]) => {
  vi.mocked(daybookApi.getRejected).mockResolvedValue(folios);
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <RejectedDeedsPage />
    </QueryClientProvider>,
  );
};

describe('RejectedDeedsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders rejected deeds in a table', async () => {
    renderPage([rejectedFolio]);

    expect(await screen.findByText('CLB/E/000001/2026')).toBeInTheDocument();
    expect(screen.getByText('Jayasuriya Family Trust')).toBeInTheDocument();
    expect(screen.getByText('Missing trustee signature')).toBeInTheDocument();
    expect(screen.getByText('Deed-1001')).toBeInTheDocument();
  });

  it('shows an empty state when there are no rejected deeds', async () => {
    renderPage([]);
    expect(await screen.findByText('No rejected deeds found')).toBeInTheDocument();
  });

  it('shows an error state when the API request fails instead of "No data"', async () => {
    vi.mocked(daybookApi.getRejected).mockRejectedValue(new Error('Network Error'));
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={qc}>
        <RejectedDeedsPage />
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Could not load rejected deeds/)).toBeInTheDocument();
    expect(screen.queryByText('No rejected deeds found')).not.toBeInTheDocument();
  });

  it('filters by search query', async () => {
    const user = userEvent.setup();
    const second = { ...rejectedFolio, id: 2, daybookNumber: 'CLB/N/000002/2026', trustName: 'Fernando Family Trust' };
    renderPage([rejectedFolio, second]);

    await screen.findByText('CLB/E/000001/2026');
    await user.type(screen.getByPlaceholderText('Search by daybook #, deed # or trust name...'), 'Fernando');

    expect(screen.queryByText('Jayasuriya Family Trust')).not.toBeInTheDocument();
    expect(screen.getByText('Fernando Family Trust')).toBeInTheDocument();
  });

  it('opens the details modal with rejection information', async () => {
    const user = userEvent.setup();
    renderPage([rejectedFolio]);

    await screen.findByText('CLB/E/000001/2026');
    await user.click(screen.getByRole('button', { name: 'View Details' }));

    expect(await screen.findByText('Rejected Deed Details')).toBeInTheDocument();
    expect(screen.getAllByText('Missing trustee signature').length).toBeGreaterThanOrEqual(1);
  });
});
