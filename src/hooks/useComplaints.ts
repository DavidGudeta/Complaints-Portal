import { useState, useEffect, useCallback } from 'react';
import { Complaint, ComplaintStatus, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface UseComplaintsProps {
  status?: ComplaintStatus;
  role?: string;
  userId?: string;
}

export function useComplaints({ status, role, userId }: UseComplaintsProps = {}) {
  const { user: currentUser } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchComplaints = useCallback(async () => {
    setIsLoading(true);
    try {
      let url = '/api/internal/complaints';
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (userId) params.append('userId', userId);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      setComplaints(data);
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
    } finally {
      setIsLoading(false);
    }
  }, [status, userId]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const deleteComplaint = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this complaint?')) return;
    try {
      const res = await fetch(`/api/internal/complaints/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchComplaints();
      }
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const assignComplaint = async (complaintId: string, officerId: string, officerName: string) => {
    try {
      const res = await fetch(`/api/internal/complaints/${complaintId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ officerId, officerName })
      });
      if (res.ok) {
        fetchComplaints();
      }
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
