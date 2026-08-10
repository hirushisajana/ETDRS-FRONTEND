import type { ReceiptResponse } from '../../types';

interface ReceiptModalProps {
  receipt: ReceiptResponse | null;
  onClose: () => void;
}

export default function ReceiptModal({ receipt, onClose }: ReceiptModalProps) {
  if (!receipt) return null;

  const handlePrint = () => {
    const printWin = window.open('', '_blank');
    if (!printWin) return;
    printWin.document.write(`
      <html>
      <head>
        <title>Receipt — ${receipt.daybookNumber}</title>
        <style>
          body { font-family: 'Courier New', monospace; padding: 40px; max-width: 400px; margin: auto; }
          h1 { font-size: 18px; text-align: center; margin-bottom: 4px; }
          h2 { font-size: 14px; text-align: center; color: #666; margin-top: 0; }
          .line { border-top: 1px dashed #333; margin: 16px 0; }
          .row { display: flex; justify-content: space-between; margin: 6px 0; font-size: 13px; }
          .label { color: #666; }
          .total { font-size: 16px; font-weight: bold; margin-top: 12px; }
          .footer { text-align: center; font-size: 11px; color: #999; margin-top: 24px; }
        </style>
      </head>
      <body>
        <h1>REGISTRAR GENERAL'S DEPARTMENT</h1>
        <h2>Trust Registration System</h2>
        <div class="line"></div>
        <div class="row"><span class="label">Receipt #</span><span>${receipt.daybookNumber}</span></div>
        <div class="row"><span class="label">Registry</span><span>${receipt.registryName}</span></div>
        <div class="row"><span class="label">Client</span><span>${receipt.clientName}</span></div>
        <div class="row"><span class="label">Deed #</span><span>${receipt.deedNumber ?? '-'}</span></div>
        <div class="row"><span class="label">Service</span><span>${receipt.serviceType}</span></div>
        <div class="row">          <span class="label">Delivery</span><span>${receipt.receiptDelivery === 'SMS' ? 'SMS' : receipt.receiptDelivery}</span></div>
        <div class="line"></div>
        <div class="row total">
          <span>Total Fee</span>
          <span>Rs ${receipt.registrationFee?.toLocaleString() ?? '0.00'}</span>
        </div>
        <div class="footer">
          Generated: ${new Date(receipt.generatedAt).toLocaleString()}<br/>
          Thank you for your submission
        </div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `);
    printWin.document.close();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Receipt — {receipt.daybookNumber}</h3>
        </div>
        <div className="modal-body">
          <div className="detail-grid">
            <div><strong>Registry:</strong> {receipt.registryName}</div>
            <div><strong>Client:</strong> {receipt.clientName}</div>
            <div><strong>Deed #:</strong> {receipt.deedNumber ?? '-'}</div>
            <div><strong>Service:</strong> {receipt.serviceType}</div>
            <div><strong>Delivery:</strong> {receipt.receiptDelivery === 'SMS' ? 'SMS' : receipt.receiptDelivery}</div>
            <div><strong>Fee:</strong> Rs {receipt.registrationFee?.toLocaleString() ?? '0.00'}</div>
            <div><strong>Generated:</strong> {new Date(receipt.generatedAt).toLocaleString()}</div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={handlePrint}>
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
