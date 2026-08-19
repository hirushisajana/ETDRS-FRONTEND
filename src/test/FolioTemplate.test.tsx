import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FolioTemplate from '../components/folio/FolioTemplate';
import type { Folio } from '../types';

function makeFolio(overrides: Partial<Folio> = {}): Folio {
  return {
    id: 1,
    daybookEntryId: 1,
    daybookNumber: 'DB-1',
    registryId: 5,
    registryName: 'Colombo Land Registry',
    registryCode: 'CLB',
    trustType: 'EXPRESS',
    trustCategory: 'LOCAL',
    folioType: 'ORIGINAL',
    year: 2026,
    volumeNumber: 'V1',
    folioNumber: 'F1',
    broughtForwardVolume: null,
    broughtForwardFolio: null,
    trustName: 'Test Trust',
    trustAddress: 'Colombo',
    trustPurpose: 'Investment',
    purposeFormat: 'PARAGRAPH',
    updateDetails: null,
    approvalStatus: 'PENDING',
    rejectionReason: null,
    reportReason: null,
    proposedDecision: null,
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
    hasSignedFolio: null,
    signedFolioFilePath: null,
    certificateNumber: null,
    deliveryMethod: null,
    handoverRemarks: null,
    sealType: null,
    sealAppliedAt: null,
    scanFilePath: null,
    hasScan: null,
    sentToRegistrarGeneral: null,
    sentToLandRegistrar: null,
    sentAt: null,
    remarks: null,
    notaryName: null,
    notaryId: null,
    instrumentNumber: null,
    instrumentDate: null,
    deedNumber: null,
    attestedDate: null,
    registrarGeneralSignatureDate: null,
    createdByName: 'FOLIO USER',
    createdAt: '2026-08-01T10:00:00',
    updatedAt: '2026-08-01T10:00:00',
    parties: null,
    properties: null,
    ...overrides,
  };
}

describe('FolioTemplate', () => {
  it('does not render the registrar verification section when the folio has not been signed', () => {
    render(<FolioTemplate folio={makeFolio()} />);
    expect(screen.queryByText('Registrar Verification')).not.toBeInTheDocument();
    expect(screen.queryByText(/REJECTED SEAL/)).not.toBeInTheDocument();
  });

  it('renders the red rejection seal and signature details for a rejected folio', () => {
    const folio = makeFolio({
      approvalStatus: 'REJECTED',
      registrarVerifiedBy: 'Nimal Perera',
      registrarVerificationType: 'REJECTED',
      signatureAppliedAt: '2026-08-02T10:00:00',
      sealType: 'RED',
      sealAppliedAt: '2026-08-02T10:00:00',
    });

    render(<FolioTemplate folio={folio} />);

    expect(screen.getByText('Registrar Verification')).toBeInTheDocument();
    expect(screen.getByText(/Nimal Perera/)).toBeInTheDocument();
    expect(screen.getAllByText('02/08/2026').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('REJECTED SEAL')).toBeInTheDocument();
  });

  it('renders signature and date only for a REGISTERED folio — no seal or stamp', () => {
    const folio = makeFolio({
      approvalStatus: 'REGISTERED',
      registrarVerifiedBy: 'Nimal Perera',
      registrarVerificationType: 'REGISTERED',
      signatureAppliedAt: '2026-08-02T10:00:00',
      sealType: null,
      sealAppliedAt: null,
    });

    render(<FolioTemplate folio={folio} />);

    expect(screen.getByText('Registrar Verification')).toBeInTheDocument();
    expect(screen.getByText(/Nimal Perera/)).toBeInTheDocument();
    expect(screen.getAllByText('02/08/2026').length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText(/REJECTED SEAL/)).not.toBeInTheDocument();
    expect(screen.queryByText(/REGISTERED STAMP/)).not.toBeInTheDocument();
  });

  it('renders signature and date only for a READY_FOR_HANDOVER folio — no seal', () => {
    const folio = makeFolio({
      approvalStatus: 'READY_FOR_HANDOVER',
      registrarVerifiedBy: 'Nimal Perera',
      registrarVerificationType: 'REGISTERED',
      signatureAppliedAt: '2026-08-02T10:00:00',
      sealType: null,
      sealAppliedAt: null,
    });

    render(<FolioTemplate folio={folio} />);

    expect(screen.getByText('Registrar Verification')).toBeInTheDocument();
    expect(screen.getByText(/Nimal Perera/)).toBeInTheDocument();
    expect(screen.queryByText(/REJECTED SEAL/)).not.toBeInTheDocument();
    expect(screen.queryByText(/REGISTERED STAMP/)).not.toBeInTheDocument();
  });

  it('does not render the registrar verification section for a REPORTED folio', () => {
    const folio = makeFolio({
      approvalStatus: 'REPORTED',
      registrarVerifiedBy: 'Nimal Perera',
      registrarVerificationType: 'REPORTED',
      signatureAppliedAt: '2026-08-02T10:00:00',
      sealType: null,
      sealAppliedAt: null,
    });

    render(<FolioTemplate folio={folio} />);

    expect(screen.queryByText('Registrar Verification')).not.toBeInTheDocument();
    expect(screen.queryByText(/REJECTED SEAL/)).not.toBeInTheDocument();
  });

  it('does not render the registrar verification section for a PENDING_CORRECTION folio', () => {
    const folio = makeFolio({
      approvalStatus: 'PENDING_CORRECTION',
      registrarVerifiedBy: 'Nimal Perera',
      registrarVerificationType: 'CORRECTION_REQUIRED',
      signatureAppliedAt: '2026-08-02T10:00:00',
      sealType: 'RED',
      sealAppliedAt: '2026-08-02T10:00:00',
    });

    render(<FolioTemplate folio={folio} />);

    expect(screen.queryByText('Registrar Verification')).not.toBeInTheDocument();
    expect(screen.queryByText(/REJECTED SEAL/)).not.toBeInTheDocument();
  });
});