import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader, Card } from '../../components/shared';
import { daybookApi } from '../../api';
import CounterDashboard from './CounterDashboard';
import NewEntryForm from './NewEntryForm';
import QuarterlyUpdateForm from './QuarterlyUpdateForm';
import ResubmissionForm from './ResubmissionForm';
import ReceiptModal from './ReceiptModal';
import type { DaybookEntry, ReceiptResponse } from '../../types';

type Tab = 'dashboard' | 'new' | 'update' | 'resubmit';

const VALID_TABS: Tab[] = ['new', 'update', 'resubmit'];

export default function CounterPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as Tab | null;
  const activeTab: Tab = tabParam && VALID_TABS.includes(tabParam) ? tabParam : 'dashboard';
  const [successEntry, setSuccessEntry] = useState<DaybookEntry | null>(null);
  const [successTab, setSuccessTab] = useState<Tab>('dashboard');
  const [receipt, setReceipt] = useState<ReceiptResponse | null>(null);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [prefillResubmit, setPrefillResubmit] = useState<DaybookEntry | null>(null);

  const showSuccess = successEntry !== null && successTab === activeTab;

  const switchTab = (tab: Tab) => {
    setPrefillResubmit(null);
    if (tab === 'dashboard') {
      setSearchParams({}, { replace: true });
    } else {
      setSearchParams({ tab }, { replace: true });
    }
  };

  const handleNewSuccess = async (entry: DaybookEntry) => {
    setSuccessEntry(entry);
    setSuccessTab('new');
    setReceiptLoading(true);
    try {
      const r = await daybookApi.getReceipt(entry.id);
      setReceipt(r);
    } catch {
      // receipt may fail if fee is missing
    } finally {
      setReceiptLoading(false);
    }
  };

  const handleUpdateSuccess = (entry: DaybookEntry) => {
    setSuccessEntry(entry);
    setSuccessTab('update');
  };

  const handleResubmitSuccess = async (entry: DaybookEntry) => {
    setSuccessEntry(entry);
    setSuccessTab('resubmit');
    setReceiptLoading(true);
    try {
      const r = await daybookApi.getReceipt(entry.id);
      setReceipt(r);
    } catch {
      // ignore
    } finally {
      setReceiptLoading(false);
    }
  };

  const handleDashboardViewEntry = (entry: DaybookEntry) => {
    setPrefillResubmit(entry);
    setSearchParams({ tab: 'resubmit' }, { replace: true });
  };

  if (showSuccess) {
    return (
      <div className="p-6">
        <PageHeader
          title="Counter"
          description="Entry created successfully"
        />
        <Card>
          <div className="text-center py-8">
            <div className="text-5xl mb-4 text-green-600">&#10003;</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Entry Created Successfully</h2>
            <p className="text-sm text-gray-500 mb-4">
              Daybook Number: <strong className="text-maroon-800">{successEntry.daybookNumber}</strong>
            </p>
            {successEntry.emailSent === false && successEntry.receiptDelivery === 'SMS' && (
              <div className="flex items-center justify-center gap-2 mb-4 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800 mx-auto max-w-md">
                <svg className="w-5 h-5 shrink-0 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span>Entry created. Failed to send SMS receipt to <strong>{successEntry.clientTelephone}</strong>. Please print the receipt or contact the client.</span>
              </div>
            )}
            {successEntry.emailSent === false && successEntry.receiptDelivery !== 'SMS' && (
              <div className="flex items-center justify-center gap-2 mb-4 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800 mx-auto max-w-md">
                <svg className="w-5 h-5 shrink-0 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span>Entry created. Failed to send receipt email to <strong>{successEntry.clientEmail}</strong>. Please print the receipt or contact the client.</span>
              </div>
            )}
            {successEntry.emailSent === true && successEntry.receiptDelivery === 'SMS' && (
              <p className="text-xs text-green-600 mb-4">Receipt sent via SMS to {successEntry.clientTelephone}</p>
            )}
            {successEntry.emailSent === true && successEntry.receiptDelivery !== 'SMS' && (
              <p className="text-xs text-green-600 mb-4">Receipt sent to {successEntry.clientEmail}</p>
            )}
            {receipt && (
              <button className="btn btn-primary mb-3" onClick={() => setReceipt(receipt)}>
                View Receipt
              </button>
            )}
            {receiptLoading && <p className="text-sm text-gray-400 mb-3">Generating receipt...</p>}
            <div className="flex gap-2 justify-center">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setSuccessEntry(null);
                  setReceipt(null);
                  switchTab('new');
                }}
              >
                Create Another
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setSuccessEntry(null);
                  setReceipt(null);
                  switchTab('dashboard');
                }}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </Card>

        {receipt && (
          <ReceiptModal receipt={receipt} onClose={() => setReceipt(null)} />
        )}
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Counter Dashboard"
        description="Manage daybook entries, quarterly updates, and re-submissions"
      />

      {activeTab !== 'dashboard' && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 flex items-center gap-2">
          <span>&#9432;</span>
          <span>
            Currently in <strong>{activeTab === 'new' ? 'New Entry' : activeTab === 'update' ? 'Quarterly Update' : 'Re-submission'}</strong> mode.
            <button onClick={() => switchTab('dashboard')} className="underline ml-1">Return to dashboard</button>
          </span>
        </div>
      )}

      {activeTab === 'dashboard' && (
        <CounterDashboard onViewEntry={handleDashboardViewEntry} />
      )}

      <div className="tabs" style={{ marginTop: activeTab === 'dashboard' ? 24 : 0 }}>
        <button
          className={`tab ${activeTab === 'new' ? 'active' : ''}`}
          onClick={() => switchTab('new')}
        >
          New Entry
        </button>
        <button
          className={`tab ${activeTab === 'update' ? 'active' : ''}`}
          onClick={() => switchTab('update')}
        >
          Quarterly Update
        </button>
        <button
          className={`tab ${activeTab === 'resubmit' ? 'active' : ''}`}
          onClick={() => switchTab('resubmit')}
        >
          Re-submission
        </button>
      </div>

      <Card>
        {activeTab === 'new' && (
          <NewEntryForm onSuccess={handleNewSuccess} />
        )}
        {activeTab === 'update' && (
          <QuarterlyUpdateForm onSuccess={handleUpdateSuccess} />
        )}
        {activeTab === 'resubmit' && (
          <ResubmissionForm
            key={prefillResubmit?.id ?? 'manual'}
            prefillEntry={prefillResubmit}
            onSuccess={handleResubmitSuccess}
          />
        )}
      </Card>
    </div>
  );
}
