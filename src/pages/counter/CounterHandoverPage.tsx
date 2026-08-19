import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { folioApi, certificateApi } from '../../api';
import { StatusBadge, LoadingSpinner, EmptyState, PageHeader } from '../../components/shared';
import type { Folio } from '../../types';

const ID_TYPES = [
  { value: 'NIC', label: 'NIC' },
  { value: 'PASSPORT', label: 'Passport' },
  { value: 'DRIVING_LICENSE', label: 'Driving License' },
];

const RELATIONSHIPS = [
  { value: 'TRUSTEE', label: 'Trustee' },
  { value: 'CO_TRUSTEE', label: 'Co-Trustee' },
  { value: 'AUTHOR_SETTLOR', label: 'Author / Settlor' },
  { value: 'BENEFICIARY', label: 'Beneficiary' },
  { value: 'LEGAL_REPRESENTATIVE', label: 'Legal Representative' },
  { value: 'OTHER', label: 'Other' },
];

const DELIVERY_METHODS = ['IN_PERSON', 'COURIER', 'POST', 'REGISTERED_POST'];

const EMPTY_FORM = {
  handedOverBy: '',
  collectorIdType: 'NIC',
  collectorIdNumber: '',
  collectorFullName: '',
  collectorRelationship: 'TRUSTEE',
  collectorAcknowledged: false,
  deliveryMethod: 'IN_PERSON',
  handoverRemarks: '',
};

