import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CompletedHandoversPage from '../pages/counter/CompletedHandoversPage';
import { daybookApi } from '../api';
import type { Folio } from '../types';

vi.mock('../api', () => ({
  daybookApi: {
    getCompletedHandovers: vi.fn(),
  },
}));

const handedOverFolio: Folio = {
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
  approvalStatus: 'HANDED_OVER',
  rejectionReason: null,
  reportReason: null,
  proposedDecision: 'REGISTER',
  proposedDecisionReason: null,
  registrarVerifiedBy: 'Mr. Registrar',
  registrarVerifiedAt: '2026-08-02T10:00:00',
  registrarVerificationType: 'VERIFY',
  registrationCompletedAt: '2026-08-02T10:00:00',
  handoverDate: '2026-08-03T10:00:00',
  handoverTime: '10:00',
  handedOverBy: 'Counter User 1',
  collectorIdType: 'NIC',
  collectorIdNumber: '900101234V',
  collectorFullName: 'Nimal Perera',
  collectorRelationship: 'Son',
  collectorAcknowledged: true,
  registrarSignatureId: 9,
  signatureAppliedAt: '2026-08-02T10:00:00',
  hasSignedFolio: true,
  signedFolioFilePath: null,
  certificateNumber: 'CERT-1001',
  deliveryMethod: 'IN_PERSON',
  handoverRemarks: null,
  sealType: 'RED',
  sealAppliedAt: '2026-08-02T10:00:00',
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
  updatedAt: '2026-08-03T10:00:00',
  parties: null,
  properties: null,
};

const renderPage = (folios: Folio[]) => {
  vi.mocked(daybookApi.getCompletedHandovers).mockResolvedValue(folios);
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <CompletedHandoversPage />
    </QueryClientProvider>,
  );
};

describe('CompletedHandoversPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders handed-over deeds with collector and handover details', async () => {
    renderPage([handedOverFolio]);

    expect(await screen.findByText('Folio-0001')).toBeInTheDocument();
    expect(screen.getByText('CLB/E/000001/2026')).toBeInTheDocument();
    expect(screen.getByText('Nimal Perera')).toBeInTheDocument();
    expect(screen.getByText('NIC: 900101234V')).toBeInTheDocument();
    expect(screen.getByText('IN PERSON')).toBeInTheDocument();
  });

  it('shows an empty state when there are no completed handovers', async () => {
    renderPage([]);
    expect(await screen.findByText('No completed handovers yet')).toBeInTheDocument();
  });

  it('shows an error state when the API request fails instead of "No data"', async () => {
    vi.mocked(daybookApi.getCompletedHandovers).mockRejectedValue(new Error('Network Error'));
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={qc}>
        <CompletedHandoversPage />
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Could not load completed handovers/)).toBeInTheDocument();
    expect(screen.queryByText('No completed handovers yet')).not.toBeInTheDocument();
  });

  it('filters by collector or folio', async () => {
    const user = userEvent.setup();
    const second = { ...handedOverFolio, id: 2, daybookNumber: 'CLB/N/000002/2026', collectorFullName: 'Kumari Silva', folioNumber: 'Folio-0002' };
    renderPage([handedOverFolio, second]);

    await screen.findByText('Folio-0001');
    await user.type(screen.getByPlaceholderText('Search by folio, daybook, deed, trust or collector...'), 'Kumari');

    expect(screen.queryByText('Folio-0001')).not.toBeInTheDocument();
    expect(screen.getByText('Folio-0002')).toBeInTheDocument();
  });

  it('clarifies that each deed is handed over only once', async () => {
    renderPage([handedOverFolio]);
    expect(
      await screen.findByText(/Each deed can be handed over only once/),
    ).toBeInTheDocument();
  });
});
