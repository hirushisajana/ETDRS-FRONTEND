import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import DaybookListPage from '../pages/daybook/DaybookListPage';
import { daybookApi } from '../api';
import type { DaybookEntry } from '../types';

vi.mock('../api', () => ({
  daybookApi: { getByYear: vi.fn() },
}));

vi.mock('../contexts', () => ({
  useAuth: () => ({ user: { registryName: 'Colombo Land Registry' } }),
}));

function makeEntry(id: number, daybookNumber: string, status: DaybookEntry['status'], trustType: DaybookEntry['trustType']): DaybookEntry {
  return {
    id,
    daybookNumber,
    registryId: 5,
    trustType,
    sequenceNumber: id,
    year: 2026,
    trustCategory: 'LOCAL',
    entryType: 'ORIGINAL',
    originalDaybookNumber: null,
    quarterlyUpdateNumber: null,
    clientName: `Client ${id}`,
    clientEmail: null,
    clientTelephone: null,
    deedNumber: `Deed-${id}`,
    serviceType: 'ONE_DAY',
    registrationFee: 1500,
    receiptDelivery: 'EMAIL',
    deedType: 'Trust Deed',
    submitterName: `Submitter ${id}`,
    submitterAddress: null,
    attestedDate: null,
    language: 'Sinhala',
    notaryId: 1,
    notaryName: 'Mr. Notary',
    valueOfAmount: 250000,
    numberOfLots: 1,
    division: 'Kolonnawa',
    volume: 'V1',
    folioRef: 'F1',
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
    createdByName: 'FOLIO USER',
    createdAt: '2026-08-01T10:00:00',
    updatedAt: '2026-08-01T10:00:00',
  };
}

const renderPage = (entries: DaybookEntry[]) => {
  vi.mocked(daybookApi.getByYear).mockResolvedValue(entries);
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <DaybookListPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe('DaybookListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders entries grouped into the two register books', async () => {
    renderPage([
      makeEntry(1, 'CLB/E/000001/2026', 'REGISTERED', 'EXPRESS'),
      makeEntry(2, 'CLB/N/000001/2026', 'PENDING', 'NORMAL'),
    ]);

    expect(await screen.findByText('CLB/E/000001/2026')).toBeInTheDocument();
    expect(screen.getByText('CLB/N/000001/2026')).toBeInTheDocument();
    expect(screen.getByText('Book I — Express Trusts')).toBeInTheDocument();
    expect(screen.getByText('Book II — Normal Trusts')).toBeInTheDocument();
  });

  it('shows status hints for registration and handover states', async () => {
    renderPage([
      makeEntry(1, 'CLB/E/000001/2026', 'READY_FOR_HANDOVER', 'EXPRESS'),
      makeEntry(2, 'CLB/E/000002/2026', 'HANDED_OVER', 'EXPRESS'),
    ]);

    expect(await screen.findByText('Ready for handover')).toBeInTheDocument();
    expect(screen.getByText('Handed over')).toBeInTheDocument();
  });

  it('filters entries by status', async () => {
    const user = userEvent.setup();
    renderPage([
      makeEntry(1, 'CLB/E/000001/2026', 'REGISTERED', 'EXPRESS'),
      makeEntry(2, 'CLB/E/000002/2026', 'PENDING', 'EXPRESS'),
    ]);

    expect(await screen.findByText('CLB/E/000001/2026')).toBeInTheDocument();
    expect(screen.getByText('CLB/E/000002/2026')).toBeInTheDocument();

    await user.selectOptions(screen.getByDisplayValue('All Statuses'), 'REGISTERED');

    expect(screen.getByText('CLB/E/000001/2026')).toBeInTheDocument();
    expect(screen.queryByText('CLB/E/000002/2026')).not.toBeInTheDocument();
  });

  it('shows an empty state when there are no entries for the year', async () => {
    renderPage([]);
    expect(await screen.findByText('No daybook entries found for 2026')).toBeInTheDocument();
  });

  it('triggers printing when the print button is clicked', async () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => undefined);
    const user = userEvent.setup();
    renderPage([makeEntry(1, 'CLB/E/000001/2026', 'REGISTERED', 'EXPRESS')]);

    expect(await screen.findByText('CLB/E/000001/2026')).toBeInTheDocument();
    await user.click(screen.getByText('Print Register'));

    expect(printSpy).toHaveBeenCalledTimes(1);
    printSpy.mockRestore();
  });
});