import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CompletedHandoversPage from '../pages/counter/CompletedHandoversPage';
import { daybookApi, certificateApi } from '../api';
import type { Folio, RegistrationCertificate } from '../types';

vi.mock('../api', () => ({
  daybookApi: {
    getCompletedHandovers: vi.fn(),
  },
  certificateApi: {
    getByFolioId: vi.fn(),
    download: vi.fn(),
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

  it('shows the certificate number and opens the PDF for a handed-over deed', async () => {
    const createObjectURLSpy = vi.fn(() => 'blob:completed-cert');
    globalThis.URL.createObjectURL = createObjectURLSpy as unknown as typeof URL.createObjectURL;
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    const fakeCert = {
      id: 7,
      folioId: 1,
      daybookNumber: 'CLB/E/000001/2026',
      certificateNumber: 'CERT-1001',
      trustName: 'Jayasuriya Family Trust',
      registryId: 5,
      registryName: 'Colombo Land Registry',
      issuedBy: 'Registrar General',
      issuedByUserId: 2,
      issuedDate: '2026-08-02',
      expiryDate: '2031-08-02',
      issuedAt: null,
      status: 'ACTIVE' as const,
      certificateType: 'ORIGINAL' as const,
      active: true,
      originalCertificateId: null,
      renewedFromCertificateId: null,
      renewalAlertSent: false,
      daysUntilExpiry: 1825,
      createdAt: '2026-08-02T10:00:00',
      updatedAt: '2026-08-03T10:00:00',
    } as RegistrationCertificate;
    vi.mocked(certificateApi.getByFolioId).mockResolvedValue(fakeCert);
    vi.mocked(certificateApi.download).mockResolvedValue(new Blob(['%PDF'], { type: 'application/pdf' }));

    renderPage([handedOverFolio]);
    const user = userEvent.setup();

    await screen.findByText('Folio-0001');
    expect(screen.getByText('CERT-1001')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'View / Print' }));

    await waitFor(() => {
      expect(certificateApi.getByFolioId).toHaveBeenCalledWith(1);
      expect(certificateApi.download).toHaveBeenCalledWith(7);
      expect(openSpy).toHaveBeenCalledWith('blob:completed-cert', '_blank');
    });
  });

  it('clarifies that each deed is handed over only once', async () => {
    renderPage([handedOverFolio]);
    expect(
      await screen.findByText(/Each deed can be handed over only once/),
    ).toBeInTheDocument();
  });
});
