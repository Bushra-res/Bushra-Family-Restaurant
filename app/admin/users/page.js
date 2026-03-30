'use client';
import { useState, useEffect } from 'react';
import { useToast } from '@/components/Toast';
import { useConfirm } from '@/contexts/ConfirmContext';
import { useSession } from 'next-auth/react';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();
    const { confirm } = useConfirm();
    const { data: session } = useSession();

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            } else {
                addToast('Failed to fetch users', 'error');
            }
        } catch (error) {
            addToast('Error loading users', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleUpdateRole = async (userId, newRole) => {
        try {
            const res = await fetch('/api/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: userId, role: newRole })
            });

            if (res.ok) {
                addToast(`Role updated to ${newRole}`, 'success');
                fetchUsers();
            } else {
                addToast('Failed to update role', 'error');
            }
        } catch (error) {
            addToast('An error occurred', 'error');
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        const isConfirmed = await confirm({
            title: 'Confirm Deletion',
            message: `Are you sure you want to remove ${userName}? This action cannot be undone.`,
            confirmText: 'Remove User',
            type: 'danger'
        });

        if (!isConfirmed) return;

        try {
            const res = await fetch('/api/users', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: userId })
            });

            if (res.ok) {
                addToast('User removed successfully', 'success');
                fetchUsers();
            } else {
                const err = await res.json();
                addToast(err.error || 'Failed to remove user', 'error');
            }
        } catch (error) {
            addToast('An error occurred', 'error');
        }
    };

    if (loading) return <div className="p-xl text-center">Loading users...</div>;

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <div>
                    <h1>User Management</h1>
                    <p className="subtitle">Manage staff accounts and system permissions</p>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', fontSize: 'var(--font-xs)', fontWeight: 800, color: 'white' }}>
                                            {user.name.charAt(0)}
                                        </div>
                                        <span style={{ fontWeight: 600 }}>{user.name}</span>
                                        {user._id === session?.user?.id && <span className="badge badge-info" style={{ fontSize: '10px' }}>You</span>}
                                    </div>
                                </td>
                                <td style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)' }}>{user.email}</td>
                                <td>
                                    <select 
                                        value={user.role} 
                                        onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                                        className="badge"
                                        style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-primary)', cursor: 'pointer' }}
                                        disabled={user._id === session?.user?.id}
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="cashier">Cashier</option>
                                        <option value="delivery">Delivery</option>
                                        <option value="customer">Customer</option>
                                    </select>
                                </td>
                                <td>
                                    <span className={`badge ${user.isActive !== false ? 'badge-success' : 'badge-danger'}`}>
                                        {user.isActive !== false ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <button 
                                        onClick={() => handleDeleteUser(user._id, user.name)}
                                        className="btn btn-ghost btn-sm"
                                        style={{ color: 'var(--danger)' }}
                                        disabled={user._id === session?.user?.id}
                                        title={user._id === session?.user?.id ? "Cannot delete yourself" : "Delete User"}
                                    >
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="info-box" style={{ marginTop: 'var(--space-md)', background: 'rgba(255, 255, 255, 0.05)', padding: 'var(--space-md)', borderRadius: 'var(--radius-sm)' }}>
                <h4 style={{ margin: '0 0 var(--space-xs) 0', fontSize: 'var(--font-xs)' }}>🔐 Security Information</h4>
                <p style={{ margin: 0, fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                    Only users with the <strong>Admin</strong> role can access management pages. Remove users who are no longer part of the staff to ensure security. 
                    Note: You cannot delete your own account while logged in.
                </p>
            </div>
        </div>
    );
}
