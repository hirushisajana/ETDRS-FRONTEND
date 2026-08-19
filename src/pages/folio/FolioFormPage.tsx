import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { folioApi, notaryApi, scanApi, certificateApi } from '../../api';
import { LoadingSpinner } from '../../components/shared';
import type { Party, PartyRequest, Property, PropertyRequest, NotaryResponse, Folio } from '../../types';

type FormSection = 'basic' | 'parties' | 'beneficiaries' | 'properties' | 'review';

interface PartyForm {
  partyRole: string;
  partyType: string;
  beneficiaryType: string;
  fullName: string;
  idType: string;
  idNumber: string;
  companyRegNumber: string;
  address: string;
  foreignAddress: string;
  isForeign: boolean;
  groupDescription: string;
}

interface PropertyForm {
  propertyType: string;
  amount: string;
  currency: string;
  landAmount: string;
  landRegistrationNumber: string;
  landRegistrationDepartment: string;
  vehicleDetails: string;
  otherDescription: string;
  propertyValue: string;
}

const initialPartyForm: PartyForm = {
  partyRole: '', partyType: '', beneficiaryType: '',
  fullName: '', idType: '', idNumber: '', companyRegNumber: '',
  address: '', foreignAddress: '', isForeign: false, groupDescription: '',
};

const initialPropertyForm: PropertyForm = {
  propertyType: '', amount: '', currency: '',
  landAmount: '', landRegistrationNumber: '', landRegistrationDepartment: '',
  vehicleDetails: '', otherDescription: '', propertyValue: '',
};

