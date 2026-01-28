import { useCallback, useEffect, useRef, useState } from 'react';
import { useVenueDashboard } from '@/features/venue-dashboard/hooks/useVenueDashboard';
import type { Staff, StaffForm } from './schema';

export function useStaffManagement() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const isMountedRef = useRef(true);

  // Get venue ID from shared context
  const { data: dashboardData } = useVenueDashboard();
  const venueId = dashboardData?.venue?.id || null;

  const fetchStaff = useCallback(async () => {
    if (!venueId) {
      setIsPageLoading(false);
      return;
    }

    try {
      const staffRes = await fetch(`/api/staff?venueId=${venueId}`);
      if (staffRes.ok) {
        const staffData = await staffRes.json();
        if (isMountedRef.current) {
          setStaff(staffData.staff || []);
        }
      }
    } catch (error) {
      // Silently handle errors - component will show empty state
      console.error('Failed to fetch staff:', error);
    } finally {
      if (isMountedRef.current) {
        setIsPageLoading(false);
      }
    }
  }, [venueId]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchStaff();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchStaff]);

  const addStaff = useCallback(
    async (data: StaffForm, avatarFile: File | null) => {
      if (!venueId) {
        throw new Error('Venue not loaded');
      }

      let avatarUrl = data.avatarUrl;
      if (avatarFile) {
        const formData = new FormData();
        formData.append('file', avatarFile);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          const uploadError = await uploadRes.json();
          throw new Error(uploadError.message || 'Failed to upload photo');
        }

        const uploadData = await uploadRes.json();
        avatarUrl = uploadData.url;
      }

      const response = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, avatarUrl, venueId }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to add staff');
      }

      if (isMountedRef.current) {
        setStaff((prev) => [result.staff, ...prev]);
      }
    },
    [venueId],
  );

  const toggleStatus = useCallback(async (staffMember: Staff) => {
    const newStatus = staffMember.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const response = await fetch(`/api/staff/${staffMember.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });

    if (response.ok) {
      if (isMountedRef.current) {
        setStaff((prev) =>
          prev.map((s) => (s.id === staffMember.id ? { ...s, status: newStatus } : s)),
        );
      }
    } else {
      throw new Error('Failed to update status');
    }
  }, []);

  const deleteStaff = useCallback(async (staffMember: Staff) => {
    const response = await fetch(`/api/staff/${staffMember.id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      if (isMountedRef.current) {
        setStaff((prev) => prev.filter((s) => s.id !== staffMember.id));
      }
    } else {
      throw new Error('Failed to delete staff');
    }
  }, []);

  return {
    staff,
    venueId,
    isPageLoading,
    addStaff,
    toggleStatus,
    deleteStaff,
    refresh: fetchStaff,
  };
}
