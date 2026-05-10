import React, { useEffect, useState } from 'react';
import { authAPI } from '../services/api';

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type AdminUserManagementModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentUserRole: string;
};

const AdminUserManagementModal: React.FC<AdminUserManagementModalProps> = ({
  isOpen,
  onClose,
  currentUserRole,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && currentUserRole === 'admin') {
      loadUsers();
    }
  }, [isOpen, currentUserRole]);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.getUsers();
      setUsers(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number, userEmail: string) => {
    if (!window.confirm(`Are you sure you want to delete user: ${userEmail}?`)) {
      return;
    }

    setDeleting(userId);
    try {
      await authAPI.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete user');
    } finally {
      setDeleting(null);
    }
  };

  if (!isOpen || currentUserRole !== 'admin') return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '30px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginTop: 0, color: '#333' }}>User Management</h2>

        {error && (
          <div
            style={{
              backgroundColor: '#fee',
              color: '#c00',
              padding: '10px',
              borderRadius: '4px',
              marginBottom: '15px',
              fontSize: '14px',
            }}
          >
            {error}
          </div>
        )}

        <p style={{ color: '#666', fontSize: '14px' }}>
          Admin tools for managing users. Note: To see all users, you need backend endpoint support.
        </p>

        {loading && <p style={{ textAlign: 'center', color: '#999' }}>Loading users...</p>}

        {!loading && users.length === 0 && (
          <p style={{ textAlign: 'center', color: '#999' }}>
            No users to display. Backend endpoint needed for user listing.
          </p>
        )}

        {users.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            {users.map((user) => (
              <div
                key={user.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px',
                  borderBottom: '1px solid #eee',
                }}
              >
                <div>
                  <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#333' }}>
                    {user.name}
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>
                    {user.email} ({user.role})
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteUser(user.id, user.email)}
                  disabled={deleting === user.id}
                  style={{
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    cursor: deleting === user.id ? 'not-allowed' : 'pointer',
                    fontSize: '12px',
                    opacity: deleting === user.id ? 0.6 : 1,
                  }}
                >
                  {deleting === user.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            marginTop: '20px',
            width: '100%',
            padding: '10px',
            backgroundColor: '#6277ac',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default AdminUserManagementModal;
