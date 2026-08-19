import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CounterHandoverPage from '../pages/counter/CounterHandoverPage';
import { folioApi, certificateApi } from '../api';
import type { Folio, RegistrationCertificate } from '../types';

vi.mock('../api', () => ({
  folioApi: {
    getReadyForHandover: vi.fn(),
    completeHandover: vi.fn(),
  },
  certificateApi: {
    getByFolioId: vi.fn(),
    download: vi.fn(),
    issue: vi.fn(),
  },
}));

const baseFolio: Folio = {
  id: 1,
  daybookEntryId: 1,
  daybookNumber: 'DB-2026-0001',
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
  approvalStatus: 'READY_FOR_HANDOVER',
  rejectionReason: null,
  reportReason: null,
  proposedDecision: 'REGISTER',
  proposedDecisionReason: null,
  registrarVerifiedBy: null,
  registrarVerifiedAt: null,
  registrarVerificationType: null,
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
  hasSignedFolio: true,
  signedFolioFilePath: '/tmp/signed.pdf',
  certificateNumber: null,
  deliveryMethod: null,
  handoverRemarks: null,
  sealType: null,
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
  updatedAt: '2026-08-01T10:00:00',
  parties: null,
  properties: null,
};

const renderPage = (folios: Folio[]) => {
  vi.mocked(folioApi.getReadyForHandover).mockResolvedValue(folios);
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <CounterHandoverPage />
    </QueryClientProvider>,
  );
};

