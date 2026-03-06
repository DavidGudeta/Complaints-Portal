import { useState, useEffect, useCallback } from 'react';
import { Complaint, ComplaintStatus, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface UseComplaintsProps {
  status?: ComplaintStatus;
  role?: string;
  userId?: number;
}

export function useComplaints({ status, role, userId }: UseComplaintsProps = {}) {
  const { user: currentUser } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchComplaints = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (role) params.append('role', role);
    if (userId) params.append('userId', userId.toString());
    if (currentUser?.tax_center_id) params.append('taxCenterId', currentUser.tax_center_id.toString());

    try {
      const res = await fetch(`/api/internal/complaints?${params.toString()}`);
      const data = await res.json();
      setComplaints(data);
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
    } finally {
      setIsLoading(false);
    }
  }, [status, role, userId, currentUser]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const deleteComplaint = async (id: number | string) => {
    if (!window.confirm('Are you sure you want to delete this complaint?')) return;
    try {
      await fetch(`/api/internal/complaints/${id}`, { method: 'DELETE' });
      fetchComplaints();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const assignComplaint = async (complaintId: number, officerId: number) => {
    try {
      await fetch(`/api/internal/complaints/${complaintId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          assigned_to: officerId, 
          status: ComplaintStatus.ASSIGNED 
        })
      });
      fetchComplaints();
    } catch (error) {
      console.error('Failed to assign:', error);
    }
  };

  return {
    complaints,
    isLoading,
    fetchComplaints,
    deleteComplaint,
    assignComplaint
  };
}
