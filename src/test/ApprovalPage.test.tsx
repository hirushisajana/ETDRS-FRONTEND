import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ApprovalPage from '../pages/approval/ApprovalPage';
import { approvalApi, scanApi, signatureApi, suspiciousApi } from '../api';
import type { Folio, RegistrarSignature, SuspiciousReport } from '../types';

vi.mock('../api', () => ({
  approvalApi: {
    getPendingApprovals: vi.fn(),
    verifyAndRegister: vi.fn(),
    verifyRejected: vi.fn(),
    verifyReported: vi.fn(),
    sendBack: vi.fn(),
    flagSuspicious: vi.fn(),
  },
  scanApi: {
    getDeedFile: vi.fn(),
  },
  certificateApi: {
    getByRegistry: vi.fn(),
    download: vi.fn(),
  },
  signatureApi: {
    getMySignature: vi.fn(),
  },
  suspiciousApi: {
    getAll: vi.fn(),
    verifyReport: vi.fn(),
  },
}));

vi.mock('../contexts', () => ({
  useAuth: () => ({
    hasRole: (role: string) => role === 'REGISTRY_ADMIN',
  }),
}));

const pendingFolio: Folio = {
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
  approvalStatus: 'PENDING_REGISTRAR_VERIFICATION',
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
  hasSignedFolio: false,
  signedFolioFilePath: null,
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
  parties: [],
  properties: [],
};

const mockSignature: RegistrarSignature = {
  id: 1,
  adminUserId: 10,
  registryId: 5,
  registryCode: 'CLB',
  registryName: 'Colombo Land Registry',
  fileName: 'sig.png',
  fileSize: 20480,
  active: true,
  createdAt: '2026-08-01 10:00:00',
  updatedAt: '2026-08-01 10:00:00',
};

const mockReport: SuspiciousReport = {
  id: 7,
  daybookEntryId: 1,
  folioId: 1,
  registryId: 5,
  reportedBy: 20,
  reportedByName: 'Folio User',
  verifiedByName: null,
  verifiedAt: null,
  reason: 'Identity mismatch',
  concerns: 'FRAUD',
  trustName: 'Jayasuriya Family Trust',
  partiesSummary: null,
  deedScanPath: null,
  reportStatus: 'SUBMITTED',
  sentToDefence: false,
  sentToDefenceAt: null,
  sentToFiu: false,
  sentToFiuAt: null,
  createdAt: '2026-08-01T10:00:00',
  updatedAt: '2026-08-01T10:00:00',
};

const renderPage = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <ApprovalPage />
    </QueryClientProvider>,
  );
};

describe('ApprovalPage signature gate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(approvalApi.getPendingApprovals).mockResolvedValue([pendingFolio]);
    vi.mocked(scanApi.getDeedFile).mockResolvedValue(new Blob());
    vi.mocked(suspiciousApi.getAll).mockResolvedValue([]);
  });

  it('shows the signature-gate banner when no active signature exists', async () => {
    vi.mocked(signatureApi.getMySignature).mockResolvedValue(null);

    renderPage();

    expect(await screen.findByText('No active signature')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Upload Signature' })).toHaveAttribute('href', '/signature');
  });

  it('hides the banner when an active signature exists', async () => {
    vi.mocked(signatureApi.getMySignature).mockResolvedValue(mockSignature);

    renderPage();

    await screen.findByText('Jayasuriya Family Trust');
    expect(screen.queryByText('No active signature')).not.toBeInTheDocument();
  });

  it('disables the Verify & Register button when no signature exists', async () => {
    vi.mocked(signatureApi.getMySignature).mockResolvedValue(null);

    renderPage();

    const queueItem = await screen.findByText('Jayasuriya Family Trust');
    await userEvent.click(queueItem);

    const registerBtn = await screen.findByRole('button', { name: 'Upload signature first' });
    expect(registerBtn).toBeDisabled();
    expect(approvalApi.verifyAndRegister).not.toHaveBeenCalled();
  });

  it('enables Verify & Register when an active signature exists', async () => {
    vi.mocked(signatureApi.getMySignature).mockResolvedValue(mockSignature);

    renderPage();

    const queueItem = await screen.findByText('Jayasuriya Family Trust');
    await userEvent.click(queueItem);

    const registerBtn = await screen.findByRole('button', { name: '✓ Verify & Register' });
    expect(registerBtn).toBeEnabled();
  });

  it('verifies a suspicious proposal from the Suspicious Reports tab', async () => {
    vi.mocked(signatureApi.getMySignature).mockResolvedValue(mockSignature);
    vi.mocked(suspiciousApi.getAll).mockResolvedValue([mockReport]);

    renderPage();

    await userEvent.click(await screen.findByText('Suspicious Reports'));

    expect(await screen.findByText('Jayasuriya Family Trust')).toBeInTheDocument();
    expect(screen.getByText('Identity mismatch')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '✓ Verify' }));
    expect(suspiciousApi.verifyReport).toHaveBeenCalledWith(7);
  });
});
