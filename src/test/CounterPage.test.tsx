import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CounterPage from '../pages/counter/CounterPage';
import { daybookApi, notaryApi } from '../api';

vi.mock('../api', () => ({
  daybookApi: {
    getNextNumber: vi.fn(),
    getByYear: vi.fn(),
    getByDaybookNumber: vi.fn(),
    createEntry: vi.fn(),
    createUpdate: vi.fn(),
    createResubmission: vi.fn(),
    getReceipt: vi.fn(),
  },
  notaryApi: {
    search: vi.fn(),
  },
}));

vi.mock('../contexts', () => ({
  useAuth: () => ({
    user: { registryName: 'Colombo Land Registry' },
    hasRole: () => true,
  }),
}));

function NavHarness() {
  const navigate = useNavigate();
  return (
    <>
      <CounterPage />
      <button onClick={() => navigate('/daybook/counter')}>Sidebar: Dashboard</button>
      <button onClick={() => navigate('/daybook/counter?tab=new')}>Sidebar: New Entry</button>
      <button onClick={() => navigate('/daybook/counter?tab=update')}>Sidebar: Quarterly Update</button>
      <button onClick={() => navigate('/daybook/counter?tab=resubmit')}>Sidebar: Re-submission</button>
    </>
  );
}

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter initialEntries={['/daybook/counter']}>
      <QueryClientProvider client={qc}>
        <NavHarness />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('CounterPage URL-driven tab navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(daybookApi.getNextNumber).mockResolvedValue('CLB/E/000001/2026');
    vi.mocked(daybookApi.getByYear).mockResolvedValue([]);
    vi.mocked(notaryApi.search).mockResolvedValue([]);
  });

  it('shows the dashboard by default', async () => {
    renderPage();
    expect(await screen.findByText('Next Daybook Numbers')).toBeInTheDocument();
    expect(screen.getByText('Total Requests (YTD)')).toBeInTheDocument();
  });

  it('switches tabs when the URL query changes (sidebar navigation)', async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText('Next Daybook Numbers');

    await user.click(screen.getByRole('button', { name: 'Sidebar: Quarterly Update' }));
    expect(await screen.findByText('Original Daybook Number')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Lookup' })).toBeInTheDocument();
    expect(screen.queryByText('Next Daybook Numbers')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Sidebar: New Entry' }));
    expect(await screen.findByText('Trust Details')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Sidebar: Dashboard' }));
    await waitFor(() => {
      expect(screen.getByText('Next Daybook Numbers')).toBeInTheDocument();
    });
    expect(screen.queryByText('Original Daybook Number')).not.toBeInTheDocument();
  });

  it('opens the re-submission form with the dashboard prefill entry', async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText('Next Daybook Numbers');
    await user.click(screen.getByRole('button', { name: 'Sidebar: Re-submission' }));

    expect(await screen.findByText('Original Daybook Number')).toBeInTheDocument();
  });
});
