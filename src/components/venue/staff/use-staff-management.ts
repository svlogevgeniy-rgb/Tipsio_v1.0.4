import { useCallback, useEffect, useState } from 'react';
import type { Staff, StaffForm } from './schema';

export function useStaffManagement() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [venueId, setVenueId] = useState<string | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const fetchStaff = useCallback(async () => {
    try {
      const dashRes = await fetch('/api/venues/dashboard?period=week');
      if (!dashRes.ok) throw new Error('Failed to load venue');
      const dashData = await dashRes.json();

      if (dashData.venue?.id) {
        setVenueId(dashData.venue.id);
        const staffRes = await fetch(`/api/staff?venueId=${dashData.venue.id}`);
        if (staffRes.ok) {
          const staffData = await staffRes.json();
          setStaff(staffData.staff || []);
        }
      }
    } finally {
      setIsPageLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
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

      setStaff((prev) => [result.staff, ...prev]);
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
      setStaff((prev) =>
        prev.map((s) => (s.id === staffMember.id ? { ...s, status: newStatus } : s)),
      );
    } else {
      throw new Error('Failed to update status');
    }
  }, []);

  const deleteStaff = useCallback(async (staffMember: Staff) => {
    const response = await fetch(`/api/staff/${staffMember.id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      setStaff((prev) => prev.filter((s) => s.id !== staffMember.id));
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
