import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DayBookTemplate from '../components/daybook/DayBookTemplate';
import type { DaybookEntry } from '../types';

function makeEntry(overrides: Partial<DaybookEntry> = {}): DaybookEntry {
  return {
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
    clientName: 'Ruwan Silva',
    clientEmail: 'ruwan@example.com',
    clientTelephone: '0771234567',
    deedNumber: 'D-1001',
    serviceType: 'ONE_DAY',
    registrationFee: 1500,
    receiptDelivery: 'EMAIL',
    deedType: 'Trust Deed',
    submitterName: 'Kasun Perera',
    submitterAddress: 'Colombo',
    attestedDate: '2026-08-02',
    language: 'Sinhala',
    notaryId: 1,
    notaryName: 'Mr. Nimal',
    valueOfAmount: 1250000,
    numberOfLots: 2,
    division: 'Colombo North',
    volume: 'V1',
    folioRef: 'F1',
    returnDate: null,
    acceptorSignature: null,
    acceptorDate: null,
    registrarInitials: null,
    remarks: 'Priority processing requested.',
    folioRejectionReason: null,
    status: 'DAYBOOK_ENTERED',
    emailSent: true,
    suspiciousFlag: false,
    createdBy: null,
    createdByName: 'FOLIO USER',
    createdAt: '2026-08-01T10:00:00',
    updatedAt: '2026-08-02T10:00:00',
    ...overrides,
  };
}

describe('DayBookTemplate', () => {
  it('renders the official register header and entry reference', () => {
    render(<DayBookTemplate entry={makeEntry()} />);

    expect(screen.getByText('Day Book of Entries')).toBeInTheDocument();
    expect(screen.getAllByText('CLB/E/000001/2026').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Registrar General\'s Department — Sri Lanka')).toBeInTheDocument();
  });

  it('renders key entry fields with formatted money values', () => {
    render(<DayBookTemplate entry={makeEntry()} />);

    expect(screen.getByText('Trust Deed')).toBeInTheDocument();
    expect(screen.getByText('D-1001')).toBeInTheDocument();
    expect(screen.getByText('Mr. Nimal')).toBeInTheDocument();
    expect(screen.getByText('Rs 1,250,000')).toBeInTheDocument();
    expect(screen.getByText('Rs 1,500')).toBeInTheDocument();
    expect(screen.getByText('Colombo North')).toBeInTheDocument();
    expect(screen.getByText('"Priority processing requested."')).toBeInTheDocument();
  });

  it('shows dashes for unset fields', () => {
    render(<DayBookTemplate entry={makeEntry({ returnDate: null, acceptorSignature: null }) } />);

    expect(screen.getAllByText('-').length).toBeGreaterThan(0);
  });

  it('shows the status badge and a descriptive hint for day book statuses', () => {
    render(<DayBookTemplate entry={makeEntry({ status: 'DAYBOOK_ENTERED' })} />);

    expect(screen.getAllByText('DAYBOOK_ENTERED').length).toBeGreaterThan(0);
    expect(screen.getByText(/Day book data entered — folio being prepared/)).toBeInTheDocument();
  });

  it('shows the handover hint for a HANDED_OVER entry', () => {
    render(<DayBookTemplate entry={makeEntry({ status: 'HANDED_OVER' })} />);

    expect(screen.getAllByText('HANDED_OVER').length).toBeGreaterThan(0);
    expect(screen.getByText('Handed over')).toBeInTheDocument();
  });

  it('renders the recorded-by footer', () => {
    render(<DayBookTemplate entry={makeEntry()} />);

    expect(screen.getByText(/Recorded by: FOLIO USER/)).toBeInTheDocument();
  });
});