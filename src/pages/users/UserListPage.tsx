import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { userApi } from '../../api';
import { PageHeader, Card, DataTable, StatusBadge } from '../../components/shared';
import type { UserResponse } from '../../types';

export default function UserListPage() {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<number | null>(null);

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
    if (!confirm(`Delete user "${user.fullName}" (${user.email})? This cannot be undone.`)) return;
    setDeletingId(user.id);
    try {
      await deleteMutation.mutateAsync(user.id);
    } catch {
      alert('Failed to delete user');
    } finally {
      setDeletingId(null);
    }
  };

  const columns = [
    { key: 'fullName', header: 'Name' },
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
          <Link to={`/users/${item.id}`} className="btn btn-sm btn-secondary">
            View
          </Link>
          <button
            onClick={() => handleDelete(item)}
            disabled={deletingId === item.id}
            className="btn btn-sm btn-danger"
          >
            {deletingId === item.id ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage system users"
        actions={
          <Link to="/users/new" className="btn btn-primary">
            Add User
          </Link>
        }
      />
      <Card>
        <DataTable
          columns={columns}
          data={users || []}
          keyExtractor={(item) => item.id}
          isLoading={isLoading}
          emptyMessage="No users found"
        />
      </Card>
    </div>
  );
}
