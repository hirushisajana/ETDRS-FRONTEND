import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SixMonthUpdateForm from '../pages/counter/SixMonthUpdateForm';
import { daybookApi } from '../api';
import type { DaybookEntry } from '../types';

vi.mock('../api', () => ({
  daybookApi: {
    getByDaybookNumber: vi.fn(),
    createUpdate: vi.fn(),
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
  status: 'REGISTERED',
  emailSent: null,
  suspiciousFlag: false,
  createdBy: null,
  createdByName: null,
  createdAt: '2026-08-01T10:00:00',
  updatedAt: '2026-08-01T10:00:00',
};

const renderForm = (onSuccess = vi.fn()) =>
  render(<SixMonthUpdateForm onSuccess={onSuccess} />);

describe('SixMonthUpdateForm lookup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('finds a registered original deed', async () => {
    vi.mocked(daybookApi.getByDaybookNumber).mockResolvedValue(baseEntry);
    const user = userEvent.setup();

    renderForm();
    await user.type(
      screen.getByPlaceholderText('e.g. KAN/E/000001/2026'),
      'clb/e/1/2026',
    );
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

  it('shows an eligibility message instead of not found for non-REGISTERED deeds', async () => {
    vi.mocked(daybookApi.getByDaybookNumber).mockResolvedValue({
      ...baseEntry,
      status: 'PENDING',
    });
    const user = userEvent.setup();

    renderForm();
    await user.type(screen.getByPlaceholderText('e.g. KAN/E/000001/2026'), 'CLB/E/000001/2026');
    await user.click(screen.getByRole('button', { name: 'Lookup' }));

    await waitFor(() => {
      expect(
        screen.getByText(/is not eligible for a six-month update \(current status: PENDING\)/i),
      ).toBeInTheDocument();
      expect(screen.queryByText('Daybook number not found')).not.toBeInTheDocument();
    });
  });

  it('submits the update with client details prefilled from the original', async () => {
    vi.mocked(daybookApi.getByDaybookNumber).mockResolvedValue(baseEntry);
    vi.mocked(daybookApi.createUpdate).mockResolvedValue(baseEntry);
    const user = userEvent.setup();
    const onSuccess = vi.fn();

    renderForm(onSuccess);
    await user.type(screen.getByPlaceholderText('e.g. KAN/E/000001/2026'), 'CLB/E/000001/2026');
    fireEvent.click(screen.getByRole('button', { name: 'Lookup' }));

    expect(await screen.findByText('Original Deed — CLB/E/000001/2026')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Create Six-Month Update' }));

    await waitFor(() => {
      expect(daybookApi.createUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ originalDaybookNumber: 'CLB/E/000001/2026' }),
      );
    });
    expect(onSuccess).toHaveBeenCalled();
  });
});
