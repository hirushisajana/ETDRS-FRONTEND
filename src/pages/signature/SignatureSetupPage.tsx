import { useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { signatureApi } from '../../api';
import { PageHeader, LoadingSpinner } from '../../components/shared';
import type { RegistrarSignature } from '../../types';

export default function SignatureSetupPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: signature, isLoading } = useQuery({
    queryKey: ['signature', 'my'],
    queryFn: signatureApi.getMySignature,
  });

  const handleFile = (file: File) => {
    setError('');
    setSuccess('');
    if (!file.type.includes('png')) {
      setError('Only PNG files are accepted');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Signature image must be less than 2MB');
      return;
    }
    setSelectedFile(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setError('');
    setSuccess('');
    try {
      const saved = await signatureApi.uploadSignature(selectedFile);
      setSuccess(saved.fileName
        ? `Signature "${saved.fileName}" saved as your active signature.`
        : 'Signature saved as your active signature.');
      setSelectedFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      queryClient.invalidateQueries({ queryKey: ['signature'] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload signature');
    } finally {
      setUploading(false);
    }
  };

  const currentSig = signature as RegistrarSignature | null;

  return (
    <div className="p-6 max-w-2xl">
      <PageHeader
        title="Signature Setup"
        description="Upload your official signature. It is required before confirming any registration and is stamped onto signed folios and certificates."
      />

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}
      {success && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">{success}</div>
      )}

      {/* Current signature status */}
      <div className="mb-5 bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Current Signature</h3>
        {isLoading ? (
          <LoadingSpinner />
        ) : currentSig ? (
          <div className="flex items-center gap-4">
            <div className="w-24 h-16 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden flex items-center justify-center">
              <img
                src={signatureApi.getSignatureFileUrl(currentSig.id)}
                alt="Current signature"
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="text-sm">
              <div className="font-medium text-slate-900">{currentSig.fileName || 'Signature'}</div>
              <div className="text-xs text-slate-500 mt-0.5">
                {currentSig.registryName || `Registry #${currentSig.registryId}`}
              </div>
              <div className="text-xs text-slate-500">
                {((currentSig.fileSize ?? 0) / 1024).toFixed(0)} KB &middot; uploaded {currentSig.updatedAt || 'recently'}
              </div>
              <span className="mt-1.5 inline-block px-2 py-0.5 text-[10px] font-semibold bg-green-100 text-green-700 rounded">
                Active
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            No signature uploaded yet. Confirming a registration will be blocked until you upload one.
          </p>
        )}
      </div>

      {/* Upload / replace */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-1">
          {currentSig ? 'Replace Signature' : 'Upload Signature'}
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          PNG only, max 2MB. Replacing deactivates the previous signature for all future confirmations.
        </p>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
            dragOver ? 'border-maroon-600 bg-maroon-50' : 'border-slate-300 bg-slate-50 hover:border-slate-400'
          }`}
        >
          {previewUrl ? (
            <div className="flex flex-col items-center gap-2">
              <img src={previewUrl} alt="Signature preview" className="h-16 object-contain" />
              <span className="text-xs text-slate-500">{selectedFile?.name}</span>
            </div>
          ) : (
            <>
              <svg className="mx-auto h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <p className="mt-2 text-sm text-slate-600">
                {currentSig ? 'Click or drop a new PNG' : 'Click or drop a PNG'}<br />
                <span className="text-xs text-slate-400">Drag &amp; drop or click to browse</span>
              </p>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = '';
          }}
        />

        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="mt-4 w-full px-4 py-2.5 bg-gradient-to-r from-maroon-700 to-maroon-600 hover:from-maroon-800 hover:to-maroon-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors disabled:cursor-not-allowed cursor-pointer"
        >
          {uploading ? 'Uploading...' : currentSig ? 'Replace Signature' : 'Upload Signature'}
        </button>
      </div>
    </div>
  );
}