export default function CounterHandoverPage() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Folio | null>(null);
  const [handingOver, setHandingOver] = useState(false);
  const [generatingCert, setGeneratingCert] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { data: readyFolios, isLoading } = useQuery({
    queryKey: ['handover', 'ready'],
    queryFn: folioApi.getReadyForHandover,
    refetchInterval: 15000,
  });

  const handleSelect = (folio: Folio) => {
    setSelected(folio);
    setError('');
  };

  const handleGenerateCertificate = async (folioId: number) => {
    setGeneratingCert(true);
    setError('');
    try {
      await certificateApi.issue(folioId);
      setSuccessMsg(`Certificate generated for folio #${folioId}. You can now complete the handover.`);
      setTimeout(() => setSuccessMsg(''), 6000);
      queryClient.invalidateQueries({ queryKey: ['handover'] });
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e?.message || 'Failed to generate certificate');
    } finally {
      setGeneratingCert(false);
    }
  };

  const handleDownloadCertificate = async (folioId: number) => {
    try {
      const cert = await certificateApi.getByFolioId(folioId);
      const blob = await certificateApi.download(cert.id);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch {
      setError('Could not download certificate');
    }
  };

  const handleSubmit = async () => {
    if (!selected) return;
    if (!form.collectorIdNumber.trim()) {
      setError('Collector ID number is mandatory');
      return;
    }
    if (!form.collectorAcknowledged) {
      setError('Collector must acknowledge receipt of the registered deed');
      return;
    }
    setHandingOver(true);
    setError('');
    try {
      await folioApi.completeHandover(selected.id, form);
      setSuccessMsg(`Folio ${selected.daybookNumber} handed over successfully.`);
      setTimeout(() => setSuccessMsg(''), 5000);
      setSelected(null);
      setForm(EMPTY_FORM);
      queryClient.invalidateQueries({ queryKey: ['handover'] });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e?.message || 'Failed to complete handover');
    } finally {
      setHandingOver(false);
    }
  };

  const needsCertificate = selected?.folioType === 'ORIGINAL' && !selected.certificateNumber;
  const collectorDataValid = Boolean(form.collectorIdNumber.trim()) && form.collectorAcknowledged;
  const canConfirmHandover = !needsCertificate && collectorDataValid;

  return (
    <div className="p-6 space-y-5">
      <PageHeader title="Deed Handover" description="Generate certificates and hand over registered deeds to collectors" />

      {successMsg && (
        <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Ready queue */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">Ready for Handover</h3>
            <p className="text-xs text-slate-400 mt-0.5">Registered deeds awaiting certificate generation and collection</p>
          </div>
          {isLoading ? (
            <LoadingSpinner />
          ) : !readyFolios?.length ? (
            <EmptyState message="No deeds ready for handover" />
          ) : (
            <div className="divide-y divide-slate-100 max-h-[560px] overflow-y-auto">
              {readyFolios.map((folio) => (
                <button
                  key={folio.id}
                  onClick={() => handleSelect(folio)}
                  className={`w-full text-left px-5 py-3.5 hover:bg-slate-50 transition-colors ${
                    selected?.id === folio.id ? 'bg-maroon-50 border-l-4 border-maroon-700' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-slate-900">{folio.trustName || 'Untitled'}</span>
                        {folio.certificateNumber ? (
                          <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">
                            {folio.certificateNumber}
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">
                            No certificate
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Folio #{folio.folioNumber || folio.id} • {folio.daybookNumber}
                      </div>
                    </div>
                    <StatusBadge status={folio.approvalStatus} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Handover form */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-5 h-fit">
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Complete Handover</h3>
          <p className="text-xs text-slate-400 mb-4">
            {selected ? `Recording handover for ${selected.daybookNumber}` : 'Select a folio from the queue to begin'}
          </p>

          {selected && (
            <div className="space-y-4">
              {/* Certificate section */}
              {selected.folioType === 'ORIGINAL' && (
                <div className="px-3 py-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <p className="text-xs font-semibold text-slate-700 mb-2">Registration Certificate</p>
                  {selected.certificateNumber ? (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono text-emerald-700">{selected.certificateNumber}</span>
                      <button
                        onClick={() => handleDownloadCertificate(selected.id)}
                        className="text-xs font-medium text-maroon-700 hover:underline"
                      >
                        Download PDF
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-500">Not yet generated</span>
                      <button
                        onClick={() => handleGenerateCertificate(selected.id)}
                        disabled={generatingCert}
                        className="px-3 py-1.5 bg-maroon-800 text-white text-xs font-semibold rounded-md hover:bg-maroon-900 disabled:opacity-50 transition-colors"
                      >
                        {generatingCert ? 'Generating...' : 'Generate Certificate'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Counter Officer *</label>
                <input
                  type="text"
                  value={form.handedOverBy}
                  onChange={(e) => setForm({ ...form, handedOverBy: e.target.value })}
                  placeholder="Name of counter officer handling handover"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Collector Full Name *</label>
                <input
                  type="text"
                  value={form.collectorFullName}
                  onChange={(e) => setForm({ ...form, collectorFullName: e.target.value })}
                  placeholder="Full name of the person collecting the deed"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Collector Relationship to Trust</label>
                <select
                  value={form.collectorRelationship}
                  onChange={(e) => setForm({ ...form, collectorRelationship: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
                >
                  {RELATIONSHIPS.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Collector ID Type</label>
                <select
                  value={form.collectorIdType}
                  onChange={(e) => setForm({ ...form, collectorIdType: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
                >
                  {ID_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Collector ID Number *</label>
                <input
                  type="text"
                  value={form.collectorIdNumber}
                  onChange={(e) => setForm({ ...form, collectorIdNumber: e.target.value })}
                  placeholder="NIC / Passport number"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Delivery Method</label>
                <select
                  value={form.deliveryMethod}
                  onChange={(e) => setForm({ ...form, deliveryMethod: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
                >
                  {DELIVERY_METHODS.map((m) => (
                    <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Remarks</label>
                <textarea
                  value={form.handoverRemarks}
                  onChange={(e) => setForm({ ...form, handoverRemarks: e.target.value })}
                  rows={2}
                  placeholder="Optional notes about this handover"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
                />
              </div>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.collectorAcknowledged}
                  onChange={(e) => setForm({ ...form, collectorAcknowledged: e.target.checked })}
                  className="mt-0.5 accent-maroon-700"
                />
                <span className="text-xs text-slate-600">
                  The collector acknowledges receipt of the registered trust deed and certificate. *
                </span>
              </label>

              {error && (
                <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">{error}</div>
              )}

              <button
                onClick={handleSubmit}
                disabled={handingOver || !canConfirmHandover}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-maroon-700 to-maroon-600 hover:from-maroon-800 hover:to-maroon-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors disabled:cursor-not-allowed cursor-pointer"
              >
                {needsCertificate
                  ? 'Generate certificate before handover'
                  : handingOver ? 'Recording...' : 'Confirm Handover'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