describe('CounterHandoverPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows empty state when no folios ready', async () => {
    renderPage([]);
    expect(await screen.findByText('No deeds ready for handover')).toBeInTheDocument();
  });

  it('blocks handover for ORIGINAL folio without certificate', async () => {
    renderPage([{ ...baseFolio, certificateNumber: null }]);

    const queueButton = await screen.findByText('Jayasuriya Family Trust');
    await userEvent.click(queueButton);

    const confirmButton = screen.getByRole('button', {
      name: 'Generate certificate before handover',
    });
    expect(confirmButton).toBeDisabled();

    await screen.findByText('Generate Certificate');
  });

  it('enables handover only after certificate AND valid collector data', async () => {
    renderPage([{ ...baseFolio, certificateNumber: 'TR-CLB-2026-00001' }]);
    const user = userEvent.setup();

    const queueButton = await screen.findByText('Jayasuriya Family Trust');
    await user.click(queueButton);

    const confirmButton = () => screen.getByRole('button', { name: 'Confirm Handover' });

    // Certificate exists but collector data missing -> disabled
    expect(confirmButton()).toBeDisabled();
    expect(screen.getByText('Download PDF')).toBeInTheDocument();

    // Still disabled with only an ID
    await user.type(screen.getByPlaceholderText('NIC / Passport number'), '912345678V');
    expect(confirmButton()).toBeDisabled();

    // Enabled only once acknowledged
    await user.click(screen.getByRole('checkbox'));
    expect(confirmButton()).toBeEnabled();
  });

  it('keeps handover disabled until collector ID number is provided', async () => {
    renderPage([{ ...baseFolio, certificateNumber: 'TR-CLB-2026-00001' }]);
    const user = userEvent.setup();

    const queueButton = await screen.findByText('Jayasuriya Family Trust');
    await user.click(queueButton);

    // Acknowledge but leave ID blank
    await user.click(screen.getByRole('checkbox'));
    const confirmButton = screen.getByRole('button', { name: 'Confirm Handover' });
    expect(confirmButton).toBeDisabled();

    // Typing a valid ID enables it
    await user.type(screen.getByPlaceholderText('NIC / Passport number'), '912345678V');
    expect(confirmButton).toBeEnabled();
    expect(folioApi.completeHandover).not.toHaveBeenCalled();
  });

  it('keeps handover disabled until collector acknowledges receipt', async () => {
    renderPage([{ ...baseFolio, certificateNumber: 'TR-CLB-2026-00001' }]);
    const user = userEvent.setup();

    const queueButton = await screen.findByText('Jayasuriya Family Trust');
    await user.click(queueButton);

    // ID provided but no acknowledgement
    await user.type(screen.getByPlaceholderText('NIC / Passport number'), '912345678V');
    const confirmButton = screen.getByRole('button', { name: 'Confirm Handover' });
    expect(confirmButton).toBeDisabled();

    await user.click(screen.getByRole('checkbox'));
    expect(confirmButton).toBeEnabled();
    expect(folioApi.completeHandover).not.toHaveBeenCalled();
  });

  it('submits handover with certificate and shows success', async () => {
    vi.mocked(folioApi.completeHandover).mockResolvedValue({ ...baseFolio, approvalStatus: 'HANDED_OVER' });
    renderPage([{ ...baseFolio, certificateNumber: 'TR-CLB-2026-00001' }]);
    const user = userEvent.setup();

    const queueButton = await screen.findByText('Jayasuriya Family Trust');
    await user.click(queueButton);

    await user.type(screen.getByPlaceholderText('Name of counter officer handling handover'), 'Chaminda');
    await user.type(screen.getByPlaceholderText('Full name of the person collecting the deed'), 'John Collector');
    await user.type(screen.getByPlaceholderText('NIC / Passport number'), '912345678V');
    await user.click(screen.getByRole('checkbox'));

    await user.click(screen.getByRole('button', { name: 'Confirm Handover' }));

    await waitFor(() => {
      expect(folioApi.completeHandover).toHaveBeenCalledWith(1, expect.objectContaining({
        collectorIdNumber: '912345678V',
        collectorFullName: 'John Collector',
        collectorAcknowledged: true,
      }));
    });
    expect(await screen.findByText(/handed over successfully/)).toBeInTheDocument();
  });

  it('generating a certificate does not complete handover', async () => {
    vi.mocked(certificateApi.issue).mockResolvedValue({ id: 9 } as unknown as RegistrationCertificate);
    renderPage([{ ...baseFolio, certificateNumber: null }]);
    const user = userEvent.setup();

    const queueButton = await screen.findByText('Jayasuriya Family Trust');
    await user.click(queueButton);

    await user.click(screen.getByRole('button', { name: 'Generate Certificate' }));

    await waitFor(() => {
      expect(certificateApi.issue).toHaveBeenCalledWith(1);
      expect(folioApi.completeHandover).not.toHaveBeenCalled();
    });
    expect(await screen.findByText(/You can now complete the handover/)).toBeInTheDocument();
  });

  it('hides Generate and offers Download once a certificate already exists', async () => {
    renderPage([{ ...baseFolio, certificateNumber: 'TR-CLB-2026-00001' }]);
    const user = userEvent.setup();

    const queueButton = await screen.findByText('Jayasuriya Family Trust');
    await user.click(queueButton);

    expect(screen.queryByRole('button', { name: 'Generate Certificate' })).not.toBeInTheDocument();
    expect(screen.getByText('Download PDF')).toBeInTheDocument();
  });

  it('opens the backend certificate PDF for preview and print', async () => {
    const createObjectURLSpy = vi.fn(() => 'blob:cert-42');
    globalThis.URL.createObjectURL = createObjectURLSpy as unknown as typeof URL.createObjectURL;
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    const fakeCert = {
      id: 42,
      folioId: 1,
      daybookNumber: 'DB-2026-0001',
      certificateNumber: 'TR-CLB-2026-00001',
      trustName: 'Jayasuriya Family Trust',
      registryId: 5,
      registryName: 'Colombo Land Registry',
      issuedBy: 'Registrar General',
      issuedByUserId: 2,
      issuedDate: '2026-08-19',
      expiryDate: '2031-08-19',
      issuedAt: null,
      status: 'ACTIVE' as const,
      certificateType: 'ORIGINAL' as const,
      active: true,
      originalCertificateId: null,
      renewedFromCertificateId: null,
      renewalAlertSent: false,
      daysUntilExpiry: 1825,
      createdAt: '2026-08-19T09:00:00',
      updatedAt: '2026-08-19T09:00:00',
    } as RegistrationCertificate;
    vi.mocked(certificateApi.getByFolioId).mockResolvedValue(fakeCert);
    vi.mocked(certificateApi.download).mockResolvedValue(new Blob(['%PDF'], { type: 'application/pdf' }));

    renderPage([{ ...baseFolio, certificateNumber: 'TR-CLB-2026-00001' }]);
    const user = userEvent.setup();

    const queueButton = await screen.findByText('Jayasuriya Family Trust');
    await user.click(queueButton);

    await user.click(screen.getByRole('button', { name: 'Download PDF' }));

    await waitFor(() => {
      expect(certificateApi.getByFolioId).toHaveBeenCalledWith(1);
      expect(certificateApi.download).toHaveBeenCalledWith(42);
      expect(createObjectURLSpy).toHaveBeenCalled();
      expect(openSpy).toHaveBeenCalledWith('blob:cert-42', '_blank');
    });
  });
});
