import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CounterHandoverPage from '../pages/counter/CounterHandoverPage';
import { folioApi } from '../api';
import type { Folio } from '../types';

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
  sealType: 'GREEN',
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

  it('allows handover when ORIGINAL folio already has a certificate', async () => {
    renderPage([{ ...baseFolio, certificateNumber: 'TR-CLB-2026-00001' }]);

    const queueButton = await screen.findByText('Jayasuriya Family Trust');
    await userEvent.click(queueButton);

    const confirmButton = screen.getByRole('button', { name: 'Confirm Handover' });
    expect(confirmButton).toBeEnabled();
    expect(screen.getByText('Download PDF')).toBeInTheDocument();
  });

  it('requires collector ID number before handover', async () => {
    renderPage([{ ...baseFolio, certificateNumber: 'TR-CLB-2026-00001' }]);
    const user = userEvent.setup();

    const queueButton = await screen.findByText('Jayasuriya Family Trust');
    await user.click(queueButton);

    await user.click(screen.getByRole('button', { name: 'Confirm Handover' }));

    await waitFor(() => {
      expect(screen.getByText('Collector ID number is mandatory')).toBeInTheDocument();
    });
    expect(folioApi.completeHandover).not.toHaveBeenCalled();
  });

  it('requires collector acknowledgement before handover', async () => {
    renderPage([{ ...baseFolio, certificateNumber: 'TR-CLB-2026-00001' }]);
    const user = userEvent.setup();

    const queueButton = await screen.findByText('Jayasuriya Family Trust');
    await user.click(queueButton);

    await user.type(screen.getByPlaceholderText('NIC / Passport number'), '912345678V');
    await user.click(screen.getByRole('button', { name: 'Confirm Handover' }));

    await waitFor(() => {
      expect(screen.getByText(/collector acknowledges receipt/i)).toBeInTheDocument();
      expect(
        screen.getByText('Collector must acknowledge receipt of the registered deed'),
      ).toBeInTheDocument();
    });
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
});
