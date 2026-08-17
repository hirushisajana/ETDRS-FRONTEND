import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SignatureSetupPage from '../pages/signature/SignatureSetupPage';
import { signatureApi } from '../api';
import type { RegistrarSignature } from '../types';

vi.mock('../api', () => ({
  signatureApi: {
    getMySignature: vi.fn(),
    uploadSignature: vi.fn(),
    getSignatureFileUrl: (id: number) => `/signature/${id}/file`,
  },
}));

const mockSig: RegistrarSignature = {
  id: 1,
  adminUserId: 10,
  registryId: 5,
  registryCode: 'CLB',
  registryName: 'Colombo Land Registry',
  fileName: 'sig.png',
  fileSize: 20480,
  active: true,
  createdAt: '2026-08-01 10:00:00',
  updatedAt: '2026-08-01 10:00:00',
};

const renderPage = () => {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <SignatureSetupPage />
    </QueryClientProvider>,
  );
};

describe('SignatureSetupPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows warning when no signature uploaded yet', async () => {
    vi.mocked(signatureApi.getMySignature).mockResolvedValue(null);

    renderPage();

    expect(
      await screen.findByText(/No signature uploaded yet/),
    ).toBeInTheDocument();
  });

  it('shows active signature details when present', async () => {
    vi.mocked(signatureApi.getMySignature).mockResolvedValue(mockSig);

    renderPage();

    expect(await screen.findByText('sig.png')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Colombo Land Registry')).toBeInTheDocument();
    expect(screen.getAllByText('Replace Signature').length).toBeGreaterThan(0);
  });

  const getFileInput = (container: HTMLElement) =>
    container.querySelector('input[type="file"]') as HTMLInputElement;

  it('rejects a non-PNG file', async () => {
    vi.mocked(signatureApi.getMySignature).mockResolvedValue(null);

    const { container } = renderPage();
    await screen.findByText(/No signature uploaded yet/);

    const input = getFileInput(container);
    const file = new File(['x'], 'sig.jpg', { type: 'image/jpeg' });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Only PNG files are accepted')).toBeInTheDocument();
    });
  });

  it('rejects a file larger than 2MB', async () => {
    vi.mocked(signatureApi.getMySignature).mockResolvedValue(null);

    const { container } = renderPage();
    await screen.findByText(/No signature uploaded yet/);

    const input = getFileInput(container);
    const big = new File([new Uint8Array(3 * 1024 * 1024)], 'big.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [big] } });

    await waitFor(() => {
      expect(screen.getByText('Signature image must be less than 2MB')).toBeInTheDocument();
    });
  });

  it('uploads a valid PNG and shows success', async () => {
    vi.mocked(signatureApi.getMySignature).mockResolvedValue(null);
    vi.mocked(signatureApi.uploadSignature).mockResolvedValue(mockSig);
    const user = userEvent.setup();

    const { container } = renderPage();
    await screen.findByText(/No signature uploaded yet/);

    const input = getFileInput(container);
    const file = new File(['png'], 'sig.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [file] } });

    const uploadButton = screen.getByRole('button', { name: 'Upload Signature' });
    await user.click(uploadButton);

    await waitFor(() => {
      expect(signatureApi.uploadSignature).toHaveBeenCalledWith(file);
    });
    expect(await screen.findByText(/Signature "sig.png" saved/)).toBeInTheDocument();
  });
});
