import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RecentEntriesPage from '../pages/counter/RecentEntriesPage';
import { daybookApi } from '../api';
import type { DaybookEntry, ReceiptResponse } from '../types';

vi.mock('../api', () => ({
  daybookApi: {
    getRecent: vi.fn(),
    getReceipt: vi.fn(),
    resendReceipt: vi.fn(),
  },
}));

const entry = (id: number, daybookNumber: string, status: DaybookEntry['status']): DaybookEntry => ({
  id,
  daybookNumber,
  registryId: 5,
  trustType: 'EXPRESS',
  sequenceNumber: id,
  year: 2026,
  trustCategory: 'LOCAL',
  entryType: 'ORIGINAL',
  originalDaybookNumber: null,
  quarterlyUpdateNumber: null,
  clientName: `Client ${id}`,
  clientEmail: 'client@example.com',
  clientTelephone: '0771234567',
  deedNumber: `Deed-${id}`,
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
  status,
  emailSent: null,
  suspiciousFlag: false,
  createdBy: null,
  createdAt: '2026-08-01T10:00:00',
  updatedAt: '2026-08-01T10:00:00',
});

const renderPage = (entries: DaybookEntry[]) => {
  vi.mocked(daybookApi.getRecent).mockResolvedValue(entries);
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <RecentEntriesPage />
    </QueryClientProvider>,
  );
};

describe('RecentEntriesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders recent entries in a table', async () => {
    renderPage([entry(1, 'CLB/E/000001/2026', 'REGISTERED'), entry(2, 'CLB/E/000002/2026', 'PENDING')]);

    expect(await screen.findByText('CLB/E/000001/2026')).toBeInTheDocument();
    expect(screen.getByText('CLB/E/000002/2026')).toBeInTheDocument();
    expect(screen.getByText('Client 1')).toBeInTheDocument();
    expect(screen.getByText('Client 2')).toBeInTheDocument();
  });

  it('shows an empty state when there are no entries', async () => {
    renderPage([]);
    expect(await screen.findByText('No entries found')).toBeInTheDocument();
  });

  it('shows an error state when the API request fails instead of "No data"', async () => {
    vi.mocked(daybookApi.getRecent).mockRejectedValue(new Error('Network Error'));
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={qc}>
        <RecentEntriesPage />
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Could not load recent entries/)).toBeInTheDocument();
    expect(screen.queryByText('No entries found')).not.toBeInTheDocument();
  });

  it('filters entries by search query', async () => {
    const user = userEvent.setup();
    renderPage([entry(1, 'CLB/E/000001/2026', 'REGISTERED'), entry(2, 'CLB/E/000002/2026', 'PENDING')]);

    await screen.findByText('CLB/E/000002/2026');
    await user.type(screen.getByPlaceholderText('Search by daybook #, client or deed #...'), '000002');

    expect(screen.queryByText('CLB/E/000001/2026')).not.toBeInTheDocument();
    expect(screen.getByText('CLB/E/000002/2026')).toBeInTheDocument();
  });

  it('opens a receipt modal when View is clicked', async () => {
    const receipt: ReceiptResponse = {
      registryName: 'Colombo Land Registry',
      clientName: 'Client 1',
      daybookNumber: 'CLB/E/000001/2026',
      deedNumber: 'Deed-1',
      registrationFee: 1500,
      serviceType: 'ONE_DAY',
      receiptDelivery: 'EMAIL',
      generatedAt: '2026-08-01T10:00:00',
    };
    vi.mocked(daybookApi.getReceipt).mockResolvedValue(receipt);
    const user = userEvent.setup();

    renderPage([entry(1, 'CLB/E/000001/2026', 'REGISTERED')]);

    await screen.findByText('CLB/E/000001/2026');
    await user.click(screen.getByRole('button', { name: 'View' }));

    expect(await screen.findByText(/Receipt — CLB\/E\/000001\/2026/)).toBeInTheDocument();
  });

  it('resends a receipt email', async () => {
    vi.mocked(daybookApi.resendReceipt).mockResolvedValue(undefined);
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const user = userEvent.setup();

    renderPage([entry(1, 'CLB/E/000001/2026', 'REGISTERED')]);

    await screen.findByText('CLB/E/000001/2026');
    await user.click(screen.getByRole('button', { name: 'Resend' }));

    expect(daybookApi.resendReceipt).toHaveBeenCalledWith(1);
    expect(alertSpy).toHaveBeenCalledWith('Receipt email resent to client@example.com');
    alertSpy.mockRestore();
  });
});
