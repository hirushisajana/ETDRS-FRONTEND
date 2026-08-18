import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResubmissionForm from '../pages/counter/ResubmissionForm';
import { daybookApi } from '../api';
import type { DaybookEntry } from '../types';

vi.mock('../api', () => ({
  daybookApi: {
    getByDaybookNumber: vi.fn(),
    createResubmission: vi.fn(),
  },
}));

const baseEntry: DaybookEntry = {
  id: 1,
  daybookNumber: 'CLB/E/000001/2026',
  registryId: 5,
  trustType: 'EXPRESS',
  sequenceNumber: 1,
  year: 2026,
  trustCategory: 'LOCAL',
  entryType: 'ORIGINAL',
  originalDaybookNumber: null,
  quarterlyUpdateNumber: null,
  clientName: 'Jayasuriya Family',
  clientEmail: 'client@example.com',
  clientTelephone: '0771234567',
  deedNumber: 'Deed-1001',
  serviceType: 'ONE_DAY',
  registrationFee: 1500,
  receiptDelivery: 'EMAIL',
  deedType: null,
  submitterName: null,
  submitterAddress: null,
  attestedDate: null,
  language: null,
  notaryId: 1,
  notaryName: 'Mr. Notary',
  valueOfAmount: null,
  numberOfLots: null,
  division: null,
  volume: null,
  folioRef: null,
  returnDate: null,
  acceptorSignature: null,
  acceptorDate: null,
  registrarInitials: null,
  remarks: null,
  folioRejectionReason: null,
  status: 'PENDING_CORRECTION',
  emailSent: null,
  suspiciousFlag: false,
  createdBy: null,
  createdAt: '2026-08-01T10:00:00',
  updatedAt: '2026-08-01T10:00:00',
};

const renderForm = (onSuccess = vi.fn()) =>
  render(<ResubmissionForm onSuccess={onSuccess} />);

describe('ResubmissionForm lookup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('finds an eligible deed pending correction', async () => {
    vi.mocked(daybookApi.getByDaybookNumber).mockResolvedValue(baseEntry);
    const user = userEvent.setup();

    renderForm();
    await user.type(screen.getByPlaceholderText('e.g. KAN/E/000001/2026'), 'clb/e/1/2026');
    await user.click(screen.getByRole('button', { name: 'Lookup' }));

    expect(daybookApi.getByDaybookNumber).toHaveBeenCalledWith('CLB/E/1/2026');
    expect(await screen.findByText('Original Deed — CLB/E/000001/2026')).toBeInTheDocument();
  });

  it('shows not found when no matching record exists', async () => {
    vi.mocked(daybookApi.getByDaybookNumber).mockRejectedValue(new Error('not found'));
    const user = userEvent.setup();

    renderForm();
    await user.type(screen.getByPlaceholderText('e.g. KAN/E/000001/2026'), 'CLB/E/999999/2026');
    await user.click(screen.getByRole('button', { name: 'Lookup' }));

    await waitFor(() => {
      expect(screen.getByText('Daybook number not found')).toBeInTheDocument();
    });
  });

  it('shows a specific message for rejected deeds', async () => {
    vi.mocked(daybookApi.getByDaybookNumber).mockResolvedValue({
      ...baseEntry,
      status: 'REJECTED',
    });
    const user = userEvent.setup();

    renderForm();
    await user.type(screen.getByPlaceholderText('e.g. KAN/E/000001/2026'), 'CLB/E/000001/2026');
    await user.click(screen.getByRole('button', { name: 'Lookup' }));

    await waitFor(() => {
      expect(screen.getByText('This deed has been rejected and cannot be re-submitted')).toBeInTheDocument();
    });
  });

  it('shows an exact reason for other ineligible statuses instead of not found', async () => {
    vi.mocked(daybookApi.getByDaybookNumber).mockResolvedValue({
      ...baseEntry,
      status: 'REGISTERED',
    });
    const user = userEvent.setup();

    renderForm();
    await user.type(screen.getByPlaceholderText('e.g. KAN/E/000001/2026'), 'CLB/E/000001/2026');
    await user.click(screen.getByRole('button', { name: 'Lookup' }));

    await waitFor(() => {
      expect(
        screen.getByText(/is not eligible for re-submission \(current status: REGISTERED\)/i),
      ).toBeInTheDocument();
      expect(screen.queryByText('Daybook number not found')).not.toBeInTheDocument();
    });
  });
});
