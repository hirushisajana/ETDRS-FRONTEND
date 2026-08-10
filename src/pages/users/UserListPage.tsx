import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { userApi } from '../../api';
import { PageHeader, Card, DataTable, StatusBadge, ConfirmDialog } from '../../components/shared';
import type { UserResponse } from '../../types';

export default function UserListPage() {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmUser, setConfirmUser] = useState<UserResponse | null>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: userApi.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => userApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const handleDelete = async (user: UserResponse) => {
    setDeletingId(user.id);
    try {
      await deleteMutation.mutateAsync(user.id);
    } catch {
      alert('Failed to delete user');
    } finally {
      setDeletingId(null);
      setConfirmUser(null);
    }
  };

  const columns = [
    {
      key: 'fullName',
      header: 'Name',
      render: (item: UserResponse) => <span className="font-medium text-slate-900">{item.fullName}</span>,
    },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role' },
    { key: 'registryName', header: 'Registry' },
    {
      key: 'status',
      header: 'Status',
      render: (item: UserResponse) => <StatusBadge status={item.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: UserResponse) => (
        <div className="flex items-center gap-2">
          <Link
            to={`/users/${item.id}`}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            View
          </Link>
          <button
            onClick={() => setConfirmUser(item)}
            disabled={deletingId === item.id}
            className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {deletingId === item.id ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title="Users"
        description="Manage system users"
        actions={
          <Link
            to="/users/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:from-blue-500 hover:to-blue-400 active:scale-[0.98]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add User
          </Link>
        }
      />
      <Card className="overflow-hidden">
        <DataTable
          columns={columns}
          data={users || []}
          keyExtractor={(item) => item.id}
          isLoading={isLoading}
          emptyMessage="No users found"
        />
      </Card>

      <ConfirmDialog
        open={!!confirmUser}
        title="Delete user?"
        message={`Delete user "${confirmUser?.fullName}" (${confirmUser?.email})? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => confirmUser && handleDelete(confirmUser)}
        onCancel={() => setConfirmUser(null)}
      />
    </div>
  );
}