export default function FolioFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const registerAfterCorrection = searchParams.get('registerAfterCorrection') === 'true';
  const folioId = Number(id);
  const [section, setSection] = useState<FormSection>('basic');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [registeredAfterCorrection, setRegisteredAfterCorrection] = useState<Folio | null>(null);
  const [certIssuing, setCertIssuing] = useState(false);
  const [certError, setCertError] = useState('');

  // Basic fields
  const [trustCategory, setTrustCategory] = useState('LOCAL');
  const [volumeNumber, setVolumeNumber] = useState('');
  const [folioNumber, setFolioNumber] = useState('');
  const [broughtForwardVolume, setBroughtForwardVolume] = useState('');
  const [broughtForwardFolio, setBroughtForwardFolio] = useState('');
  const [trustName, setTrustName] = useState('');
  const [trustAddress, setTrustAddress] = useState('');
  const [purposeFormat, setPurposeFormat] = useState<'POINTS' | 'PARAGRAPH'>('PARAGRAPH');
  const [trustPurpose, setTrustPurpose] = useState('');
  const [instrumentNumber, setInstrumentNumber] = useState('');
  const [instrumentDate, setInstrumentDate] = useState('');
  const [registrarGenDate, setRegistrarGenDate] = useState('');
  const [remarks, setRemarks] = useState('');

  // Notary
  const [notaryQuery, setNotaryQuery] = useState('');
  const [notarySearchResults, setNotarySearchResults] = useState<NotaryResponse[]>([]);
  const [selectedNotary, setSelectedNotary] = useState<NotaryResponse | null>(null);
  const [showNotaryDropdown, setShowNotaryDropdown] = useState(false);
  const [notarySearching, setNotarySearching] = useState(false);

  // Parties
  const [parties, setParties] = useState<Party[]>([]);
  const [partyFormOpen, setPartyFormOpen] = useState(false);
  const [partyForm, setPartyForm] = useState<PartyForm>(initialPartyForm);
  const [editingPartyId, setEditingPartyId] = useState<number | null>(null);

  // Properties
  const [properties, setProperties] = useState<Property[]>([]);
  const [propFormOpen, setPropFormOpen] = useState(false);
  const [propForm, setPropForm] = useState<PropertyForm>(initialPropertyForm);
  const [editingPropId, setEditingPropId] = useState<number | null>(null);

  // Deed upload
  const [deedFile, setDeedFile] = useState<File | null>(null);
  const [deedUploading, setDeedUploading] = useState(false);
  const [deedFileName, setDeedFileName] = useState<string | null>(null);

  // Signed folio
  const [signedFolioLoading, setSignedFolioLoading] = useState(false);

  // Confirm dialogs
  const [confirmAction, setConfirmAction] = useState<'submit' | 'report' | 'reject' | null>(null);
  const [actionReason, setActionReason] = useState('');

  // Suspicious flag
  const [showSuspiciousDialog, setShowSuspiciousDialog] = useState(false);
  const [suspiciousReason, setSuspiciousReason] = useState('');
  const [suspiciousConcerns, setSuspiciousConcerns] = useState<string[]>([]);
  const [suspiciousSubmitting, setSuspiciousSubmitting] = useState(false);

  const { data: folio, isLoading: folioLoading } = useQuery({
    queryKey: ['folio', folioId],
    queryFn: () => folioApi.getById(folioId),
  });

  const [prevFolio, setPrevFolio] = useState<Folio | null>(null);
  if (folio && folio !== prevFolio) {
    setPrevFolio(folio);
    if (folio.scanFilePath) setDeedFileName(folio.scanFilePath);
    setTrustCategory(folio.trustCategory || 'LOCAL');
    setVolumeNumber(folio.volumeNumber || '');
    setFolioNumber(folio.folioNumber || '');
    setBroughtForwardVolume(folio.broughtForwardVolume || '');
    setBroughtForwardFolio(folio.broughtForwardFolio || '');
    setTrustName(folio.trustName || '');
    setTrustAddress(folio.trustAddress || '');
    setPurposeFormat((folio.purposeFormat as 'POINTS' | 'PARAGRAPH') || 'PARAGRAPH');
    setTrustPurpose(folio.trustPurpose || '');
    setRemarks(folio.remarks || '');
    setInstrumentNumber(folio.deedNumber || '');
    setInstrumentDate(folio.attestedDate || '');
    setNotaryQuery(folio.notaryName || '');
  }

  useEffect(() => {
    if (!folioId) return;
    folioApi.getParties(folioId).then(setParties).catch(() => {});
    folioApi.getProperties(folioId).then(setProperties).catch(() => {});
  }, [folioId]);

  const handleNotarySearch = useCallback(async (q: string) => {
    setNotaryQuery(q);
    setSelectedNotary(null);
    if (q.length < 2) { setNotarySearchResults([]); setShowNotaryDropdown(false); return; }
    setNotarySearching(true);
    try {
      const results = await notaryApi.search(q);
      setNotarySearchResults(results);
      setShowNotaryDropdown(results.length > 0);
    } catch { setNotarySearchResults([]); setShowNotaryDropdown(false); }
    finally { setNotarySearching(false); }
  }, []);

  async function handleDeedUpload() {
    if (!deedFile) return;
    setDeedUploading(true);
    setError('');
    try {
      await scanApi.uploadDeed(folioId, deedFile);
      setDeedFileName(deedFile.name);
      setDeedFile(null);
    } catch (err: unknown) {
      const e = err as { message?: string };
      console.error('Deed upload error:', e?.message);
      setError(e?.message || 'Failed to upload deed');
    } finally {
      setDeedUploading(false);
    }
  }

  async function handleViewSignedFolio() {
    setSignedFolioLoading(true);
    setError('');
    try {
      const blob = await folioApi.getSignedFolioPdf(folioId);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e?.message || 'Failed to load signed folio');
    } finally {
      setSignedFolioLoading(false);
    }
  }

  function selectNotary(n: NotaryResponse) {
    setSelectedNotary(n);
    setNotaryQuery(n.fullName);
    setShowNotaryDropdown(false);
  }

  function getNotaryStatus() {
    if (!selectedNotary) return null;
    if (selectedNotary.status === 'ACTIVE') return { label: 'Verified — ACTIVE', style: 'text-green-700 bg-green-50 border-green-300' };
    return { label: `BLOCKED — ${selectedNotary.status}`, style: 'text-red-700 bg-red-50 border-red-300' };
  }

  async function saveFolioBasic() {
    setError('');
    try {
      await folioApi.update(folioId, {
        trustCategory,
        broughtForwardVolume, broughtForwardFolio,
        trustName, trustAddress,
        trustPurpose, purposeFormat,
        notaryId: selectedNotary?.id,
        registrarGeneralSignatureDate: registrarGenDate,
        remarks,
      });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e?.message || 'Failed to save folio data');
      throw err;
    }
  }

  const submitMutation = useMutation({
    mutationFn: async (action: 'submit' | 'report' | 'reject') => {
      await saveFolioBasic();
      if (action === 'submit') return folioApi.submit(folioId);
      if (action === 'report') return folioApi.report(folioId, actionReason);
      return folioApi.reject(folioId, actionReason);
    },
    onSuccess: (_, action) => {
      queryClient.invalidateQueries({ queryKey: ['folio'] });
      setActionReason('');
      setSuccessMsg(
        action === 'submit' ? 'Folio submitted for scanning' :
        action === 'report' ? 'Folio reported. Notary will be notified.' :
        'Folio rejected'
      );
      setTimeout(() => navigate(action === 'report' ? '/folio/records' : '/folio'), 1500);
    },
    onError: (err: unknown) => {
      const e = err as { message?: string };
      setError(e?.message || 'Action failed');
    },
  });

  const registerCorrectionMutation = useMutation({
    mutationFn: () => folioApi.registerAfterCorrection(folioId),
    onSuccess: (registered) => {
      queryClient.invalidateQueries({ queryKey: ['folio'] });
      setSuccessMsg('Folio registered after correction');
      setRegisteredAfterCorrection(registered);
      setCertError('');
    },
    onError: (err: unknown) => {
      const e = err as { message?: string };
      setError(e?.message || 'Failed to register folio');
    },
  });

  const handleGenerateCertificate = async (folioId: number) => {
    setCertIssuing(true);
    setCertError('');
    try {
      await certificateApi.issue(folioId);
      setCertIssuing(false);
      setRegisteredAfterCorrection(null);
      setSuccessMsg('Registration certificate generated successfully');
      queryClient.invalidateQueries({ queryKey: ['folio'] });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setCertError(e?.message || 'Failed to generate certificate');
      setCertIssuing(false);
    }
  };

  async function handleAddParty(e: React.FormEvent) {
    e.preventDefault();
    try {
      const partyType = partyForm.partyRole === 'BENEFICIARY'
        ? ({ DIRECT: 'INDIVIDUAL', INDIRECT: 'GROUP', COMPANY: 'COMPANY' } as const)[partyForm.beneficiaryType] || ''
        : partyForm.partyType;
      const body: PartyRequest = {
        partyRole: partyForm.partyRole,
        partyType,
        fullName: partyForm.fullName,
        address: partyForm.address,
      };
      if (partyForm.beneficiaryType) body.beneficiaryType = partyForm.beneficiaryType;
      if (partyForm.idType) body.idType = partyForm.idType;
      if (partyForm.idNumber) body.idNumber = partyForm.idNumber;
      if (partyForm.companyRegNumber) body.companyRegNumber = partyForm.companyRegNumber;
      if (partyForm.foreignAddress) body.foreignAddress = partyForm.foreignAddress;
      if (partyForm.isForeign) body.isForeign = partyForm.isForeign;
      if (partyForm.groupDescription) body.groupDescription = partyForm.groupDescription;

      if (editingPartyId) {
        await folioApi.updateParty(folioId, editingPartyId, body);
      } else {
        await folioApi.addParty(folioId, body);
      }
      const updated = await folioApi.getParties(folioId);
      setParties(updated);
      setPartyFormOpen(false);
      setEditingPartyId(null);
      setPartyForm(initialPartyForm);
    } catch (err: unknown) {
      const e = err as { message?: string };
      console.error('Add party error:', e?.message);
      alert(e?.message || 'Failed to save party');
    }
  }

  async function handleRemoveParty(partyId: number) {
    try {
      await folioApi.removeParty(folioId, partyId);
      setParties((prev) => prev.filter((p) => p.id !== partyId));
    } catch (err: unknown) {
      const e = err as { message?: string };
      console.error('Remove party error:', e?.message);
      alert(e?.message || 'Failed to remove party');
    }
  }

  function editParty(p: Party) {
    setPartyForm({
      partyRole: p.partyRole, partyType: p.partyType,
      beneficiaryType: p.beneficiaryType || '',
      fullName: p.fullName || '', idType: p.idType || '',
      idNumber: p.idNumber || '', companyRegNumber: p.companyRegNumber || '',
      address: p.address || '', foreignAddress: p.foreignAddress || '',
      isForeign: p.isForeign,
      groupDescription: p.groupDescription || '',
    });
    setEditingPartyId(p.id);
    setPartyFormOpen(true);
  }

  async function handleAddProperty(e: React.FormEvent) {
    e.preventDefault();
    try {
      const body: PropertyRequest = {
        propertyType: propForm.propertyType,
      };
      if (propForm.amount) body.amount = parseFloat(propForm.amount);
      if (propForm.currency) body.currency = propForm.currency;
      if (propForm.landAmount) body.landAmount = parseFloat(propForm.landAmount);
      if (propForm.landRegistrationNumber) body.landRegistrationNumber = propForm.landRegistrationNumber;
      if (propForm.landRegistrationDepartment) body.landRegistrationDepartment = propForm.landRegistrationDepartment;
      if (propForm.vehicleDetails) body.vehicleDetails = propForm.vehicleDetails;
      if (propForm.otherDescription) body.otherDescription = propForm.otherDescription;
      if (propForm.propertyValue) body.propertyValue = parseFloat(propForm.propertyValue);

      if (editingPropId) {
        await folioApi.updateProperty(folioId, editingPropId, body);
      } else {
        await folioApi.addProperty(folioId, body);
      }
      const updated = await folioApi.getProperties(folioId);
      setProperties(updated);
      setPropFormOpen(false);
      setEditingPropId(null);
      setPropForm(initialPropertyForm);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      alert(axiosErr?.response?.data?.message || 'Failed to save property');
    }
  }

  async function handleRemoveProperty(propId: number) {
    try {
      await folioApi.removeProperty(folioId, propId);
      setProperties((prev) => prev.filter((p) => p.id !== propId));
    } catch { alert('Failed to remove property'); }
  }

  function editProperty(p: Property) {
    setPropForm({
      propertyType: p.propertyType,
      amount: p.amount?.toString() || '',
      currency: p.currency || '',
      landAmount: p.landAmount?.toString() || '',
      landRegistrationNumber: p.landRegistrationNumber || '',
      landRegistrationDepartment: p.landRegistrationDepartment || '',
      vehicleDetails: p.vehicleDetails || '',
      otherDescription: p.otherDescription || '',
      propertyValue: p.propertyValue?.toString() || '',
    });
    setEditingPropId(p.id);
    setPropFormOpen(true);
  }

  function handleConfirmAction() {
    if (!confirmAction) return;
    if ((confirmAction === 'report' || confirmAction === 'reject') && !actionReason.trim()) {
      setError('Reason is required');
      return;
    }
    setError('');
    submitMutation.mutate(confirmAction);
    setConfirmAction(null);
  }

  if (folioLoading) return <LoadingSpinner />;
  if (!folio) return <div className="p-6 text-slate-500">Folio not found</div>;

  const notaryStatus = getNotaryStatus();
  const isBlocked = selectedNotary && selectedNotary.status !== 'ACTIVE';
  const loading = submitMutation.isPending;

  function renderPartyFormFields() {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Party Type</label>
          <select value={partyForm.partyType} onChange={(e) => setPartyForm({ ...partyForm, partyType: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 outline-none" required>
            <option value="">Select</option>
            <option value="INDIVIDUAL">Individual</option>
            <option value="COMPANY">Company</option>
            <option value="GROUP">Group</option>
          </select>
        </div>
        {partyForm.partyType === 'INDIVIDUAL' && (
          <>
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
              <input value={partyForm.fullName} onChange={(e) => setPartyForm({ ...partyForm, fullName: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">ID Type</label>
              <select value={partyForm.idType} onChange={(e) => setPartyForm({ ...partyForm, idType: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 outline-none">
                <option value="">Select</option>
                <option value="NIC">NIC</option>
                <option value="PASSPORT">Passport</option>
                <option value="DRIVING_LICENCE">Driving Licence</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">ID Number</label>
              <input value={partyForm.idNumber} onChange={(e) => setPartyForm({ ...partyForm, idNumber: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Address</label>
              <input value={partyForm.address} onChange={(e) => setPartyForm({ ...partyForm, address: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 outline-none" />
            </div>
            {partyForm.idType === 'PASSPORT' && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Foreign Address</label>
                <input value={partyForm.foreignAddress} onChange={(e) => setPartyForm({ ...partyForm, foreignAddress: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 outline-none" />
              </div>
            )}
          </>
        )}
        {partyForm.partyType === 'COMPANY' && (
          <>
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Company Name</label>
              <input value={partyForm.fullName} onChange={(e) => setPartyForm({ ...partyForm, fullName: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Company Reg. Number</label>
              <input value={partyForm.companyRegNumber} onChange={(e) => setPartyForm({ ...partyForm, companyRegNumber: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Address</label>
              <input value={partyForm.address} onChange={(e) => setPartyForm({ ...partyForm, address: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 outline-none" />
            </div>
          </>
        )}
        {partyForm.partyType === 'GROUP' && (
          <div className="lg:col-span-3">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Group Description</label>
            <textarea value={partyForm.groupDescription} onChange={(e) => setPartyForm({ ...partyForm, groupDescription: e.target.value })}
              rows={3} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 outline-none resize-none" />
          </div>
        )}
      </div>
    );
  }

  const roleLabels: Record<string, string> = {
    AUTHOR_SETTLOR: 'Author / Settlor',
    TRUSTEE: 'Trustee',
    CO_TRUSTEE: 'Co-Trustee',
    BENEFICIARY: 'Beneficiary',
    BENEFICIAL_OWNER: 'Beneficial Owner',
  };

  const propertyTypeLabels: Record<string, string> = {
    MONEY: 'Money',
    LAND: 'Land',
    VEHICLE: 'Vehicle',
    OTHER: 'Other',
  };

  function renderPropertyFormFields() {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Property Type</label>
          <select value={propForm.propertyType} onChange={(e) => setPropForm({ ...propForm, propertyType: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 outline-none" required>
            <option value="">Select</option>
            <option value="MONEY">Money</option>
            <option value="LAND">Land</option>
            <option value="VEHICLE">Vehicle</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        {propForm.propertyType === 'MONEY' && (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Amount</label>
              <input type="number" step="0.01" value={propForm.amount} onChange={(e) => setPropForm({ ...propForm, amount: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Currency</label>
              <input value={propForm.currency} onChange={(e) => setPropForm({ ...propForm, currency: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 outline-none" placeholder="LKR" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Description</label>
              <input value={propForm.otherDescription} onChange={(e) => setPropForm({ ...propForm, otherDescription: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 outline-none" />
            </div>
          </>
        )}
        {propForm.propertyType === 'LAND' && (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Land Amount (perches)</label>
              <input type="number" step="0.01" value={propForm.landAmount} onChange={(e) => setPropForm({ ...propForm, landAmount: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Registration Number</label>
              <input value={propForm.landRegistrationNumber} onChange={(e) => setPropForm({ ...propForm, landRegistrationNumber: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Registration Department</label>
              <input value={propForm.landRegistrationDepartment} onChange={(e) => setPropForm({ ...propForm, landRegistrationDepartment: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Property Value</label>
              <input type="number" step="0.01" value={propForm.propertyValue} onChange={(e) => setPropForm({ ...propForm, propertyValue: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 outline-none" />
            </div>
          </>
        )}
        {propForm.propertyType === 'VEHICLE' && (
          <>
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Vehicle Details</label>
              <textarea value={propForm.vehicleDetails} onChange={(e) => setPropForm({ ...propForm, vehicleDetails: e.target.value })}
                rows={2} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 outline-none resize-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Property Value</label>
              <input type="number" step="0.01" value={propForm.propertyValue} onChange={(e) => setPropForm({ ...propForm, propertyValue: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 outline-none" />
            </div>
          </>
        )}
        {propForm.propertyType === 'OTHER' && (
          <>
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Description</label>
              <textarea value={propForm.otherDescription} onChange={(e) => setPropForm({ ...propForm, otherDescription: e.target.value })}
                rows={2} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 outline-none resize-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Property Value</label>
              <input type="number" step="0.01" value={propForm.propertyValue} onChange={(e) => setPropForm({ ...propForm, propertyValue: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 outline-none" />
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/folio')} className="text-slate-400 hover:text-slate-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h1 className="text-xl font-semibold text-slate-900">Folio Entry</h1>
          </div>
          <p className="text-sm text-slate-400 mt-0.5">
            Daybook #{folio.daybookNumber} &bull; {folio.trustType === 'EXPRESS' ? 'Express Trust' : 'Normal Trust'} &bull; {folio.trustCategory}
          </p>
        </div>
        <StatusBadge status={folio.approvalStatus} />
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}
      {successMsg && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{successMsg}</div>
      )}
      {registeredAfterCorrection && (
        <div className="mb-4 p-5 bg-green-50 border border-green-200 rounded-2xl">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="text-green-800 font-semibold">Folio registered successfully</h3>
              <p className="text-sm text-green-700 mt-0.5">
                The folio is ready for handover. Generate the registration certificate to finalize it.
              </p>
              {certError && <p className="text-sm text-red-600 mt-1">{certError}</p>}
            </div>
            <button
              onClick={() => handleGenerateCertificate(folio.id)}
              disabled={certIssuing}
              className="px-5 py-2.5 bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors disabled:cursor-not-allowed cursor-pointer"
            >
              {certIssuing ? 'Generating...' : 'Generate Registration Certificate'}
            </button>
          </div>
        </div>
      )}

      {/* Section tabs */}
      <div className="flex gap-1 mb-6 border-b border-slate-200">
        {(['basic', 'parties', 'beneficiaries', 'properties', 'review'] as FormSection[]).map((s) => (
          <button
            key={s}
            onClick={() => setSection(s)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              section === s ? 'text-blue-700 border-blue-700' : 'text-slate-500 border-transparent hover:text-slate-700'
            }`}
          >
            {s === 'basic' ? 'Basic Info' :
             s === 'parties' ? `Parties (${parties.length})` :
             s === 'beneficiaries' ? `Beneficiaries (${parties.filter(p => p.partyRole === 'BENEFICIARY').length})` :
             s === 'properties' ? `Properties (${properties.length})` :
             'Review & Submit'}
          </button>
        ))}
      </div>

      {/* Section: Basic Info */}
      {section === 'basic' && (
        <div className="space-y-6">
          {/* Registry & Volume */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="px-5 py-3.5 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">Registry & Volume Reference</h2>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Land Registry</label>
                <p className="text-sm font-medium text-slate-900 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                  {folio.registryName || '—'} ({folio.registryCode || '—'})
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Trust Category</label>
                <select value={trustCategory} onChange={(e) => setTrustCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 outline-none">
                  <option value="LOCAL">Local</option>
                  <option value="FOREIGN">Foreign</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Folio Number (Auto-generated)</label>
                <p className="text-sm font-medium text-slate-900 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                  {volumeNumber || '—'}/{folioNumber || '—'}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Brought Forward Volume</label>
                <input value={broughtForwardVolume} onChange={(e) => setBroughtForwardVolume(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Brought Forward Folio</label>
                <input value={broughtForwardFolio} onChange={(e) => setBroughtForwardFolio(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 outline-none" />
              </div>
            </div>
          </div>

          {/* Trust Details */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="px-5 py-3.5 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">Trust Details</h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Trust Name</label>
                  <input value={trustName} onChange={(e) => setTrustName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Trust Address</label>
                  <input value={trustAddress} onChange={(e) => setTrustAddress(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Purpose Format</label>
                <div className="flex gap-2">
                  {(['POINTS', 'PARAGRAPH'] as const).map((f) => (
                    <button key={f} type="button" onClick={() => setPurposeFormat(f)}
                      className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        purposeFormat === f ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-300'
                      }`}>{f === 'POINTS' ? 'Points' : 'Paragraph'}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Trust Purpose</label>
                <textarea value={trustPurpose} onChange={(e) => setTrustPurpose(e.target.value)}
                  rows={5}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 outline-none resize-none font-mono"
                  placeholder={purposeFormat === 'POINTS' ? 'Enter each point on a new line...' : 'Enter purpose as a paragraph...'} />
                <p className="text-[11px] text-slate-400 mt-1">
                  {purposeFormat === 'POINTS' ? 'Line breaks will be preserved as points' : 'Text will be rendered as a paragraph'}
                </p>
              </div>
            </div>
          </div>

          {/* Instrument & Notary */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="px-5 py-3.5 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">Deed & Notary Details</h2>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Deed Number</label>
                <input value={instrumentNumber} disabled
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Attest Date</label>
                <input type="date" value={instrumentDate} disabled
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Notary Verification <span className="text-red-500">*</span>
                </label>
                <div className="relative max-w-md">
                  <input value={notaryQuery} onChange={(e) => handleNotarySearch(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 outline-none"
                    placeholder="Search notary by name or NIC..." />
                  {notarySearching && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <svg className="animate-spin h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    </div>
                  )}
                  {showNotaryDropdown && (
                    <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {notarySearchResults.map((n) => (
                        <button key={n.id} type="button" onClick={() => selectNotary(n)}
                          className="w-full px-3 py-2 text-sm text-left hover:bg-slate-50 border-b border-slate-50 last:border-0 cursor-pointer">
                          <span className="font-medium text-slate-800">{n.fullName}</span>
                          <span className="text-xs text-slate-400 ml-2">{n.nic} &middot; {n.district}</span>
                          <span className={`text-[10px] font-medium ml-1 px-1.5 py-0.5 rounded ${
                            n.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>{n.status}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {notaryStatus && (
                  <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${notaryStatus.style}`}>
                    {selectedNotary?.status === 'ACTIVE' ? (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                    )}
                    {notaryStatus.label}
                  </div>
                )}
                {selectedNotary && selectedNotary.status === 'ACTIVE' && (
                  <p className="mt-1 text-xs text-slate-400">Reg: {selectedNotary.notaryRegistrationNumber} &middot; {selectedNotary.district}</p>
                )}
              </div>
            </div>
          </div>

          {/* Registrar General & Remarks */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="px-5 py-3.5 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">Registrar General & Remarks</h2>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Registrar General's Signature Date</label>
                <input type="date" value={registrarGenDate} onChange={(e) => setRegistrarGenDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Other Remarks</label>
                <input value={remarks} onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 outline-none" placeholder="Any additional remarks..." />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section: Parties */}
      {section === 'parties' && (
        <div className="space-y-4">
          {['AUTHOR_SETTLOR', 'TRUSTEE', 'CO_TRUSTEE', 'BENEFICIAL_OWNER'].map((role) => {
            const roleParties = parties.filter((p) => p.partyRole === role);
            return (
              <div key={role} className="bg-white rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
                  <h2 className="text-sm font-semibold text-slate-900">{roleLabels[role] || role}</h2>
                  <button type="button" onClick={() => { setPartyForm({ ...initialPartyForm, partyRole: role }); setEditingPartyId(null); setPartyFormOpen(true); }}
                    className="text-xs font-medium text-blue-700 hover:text-blue-800 underline cursor-pointer">+ Add</button>
                </div>
                <div className="p-5">
                  {roleParties.length === 0 ? (
                    <p className="text-sm text-slate-400">No {roleLabels[role]?.toLowerCase() || role.toLowerCase()} added</p>
                  ) : (
                    <div className="space-y-2">
                      {roleParties.map((p) => (
                        <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div>
                            <span className="text-sm font-medium text-slate-800">
                              {p.partyType === 'INDIVIDUAL' ? p.fullName :
                               p.partyType === 'COMPANY' ? p.fullName :
                               p.groupDescription || 'Group'}
                            </span>
                            <span className="text-xs text-slate-400 ml-2">({p.partyType}{p.idNumber ? ` • ${p.idNumber}` : ''})</span>
                            <StatusBadge status={p.verificationStatus} />
                          </div>
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => editParty(p)}
                              className="text-xs text-slate-500 hover:text-slate-700 underline cursor-pointer">Edit</button>
                            <button type="button" onClick={() => handleRemoveParty(p.id)}
                              className="text-xs text-red-500 hover:text-red-700 underline cursor-pointer">Remove</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Section: Beneficiaries */}
      {section === 'beneficiaries' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">Beneficiaries</h2>
              <button type="button" onClick={() => { setPartyForm({ ...initialPartyForm, partyRole: 'BENEFICIARY' }); setEditingPartyId(null); setPartyFormOpen(true); }}
                className="text-xs font-medium text-blue-700 hover:text-blue-800 underline cursor-pointer">+ Add</button>
            </div>
            <div className="p-5">
              {parties.filter(p => p.partyRole === 'BENEFICIARY').length === 0 ? (
                <p className="text-sm text-slate-400">No beneficiaries added</p>
              ) : (
                <div className="space-y-2">
                  {parties.filter(p => p.partyRole === 'BENEFICIARY').map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <span className="text-sm font-medium text-slate-800">
                          {p.beneficiaryType === 'DIRECT' ? p.fullName :
                           p.beneficiaryType === 'COMPANY' ? p.fullName :
                           p.groupDescription || 'Indirect Group'}
                        </span>
                        <span className="text-xs text-slate-400 ml-2">({p.beneficiaryType})</span>
                        <StatusBadge status={p.verificationStatus} />
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => editParty(p)}
                          className="text-xs text-slate-500 hover:text-slate-700 underline cursor-pointer">Edit</button>
                        <button type="button" onClick={() => handleRemoveParty(p.id)}
                          className="text-xs text-red-500 hover:text-red-700 underline cursor-pointer">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Beneficiary form */}
          {partyFormOpen && partyForm.partyRole === 'BENEFICIARY' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">
                {editingPartyId ? 'Edit' : 'Add'} Beneficiary
              </h3>
              <form onSubmit={handleAddParty} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Beneficiary Type</label>
                    <select value={partyForm.beneficiaryType} onChange={(e) => setPartyForm({ ...partyForm, beneficiaryType: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 outline-none" required>
                      <option value="">Select</option>
                      <option value="DIRECT">Direct (Individual)</option>
                      <option value="INDIRECT">Indirect (Group)</option>
                      <option value="COMPANY">Company</option>
                    </select>
                  </div>
                  {partyForm.beneficiaryType === 'DIRECT' && (
                    <>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
                        <input value={partyForm.fullName} onChange={(e) => setPartyForm({ ...partyForm, fullName: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">ID Type</label>
                        <select value={partyForm.idType} onChange={(e) => setPartyForm({ ...partyForm, idType: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 outline-none">
                          <option value="">Select</option>
                          <option value="NIC">NIC</option>
                          <option value="PASSPORT">Passport</option>
                          <option value="DRIVING_LICENCE">Driving Licence</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">ID Number</label>
                        <input value={partyForm.idNumber} onChange={(e) => setPartyForm({ ...partyForm, idNumber: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Address</label>
                        <input value={partyForm.address} onChange={(e) => setPartyForm({ ...partyForm, address: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 outline-none" />
                      </div>
                    </>
                  )}
                  {partyForm.beneficiaryType === 'INDIRECT' && (
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Group Description</label>
                      <textarea value={partyForm.groupDescription} onChange={(e) => setPartyForm({ ...partyForm, groupDescription: e.target.value })}
                        rows={3} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 outline-none resize-none" />
                    </div>
                  )}
                  {partyForm.beneficiaryType === 'COMPANY' && (
                    <>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Company Name</label>
                        <input value={partyForm.fullName} onChange={(e) => setPartyForm({ ...partyForm, fullName: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Company Reg. Number</label>
                        <input value={partyForm.companyRegNumber} onChange={(e) => setPartyForm({ ...partyForm, companyRegNumber: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Address</label>
                        <input value={partyForm.address} onChange={(e) => setPartyForm({ ...partyForm, address: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 outline-none" />
                      </div>
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-md shadow-blue-600/25 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer">
                    {editingPartyId ? 'Update' : 'Add'} Beneficiary
                  </button>
                  <button type="button" onClick={() => { setPartyFormOpen(false); setEditingPartyId(null); setPartyForm(initialPartyForm); }}
                    className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">Cancel</button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Section: Properties */}
      {section === 'properties' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">Trust Properties</h2>
              <button type="button" onClick={() => { setPropForm(initialPropertyForm); setEditingPropId(null); setPropFormOpen(true); }}
                className="text-xs font-medium text-blue-700 hover:text-blue-800 underline cursor-pointer">+ Add</button>
            </div>
            <div className="p-5">
              {properties.length === 0 ? (
                <p className="text-sm text-slate-400">No properties added</p>
              ) : (
                <div className="space-y-2">
                  {properties.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <span className="text-sm font-medium text-slate-800">{propertyTypeLabels[p.propertyType] || p.propertyType}</span>
                        <span className="text-xs text-slate-400 ml-2">
                          {p.propertyType === 'MONEY' ? `${p.amount ?? ''} ${p.currency ?? ''}` :
                           p.propertyType === 'LAND' ? `${p.landAmount ?? ''}p (${p.landRegistrationNumber ?? '-'})` :
                           p.propertyType === 'VEHICLE' ? p.vehicleDetails?.substring(0, 50) :
                           p.otherDescription?.substring(0, 50)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => editProperty(p)}
                          className="text-xs text-slate-500 hover:text-slate-700 underline cursor-pointer">Edit</button>
                        <button type="button" onClick={() => handleRemoveProperty(p.id)}
                          className="text-xs text-red-500 hover:text-red-700 underline cursor-pointer">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {propFormOpen && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">
                {editingPropId ? 'Edit' : 'Add'} Property
              </h3>
              <form onSubmit={handleAddProperty} className="space-y-4">
                {renderPropertyFormFields()}
                <div className="flex gap-2">
                  <button type="submit" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-md shadow-blue-600/25 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer">
                    {editingPropId ? 'Update' : 'Add'} Property
                  </button>
                  <button type="button" onClick={() => { setPropFormOpen(false); setEditingPropId(null); setPropForm(initialPropertyForm); }}
                    className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">Cancel</button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Party form for non-beneficiary roles */}
      {partyFormOpen && partyForm.partyRole !== 'BENEFICIARY' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onClick={() => { setPartyFormOpen(false); setEditingPartyId(null); setPartyForm(initialPartyForm); }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-slate-900 mb-4">
              {editingPartyId ? 'Edit' : 'Add'} {roleLabels[partyForm.partyRole] || 'Party'}
            </h3>
            <form onSubmit={handleAddParty} className="space-y-4">
              {renderPartyFormFields()}
              <div className="flex gap-2 pt-2">
                <button type="submit" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-md shadow-blue-600/25 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer">
                  {editingPartyId ? 'Update' : 'Add'}
                </button>
                <button type="button" onClick={() => { setPartyFormOpen(false); setEditingPartyId(null); setPartyForm(initialPartyForm); }}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Section: Review & Submit */}
      {section === 'review' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Folio Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><span className="text-xs text-slate-400">Daybook</span><p className="text-sm font-medium text-slate-900">{folio.daybookNumber}</p></div>
              <div><span className="text-xs text-slate-400">Trust Type</span><p className="text-sm font-medium text-slate-900">{folio.trustType}</p></div>
              <div><span className="text-xs text-slate-400">Trust Name</span><p className="text-sm font-medium text-slate-900">{trustName || '-'}</p></div>
              <div><span className="text-xs text-slate-400">Folio Number</span><p className="text-sm font-medium text-slate-900">{volumeNumber || '-'}/{folioNumber || '-'}</p></div>
              <div><span className="text-xs text-slate-400">Parties</span><p className="text-sm font-medium text-slate-900">{parties.length}</p></div>
              <div><span className="text-xs text-slate-400">Properties</span><p className="text-sm font-medium text-slate-900">{properties.length}</p></div>
              <div><span className="text-xs text-slate-400">Notary</span><p className="text-sm font-medium text-slate-900">{selectedNotary?.fullName || notaryQuery || '—'}</p></div>
              <div><span className="text-xs text-slate-400">Notary Status</span><p className="text-sm font-medium text-slate-900">{selectedNotary?.status || '—'}</p></div>
            </div>
          </div>

          {/* Upload scanned deed */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Upload scanned deed (required)</h3>
            {deedFileName ? (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">Deed uploaded — {deedFileName}</span>
                <button
                  type="button"
                  onClick={() => { setDeedFileName(null); setDeedFile(null); }}
                  className="ml-auto text-xs text-red-600 hover:text-red-800 underline cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700">
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  Choose file
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.tiff"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setDeedFile(file);
                    }}
                  />
                </label>
                <span className="text-sm text-slate-400">PDF or image</span>
                {deedFile && (
                  <>
                    <span className="text-sm text-slate-600 ml-1">{deedFile.name}</span>
                    <button
                      type="button"
                      onClick={handleDeedUpload}
                      disabled={deedUploading}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-md shadow-blue-600/25 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors disabled:cursor-not-allowed cursor-pointer"
                    >
                      {deedUploading ? 'Uploading...' : 'Upload'}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {folio.signatureAppliedAt && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Signed Folio</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Confirmed by {folio.registrarVerifiedBy || 'Registrar'} on{' '}
                    {new Date(folio.signatureAppliedAt).toLocaleDateString('en-GB')}
                    {folio.sealType === 'RED' && folio.sealAppliedAt
                      ? ` — RED (REJECTED) seal applied on ${new Date(folio.sealAppliedAt).toLocaleDateString('en-GB')}`
                      : ''}
                  </p>
                </div>
                <button
                  onClick={handleViewSignedFolio}
                  disabled={signedFolioLoading}
                  className="px-5 py-2.5 bg-maroon-700 hover:bg-maroon-800 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors disabled:cursor-not-allowed cursor-pointer"
                >
                  {signedFolioLoading ? 'Loading...' : 'View Signed Folio'}
                </button>
              </div>
            </div>
          )}

          {isBlocked && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              Cannot submit — notary is not ACTIVE. Please verify the notary.
            </div>
          )}

          <div className="flex items-center gap-3">
            {registerAfterCorrection ? (
              <>
                <div className="px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800 mr-auto">
                  Review the folio data below. Click Register to finalize registration after correction.
                </div>
                <button
                  onClick={() => {
                    if (confirm('Register this folio after correction?')) {
                      registerCorrectionMutation.mutate();
                    }
                  }}
                  disabled={registerCorrectionMutation.isPending}
                  className="px-6 py-2.5 bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors disabled:cursor-not-allowed cursor-pointer"
                >
                  {registerCorrectionMutation.isPending ? 'Registering...' : 'Register Folio'}
                </button>
              </>
            ) : (
              <>
            <button
              onClick={() => { setError(''); setConfirmAction('submit'); }}
              disabled={loading || !!isBlocked || !deedFileName}
              className="px-6 py-2.5 bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors disabled:cursor-not-allowed cursor-pointer"
            >
              Submit — register deed (pending verification)
            </button>
            <button
              onClick={() => { setError(''); setConfirmAction('report'); }}
              disabled={loading}
              className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors disabled:cursor-not-allowed cursor-pointer"
            >
              Report deed (pending verification)
            </button>
            <button
              onClick={() => { setError(''); setConfirmAction('reject'); }}
              disabled={loading}
              className="px-6 py-2.5 bg-red-700 hover:bg-red-800 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors disabled:cursor-not-allowed cursor-pointer"
            >
              Reject deed (pending verification)
            </button>
            <div className="ml-auto">
              <button
                onClick={() => { setError(''); setShowSuspiciousDialog(true); }}
                disabled={loading}
                className="px-6 py-2.5 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors disabled:cursor-not-allowed cursor-pointer"
              >
                ! Submit as Suspicious
              </button>
            </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Suspicious Flag Dialog */}
      {showSuspiciousDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onClick={() => { setShowSuspiciousDialog(false); setSuspiciousReason(''); setSuspiciousConcerns([]); }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Flag Suspicious Activity</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Trust: {trustName || '—'} &bull; Daybook: {folio.daybookNumber}
                </p>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  The report is sent to the Registry Admin for verification; the folio workflow continues unchanged in the meantime.
                </p>
              </div>
            </div>

            <div className="space-y-1 mb-4 p-3 bg-slate-50 rounded-lg text-xs text-slate-500">
              <p><span className="font-medium text-slate-700">Parties:</span> {parties.length} recorded</p>
              <p><span className="font-medium text-slate-700">Deed scan:</span> {deedFileName || 'Not uploaded'}</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Reason for suspicion *</label>
                <textarea
                  value={suspiciousReason}
                  onChange={(e) => setSuspiciousReason(e.target.value)}
                  placeholder="Describe why this folio appears suspicious..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-600 outline-none resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Concerns</label>
                <div className="space-y-2">
                  {[
                    { value: 'MONEY_LAUNDERING', label: 'Money laundering' },
                    { value: 'TERRORISM_FINANCING', label: 'Terrorism financing' },
                    { value: 'FRAUD', label: 'Fraud' },
                    { value: 'IDENTITY_ISSUES', label: 'Identity issues' },
                    { value: 'OTHER', label: 'Other' },
                  ].map((c) => (
                    <label key={c.value} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={suspiciousConcerns.includes(c.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSuspiciousConcerns([...suspiciousConcerns, c.value]);
                          } else {
                            setSuspiciousConcerns(suspiciousConcerns.filter((v) => v !== c.value));
                          }
                        }}
                        className="accent-yellow-600"
                      />
                      {c.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">{error}</div>
            )}

            <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={async () => {
                  if (!suspiciousReason.trim()) return;
                  setSuspiciousSubmitting(true);
                  setError('');
                  try {
                    const concernsStr = suspiciousConcerns.length > 0 ? suspiciousConcerns.join(', ') : undefined;
                    await folioApi.flagSuspicious(folioId, { reason: suspiciousReason.trim(), concerns: concernsStr });
                    setShowSuspiciousDialog(false);
                    setSuspiciousReason('');
                    setSuspiciousConcerns([]);
                    setSuccessMsg('Suspicious proposal submitted to Registry Admin for verification.');
                    setTimeout(() => setSuccessMsg(''), 5000);
                  } catch (err: unknown) {
                    const e = err as { message?: string };
                    setError(e?.message || 'Failed to submit suspicious report');
                  } finally {
                    setSuspiciousSubmitting(false);
                  }
                }}
                disabled={suspiciousSubmitting || !suspiciousReason.trim()}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors disabled:cursor-not-allowed cursor-pointer"
              >
                {suspiciousSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
              <button
                onClick={() => { setShowSuspiciousDialog(false); setSuspiciousReason(''); setSuspiciousConcerns([]); }}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onClick={() => { setConfirmAction(null); setActionReason(''); }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">
              {confirmAction === 'submit' ? 'Submit Folio for Registrar Verification' :
               confirmAction === 'report' ? 'Submit Report Proposal' : 'Submit Rejection Proposal'}
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              {confirmAction === 'submit' ? 'This submits a registration proposal. The Registrar will verify and finalize registration.' :
               confirmAction === 'report' ? 'This will propose REPORTED status for Registrar verification and notify the notary. Enter reason below:' :
               'This will propose a permanent REJECTION for Registrar verification. Enter reason below:'}
            </p>
            {(confirmAction === 'report' || confirmAction === 'reject') && (
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 outline-none resize-none mb-4"
                placeholder={confirmAction === 'report' ? 'Reason for reporting...' : 'Reason for rejection...'}
                required
              />
            )}
            <div className="flex gap-2">
              <button
                onClick={handleConfirmAction}
                disabled={loading}
                className={`px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                  confirmAction === 'submit' ? 'bg-green-700 hover:bg-green-800' :
                  confirmAction === 'report' ? 'bg-orange-600 hover:bg-orange-700' :
                  'bg-red-700 hover:bg-red-800'
                } disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {loading ? 'Processing...' : 'Confirm'}
              </button>
              <button onClick={() => { setConfirmAction(null); setActionReason(''); }}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline StatusBadge for imports
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PENDING: 'bg-amber-50 text-amber-700',
    REGISTERED: 'bg-green-50 text-green-700',
    REJECTED: 'bg-red-50 text-red-700',
    REPORTED: 'bg-orange-50 text-orange-700',
    PENDING_CORRECTION: 'bg-blue-50 text-blue-700',
    SUPERSEDED: 'bg-slate-100 text-slate-600',
    VERIFIED: 'bg-green-50 text-green-700',
    FAILED: 'bg-red-50 text-red-700',
  };
  return (
    <span className={`inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded-full ${colors[status] || 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  );
}
