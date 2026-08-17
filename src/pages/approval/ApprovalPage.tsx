import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { approvalApi, scanApi, certificateApi, signatureApi } from '../../api';
import { LoadingSpinner, EmptyState, StatusBadge } from '../../components/shared';
import { useAuth } from '../../contexts';
import { formatDateTime } from '../../lib/format';
import type { Folio, RegistrationCertificate } from '../../types';

type ActionType = 'register' | 'reject' | 'report' | 'sendback' | 'flag';
type TabType = 'general' | 'parties' | 'properties';
type ViewType = 'verification' | 'certificates';

export default function ApprovalPage() {
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [view, setView] = useState<ViewType>('verification');
  const [selected, setSelected] = useState<Folio | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [actionType, setActionType] = useState<ActionType | null>(null);
  const [reason, setReason] = useState('');
  const [concerns, setConcerns] = useState('');
  const [checks, setChecks] = useState({ name: false, parties: false, properties: false, notary: false });
  const [submitting, setSubmitting] = useState(false);

  const { data: pending, isLoading } = useQuery({
    queryKey: ['approval', 'pending'],
    queryFn: approvalApi.getPendingApprovals,
    refetchInterval: 30000,
  });

  const { data: mySignature } = useQuery({
    queryKey: ['signature', 'my'],
    queryFn: signatureApi.getMySignature,
    refetchInterval: 30000,
  });
  const hasActiveSignature = !!mySignature;

  const { data: certificates, isLoading: certLoading } = useQuery({
    queryKey: ['certificates', 'registry'],
    queryFn: certificateApi.getByRegistry,
    enabled: view === 'certificates',
  });

  const loadPdf = useCallback(async (folioId: number) => {
    setPdfLoading(true);
    setPdfUrl(null);
    try {
      const blob = await scanApi.getDeedFile(folioId);
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch {
      setPdfUrl(null);
    } finally {
      setPdfLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selected) {
      loadPdf(selected.id);
      setActiveTab('general');
      setActionType(null);
      setReason('');
      setConcerns('');
      setChecks({ name: false, parties: false, properties: false, notary: false });
    }
  }, [selected?.id, loadPdf]);

  useEffect(() => {
    return () => { if (pdfUrl) URL.revokeObjectURL(pdfUrl); };
  }, [pdfUrl]);

  const handleAction = async () => {
    if (!selected || !actionType) return;
    setSubmitting(true);
    try {
      if (actionType === 'register') {
        await approvalApi.verifyAndRegister(selected.id);
      } else if (actionType === 'reject') {
        await approvalApi.verifyRejected(selected.id);
      } else if (actionType === 'report') {
        await approvalApi.verifyReported(selected.id);
      } else if (actionType === 'sendback') {
        await approvalApi.sendBack(selected.id, { reason });
      } else {
        await approvalApi.flagSuspicious(selected.id, { reason, concerns });
      }
      setSelected(null);
      setActionType(null);
      setReason('');
      setConcerns('');
      queryClient.invalidateQueries({ queryKey: ['approval'] });
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
    } catch (err) {
      console.error('Action failed', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = async (cert: RegistrationCertificate) => {
    try {
      const blob = await certificateApi.download(cert.id);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch {
      alert('Could not download certificate');
    }
  };

  const isRegistryAdmin = hasRole('REGISTRY_ADMIN');

  if (!isRegistryAdmin) {
    return <div className="p-6 text-center text-red-600 font-semibold">Access denied. Registry Admin role required.</div>;
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col">
      <div className="px-6 pt-4 pb-3 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Registrar Verification</h1>
            <p className="text-sm text-gray-500 mt-0.5">Review registrar proposals and manage registration certificates</p>
          </div>
          <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setView('verification')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                view === 'verification' ? 'bg-white text-maroon-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Verification Queue
            </button>
            <button
              onClick={() => setView('certificates')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                view === 'certificates' ? 'bg-white text-maroon-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Certificates
            </button>
          </div>
        </div>
      </div>

      {/* Signature gate banner */}
      {!hasActiveSignature && (
        <div className="px-6 py-3 border-b border-amber-200 bg-amber-50">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-sm text-amber-800">
              <svg className="w-5 h-5 shrink-0 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <div>
                <p className="font-semibold">No active signature</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  You must upload your signature before you can confirm registrations. It is stamped onto signed folios and certificates.
                </p>
              </div>
            </div>
            <a
              href="/signature"
              className="shrink-0 px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-md hover:bg-amber-700 transition-colors"
            >
              Upload Signature
            </a>
          </div>
        </div>
      )}

      {view === 'verification' ? (
        <div className="flex flex-1 min-h-0">
          {/* Queue sidebar */}
          <div className="w-72 flex-shrink-0 border-r border-gray-200 bg-gray-50 overflow-y-auto">
            <div className="p-3 border-b border-gray-200 bg-white">
              <input
                placeholder="Search by trust name..."
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-maroon-600 focus:border-maroon-600"
              />
            </div>
            {isLoading ? (
              <LoadingSpinner />
            ) : !pending?.length ? (
              <EmptyState message="No pending approvals" />
            ) : (
              <div className="divide-y divide-gray-200">
                {pending.map((folio) => (
                  <button
                    key={folio.id}
                    onClick={() => setSelected(folio)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors ${
                      selected?.id === folio.id ? 'bg-maroon-50 border-l-4 border-maroon-700' : ''
                    }`}
                  >
                    <div className="font-medium text-sm text-gray-900 truncate">{folio.trustName || 'Untitled'}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Folio #{folio.folioNumber || folio.id} • {folio.daybookNumber}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-block px-1.5 py-0.5 text-[10px] font-semibold rounded ${
                        folio.approvalStatus === 'PENDING_REGISTRAR_VERIFICATION' ? 'bg-amber-100 text-amber-800' :
                        folio.approvalStatus === 'REPORTED_PENDING_VERIFICATION' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {folio.approvalStatus === 'PENDING_REGISTRAR_VERIFICATION' ? 'Register proposal' :
                         folio.approvalStatus === 'REPORTED_PENDING_VERIFICATION' ? 'Report proposal' : 'Reject proposal'}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {folio.createdAt
                          ? `${Math.round((Date.now() - new Date(folio.createdAt).getTime()) / 3600000)}h ago`
                          : ''}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Main review area */}
          <div className="flex-1 flex flex-col min-w-0">
            {!selected ? (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                Select a folio from the queue to begin review
              </div>
            ) : (
              <>
                {/* Side-by-side view */}
                <div className="flex flex-1 min-h-0">
                  {/* PDF Viewer */}
                  <div className="w-1/2 border-r border-gray-200 bg-gray-100 flex flex-col">
                    <div className="px-4 py-2 bg-white border-b border-gray-200 flex items-center justify-between text-xs text-gray-500">
                      <span className="font-medium text-gray-700">Scanned Deed Document</span>
                      {pdfUrl && (
                        <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-maroon-700 hover:underline">
                          Open in new tab
                        </a>
                      )}
                    </div>
                    <div className="flex-1 relative">
                      {pdfLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                          <LoadingSpinner />
                        </div>
                      ) : pdfUrl ? (
                        <embed src={pdfUrl} type="application/pdf" className="w-full h-full" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                          No deed scan uploaded yet
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Folio Details */}
                  <div className="w-1/2 flex flex-col">
                    <div className="px-4 py-2 bg-white border-b border-gray-200">
                      <div className="flex gap-1">
                        {(['general', 'parties', 'properties'] as const).map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-3 py-1 text-xs font-medium rounded-t transition-colors ${
                              activeTab === tab
                                ? 'bg-maroon-700 text-white'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                          >
                            {tab === 'general' ? 'General' : tab === 'parties' ? `Parties (${selected.parties?.length || 0})` : `Properties (${selected.properties?.length || 0})`}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                      {activeTab === 'general' && (
                        <div className="space-y-3">
                          <Row label="Trust Name" value={selected.trustName} />
                          <Row label="Trust Type" value={selected.trustType} />
                          <Row label="Trust Category" value={selected.trustCategory} />
                          <Row label="Folio Type" value={selected.folioType} />
                          <Row label="Volume" value={selected.volumeNumber} />
                          <Row label="Folio Number" value={selected.folioNumber} />
                          <Row label="Daybook Number" value={selected.daybookNumber} />
                          <Row label="Registry" value={selected.registryName} />
                          <Row label="Trust Address" value={selected.trustAddress} />
                          <Row label="Trust Purpose" value={selected.trustPurpose} />
                          <Row label="Remarks" value={selected.remarks} />
                          <Row label="Created By" value={selected.createdByName} />
                          <Row label="Status" value={
                            <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded bg-amber-100 text-amber-800">Pending Registrar Verification</span>
                          } />
                          {selected.proposedDecisionReason && (
                            <Row label="Proposed Reason" value={selected.proposedDecisionReason} />
                          )}
                        </div>
                      )}
                      {activeTab === 'parties' && (
                        !selected.parties?.length ? (
                          <EmptyState message="No parties recorded" />
                        ) : (
                          <div className="space-y-2">
                            {selected.parties.map((p) => (
                              <div key={p.id} className="border border-gray-200 rounded-lg p-3 text-sm">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-gray-900">{p.fullName || 'N/A'}</span>
                                  <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-blue-100 text-blue-700">{p.partyRole}</span>
                                  {p.isForeign && <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-purple-100 text-purple-700">Foreign</span>}
                                </div>
                                <div className="text-xs text-gray-500 space-y-0.5">
                                  {p.idType && <span>{p.idType}: {p.idNumber}</span>}
                                  {p.address && <div>{p.address}</div>}
                                  {p.companyRegNumber && <div>Reg: {p.companyRegNumber}</div>}
                                </div>
                              </div>
                            ))}
                          </div>
                        )
                      )}
                      {activeTab === 'properties' && (
                        !selected.properties?.length ? (
                          <EmptyState message="No properties recorded" />
                        ) : (
                          <div className="space-y-2">
                            {selected.properties.map((prop) => (
                              <div key={prop.id} className="border border-gray-200 rounded-lg p-3 text-sm">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-gray-900">{prop.propertyType}</span>
                                  {prop.amount != null && <span className="text-gray-600">- {prop.currency || 'LKR'} {prop.amount?.toLocaleString()}</span>}
                                </div>
                                <div className="text-xs text-gray-500 space-y-0.5">
                                  {prop.landRegistrationNumber && <div>Land Reg: {prop.landRegistrationNumber} ({prop.landRegistrationDepartment})</div>}
                                  {prop.landAmount != null && <div>Land: {prop.landAmount} perches</div>}
                                  {prop.vehicleDetails && <div>Vehicle: {prop.vehicleDetails}</div>}
                                  {prop.otherDescription && <div>{prop.otherDescription}</div>}
                                  {prop.propertyValue != null && <div>Value: {prop.propertyValue?.toLocaleString()}</div>}
                                </div>
                              </div>
                            ))}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* Action bar */}
                <div className="border-t border-gray-200 bg-white px-6 py-3 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Verification Checklist</p>
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
                        <input type="checkbox" checked={checks.name} onChange={(e) => setChecks(c => ({ ...c, name: e.target.checked }))} className="accent-maroon-700" />
                        Trust name matches deed
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
                        <input type="checkbox" checked={checks.parties} onChange={(e) => setChecks(c => ({ ...c, parties: e.target.checked }))} className="accent-maroon-700" />
                        Parties match deed
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
                        <input type="checkbox" checked={checks.properties} onChange={(e) => setChecks(c => ({ ...c, properties: e.target.checked }))} className="accent-maroon-700" />
                        Properties match deed
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
                        <input type="checkbox" checked={checks.notary} onChange={(e) => setChecks(c => ({ ...c, notary: e.target.checked }))} className="accent-maroon-700" />
                        Notary signature present
                      </label>
                    </div>
                  </div>

                  {actionType === 'reject' && (
                    <div>
                      <label className="text-xs font-medium text-gray-700 block mb-1">Rejection reason *</label>
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Explain why this folio is being rejected..."
                        rows={2}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-maroon-600 focus:border-maroon-600"
                      />
                    </div>
                  )}

                  {actionType === 'sendback' && (
                    <div>
                      <label className="text-xs font-medium text-gray-700 block mb-1">Correction reason *</label>
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Explain what corrections are required..."
                        rows={2}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-maroon-600 focus:border-maroon-600"
                      />
                    </div>
                  )}

                  {actionType === 'flag' && (
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs font-medium text-gray-700 block mb-1">Reason *</label>
                        <textarea
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder="Why is this suspicious?"
                          rows={2}
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-maroon-600 focus:border-maroon-600"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700 block mb-1">Specific concerns</label>
                        <textarea
                          value={concerns}
                          onChange={(e) => setConcerns(e.target.value)}
                          placeholder="Detail any discrepancies or concerns..."
                          rows={2}
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-maroon-600 focus:border-maroon-600"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {!actionType ? (
                      <>
                        {selected.approvalStatus === 'PENDING_REGISTRAR_VERIFICATION' && (
                          <button
                            onClick={() => setActionType('register')}
                            disabled={!hasActiveSignature}
                            title={hasActiveSignature ? undefined : 'Upload your signature first'}
                            className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {hasActiveSignature ? '✓ Verify & Register' : 'Upload signature first'}
                          </button>
                        )}
                        {selected.approvalStatus === 'REPORTED_PENDING_VERIFICATION' && (
                          <button
                            onClick={() => setActionType('report')}
                            className="px-4 py-2 bg-orange-600 text-white text-sm font-semibold rounded-md hover:bg-orange-700 transition-colors"
                          >
                            ✓ Confirm Report
                          </button>
                        )}
                        {selected.approvalStatus === 'REJECTED_PENDING_VERIFICATION' && (
                          <button
                            onClick={() => setActionType('reject')}
                            className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-md hover:bg-red-700 transition-colors"
                          >
                            ✓ Confirm Reject
                          </button>
                        )}
                        <button
                          onClick={() => setActionType('sendback')}
                          className="px-4 py-2 bg-amber-500 text-white text-sm font-semibold rounded-md hover:bg-amber-600 transition-colors"
                        >
                          ↩ Send Back
                        </button>
                        <button
                          onClick={() => setActionType('flag')}
                          className="px-4 py-2 bg-yellow-500 text-white text-sm font-semibold rounded-md hover:bg-yellow-600 transition-colors"
                        >
                          ! Flag Suspicious
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={handleAction}
                          disabled={submitting || (['sendback', 'reject'].includes(actionType) && !reason)}
                          className={`px-4 py-2 text-sm font-semibold rounded-md text-white transition-colors disabled:opacity-50 ${
                            actionType === 'register' ? 'bg-green-600 hover:bg-green-700' :
                            actionType === 'report' ? 'bg-orange-600 hover:bg-orange-700' :
                            actionType === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                            actionType === 'sendback' ? 'bg-amber-500 hover:bg-amber-600' :
                            'bg-yellow-500 hover:bg-yellow-600'
                          }`}
                        >
                          {submitting ? 'Processing...' : `Confirm ${actionType === 'register' ? 'Registration' : actionType === 'report' ? 'Report' : actionType === 'reject' ? 'Rejection' : actionType === 'sendback' ? 'Send Back' : 'Flag'}`}
                        </button>
                        <button
                          onClick={() => setActionType(null)}
                          className="px-4 py-2 text-sm font-semibold rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Generated certificates */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
              <h2 className="text-sm font-semibold text-gray-800">Generated Certificates</h2>
              <p className="text-xs text-gray-500 mt-0.5">All folios with a generated registration certificate</p>
            </div>
            {certLoading ? (
              <LoadingSpinner />
            ) : !certificates?.length ? (
              <EmptyState message="No certificates generated yet" />
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                    <th className="px-5 py-2.5 font-medium">Certificate #</th>
                    <th className="px-5 py-2.5 font-medium">Folio</th>
                    <th className="px-5 py-2.5 font-medium">Daybook #</th>
                    <th className="px-5 py-2.5 font-medium">Trust Name</th>
                    <th className="px-5 py-2.5 font-medium">Generated At</th>
                    <th className="px-5 py-2.5 font-medium">Expires</th>
                    <th className="px-5 py-2.5 font-medium">Status</th>
                    <th className="px-5 py-2.5 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {certificates.map((cert) => (
                    <tr key={cert.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-maroon-800">{cert.certificateNumber || cert.id}</td>
                      <td className="px-5 py-3 text-gray-700">#{cert.folioId}</td>
                      <td className="px-5 py-3 text-gray-700">{cert.daybookNumber}</td>
                      <td className="px-5 py-3 text-gray-700">{cert.trustName || '-'}</td>
                      <td className="px-5 py-3 text-gray-600">{formatDateTime(cert.issuedAt || cert.issuedDate)}</td>
                      <td className="px-5 py-3 text-gray-600">{cert.expiryDate}</td>
                      <td className="px-5 py-3"><StatusBadge status={cert.status} /></td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => handleDownload(cert)}
                          className="text-xs font-medium text-maroon-700 hover:underline"
                        >
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="text-gray-500 w-32 flex-shrink-0">{label}</span>
      <span className="text-gray-900 font-medium">{value || '-'}</span>
    </div>
  );
}
