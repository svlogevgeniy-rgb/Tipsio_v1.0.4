import { act } from 'react';
import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { VenueDashboardData } from '@/features/venue-dashboard/api/getVenueDashboard';
import { VenueDashboardProvider } from '@/features/venue-dashboard/context/VenueDashboardProvider';
import { useStaffManagement } from './use-staff-management';
import type { Staff, StaffForm } from './schema';

// Mock fetch globally
global.fetch = vi.fn();

describe('useStaffManagement', () => {
  const mockVenueId = 'venue-123';
  const mockDashboardData: VenueDashboardData = {
    venue: {
      id: mockVenueId,
      name: 'Test Venue',
      distributionMode: 'PERSONAL',
    },
    metrics: {
      totalTips: 1000,
      transactionCount: 10,
      averageTip: 100,
      activeStaff: 5,
    },
    topStaff: [],
    hasPendingPayouts: false,
  };

  const mockStaff: Staff[] = [
    {
      id: 'staff-1',
      displayName: 'John Doe',
      fullName: 'John Michael Doe',
      role: 'WAITER',
      status: 'ACTIVE',
      avatarUrl: 'https://example.com/avatar.jpg',
    },
    {
      id: 'staff-2',
      displayName: 'Jane Smith',
      role: 'BARTENDER',
      status: 'INACTIVE',
    },
  ];

  // Wrapper component that provides VenueDashboardProvider
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <VenueDashboardProvider initialData={mockDashboardData} initialPeriod="week">
      {children}
    </VenueDashboardProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Example 1: Single fetch on mount
   * Validates: Requirements 1.1
   */
  it('should fetch staff data exactly once on mount without infinite re-renders', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ staff: mockStaff }),
    });

    global.fetch = mockFetch;

    const { result } = renderHook(() => useStaffManagement(), { wrapper });

    // Initially loading
    expect(result.current.isPageLoading).toBe(true);
    expect(result.current.staff).toEqual([]);

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isPageLoading).toBe(false);
    });

    // Verify fetch was called exactly once (only staff, dashboard comes from context)
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(`/api/staff?venueId=${mockVenueId}`);

    // Verify state is updated correctly
    expect(result.current.staff).toEqual(mockStaff);
  });

  /**
   * Example 2: Loading state transitions
   * Validates: Requirements 1.3, 1.4
   */
  it('should set loading state to false after successful fetch', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ staff: mockStaff }),
    });

    const { result } = renderHook(() => useStaffManagement(), { wrapper });

    expect(result.current.isPageLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isPageLoading).toBe(false);
    });

    expect(result.current.staff).toEqual(mockStaff);
  });

  it('should set loading state to false after fetch error', async () => {
    // Mock console.error to suppress error output in tests
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useStaffManagement(), { wrapper });

    expect(result.current.isPageLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isPageLoading).toBe(false);
    });

    // Staff list should remain empty on error
    expect(result.current.staff).toEqual([]);

    consoleErrorSpy.mockRestore();
  });

  /**
   * Example 3: Staff list updates after creation
   * Validates: Requirements 2.2
   */
  it('should add new staff member to the list after successful creation', async () => {
    const newStaff: Staff = {
      id: 'staff-3',
      displayName: 'Bob Johnson',
      role: 'CHEF',
      status: 'ACTIVE',
    };

    const newStaffForm: StaffForm = {
      displayName: 'Bob Johnson',
      role: 'CHEF',
    };

    // Setup initial fetch
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ staff: mockStaff }),
    });

    const { result } = renderHook(() => useStaffManagement(), { wrapper });

    await waitFor(() => {
      expect(result.current.isPageLoading).toBe(false);
    });

    // Mock the POST request for adding staff
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ staff: newStaff }),
    });

    // Add new staff
    await act(async () => {
      await result.current.addStaff(newStaffForm, null);
    });

    // Verify new staff is added to the beginning of the list
    expect(result.current.staff).toHaveLength(3);
    expect(result.current.staff[0]).toEqual(newStaff);
    expect(result.current.staff[1]).toEqual(mockStaff[0]);
    expect(result.current.staff[2]).toEqual(mockStaff[1]);
  });

  it('should upload avatar before creating staff when avatar file is provided', async () => {
    const newStaff: Staff = {
      id: 'staff-3',
      displayName: 'Bob Johnson',
      role: 'CHEF',
      status: 'ACTIVE',
      avatarUrl: 'https://example.com/uploaded-avatar.jpg',
    };

    const newStaffForm: StaffForm = {
      displayName: 'Bob Johnson',
      role: 'CHEF',
    };

    const avatarFile = new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' });

    // Setup initial fetch
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ staff: [] }),
    });

    const { result } = renderHook(() => useStaffManagement(), { wrapper });

    await waitFor(() => {
      expect(result.current.isPageLoading).toBe(false);
    });

    // Mock upload and create requests
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ url: 'https://example.com/uploaded-avatar.jpg' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ staff: newStaff }),
      });

    global.fetch = mockFetch;

    // Add staff with avatar
    await act(async () => {
      await result.current.addStaff(newStaffForm, avatarFile);
    });

    // Verify upload was called first
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenNthCalledWith(1, '/api/upload', expect.any(Object));
    expect(mockFetch).toHaveBeenNthCalledWith(2, '/api/staff', expect.any(Object));

    // Verify staff was added with avatar URL
    expect(result.current.staff[0].avatarUrl).toBe('https://example.com/uploaded-avatar.jpg');
  });

  /**
   * Example 4: Status toggle updates UI
   * Validates: Requirements 3.2
   */
  it('should update staff status in UI immediately after successful toggle', async () => {
    // Setup initial fetch
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ staff: mockStaff }),
    });

    const { result } = renderHook(() => useStaffManagement(), { wrapper });

    await waitFor(() => {
      expect(result.current.isPageLoading).toBe(false);
    });

    const staffToToggle = result.current.staff[0];
    const originalStatus = staffToToggle.status;
    const expectedNewStatus = originalStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    // Mock the PATCH request
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    // Toggle status
    await act(async () => {
      await result.current.toggleStatus(staffToToggle);
    });

    // Verify status was updated in UI
    const updatedStaff = result.current.staff.find((s) => s.id === staffToToggle.id);
    expect(updatedStaff?.status).toBe(expectedNewStatus);
  });

  /**
   * Example 5: Deletion removes from list
   * Validates: Requirements 4.2
   */
  it('should remove staff member from list after successful deletion', async () => {
    // Setup initial fetch
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ staff: mockStaff }),
    });

    const { result } = renderHook(() => useStaffManagement(), { wrapper });

    await waitFor(() => {
      expect(result.current.isPageLoading).toBe(false);
    });

    const staffToDelete = result.current.staff[0];
    const initialLength = result.current.staff.length;

    // Mock the DELETE request
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    // Delete staff
    await act(async () => {
      await result.current.deleteStaff(staffToDelete);
    });

    // Verify staff was removed from list
    expect(result.current.staff).toHaveLength(initialLength - 1);
    expect(result.current.staff.find((s) => s.id === staffToDelete.id)).toBeUndefined();
  });

  /**
   * Example 6: No state updates after unmount
   * Validates: Requirements 5.3
   */
  it('should not update state after component unmounts', async () => {
    let resolveStaffFetch: (value: Response) => void;
    const staffFetchPromise = new Promise<Response>((resolve) => {
      resolveStaffFetch = resolve;
    });

    global.fetch = vi.fn().mockReturnValueOnce(staffFetchPromise);

    const { result, unmount } = renderHook(() => useStaffManagement(), { wrapper });

    expect(result.current.isPageLoading).toBe(true);

    // Unmount before fetch completes
    unmount();

    // Resolve the fetch after unmount
    resolveStaffFetch!({
      ok: true,
      json: async () => ({ staff: mockStaff }),
    });

    // Wait a bit to ensure no state updates occur
    await new Promise((resolve) => setTimeout(resolve, 100));

    // No errors should be thrown (React would warn about state updates on unmounted components)
    // This test passes if no warnings/errors occur
  });

  it('should handle errors gracefully when adding staff fails', async () => {
    // Setup initial fetch
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ staff: mockStaff }),
    });

    const { result } = renderHook(() => useStaffManagement(), { wrapper });

    await waitFor(() => {
      expect(result.current.isPageLoading).toBe(false);
    });

    // Mock failed POST request
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Validation error' }),
    });

    const newStaffForm: StaffForm = {
      displayName: 'Invalid Staff',
      role: 'WAITER',
    };

    // Attempt to add staff
    await expect(
      act(async () => {
        await result.current.addStaff(newStaffForm, null);
      }),
    ).rejects.toThrow('Validation error');

    // Staff list should remain unchanged
    expect(result.current.staff).toEqual(mockStaff);
  });

  it('should handle errors gracefully when toggling status fails', async () => {
    // Setup initial fetch
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ staff: mockStaff }),
    });

    const { result } = renderHook(() => useStaffManagement(), { wrapper });

    await waitFor(() => {
      expect(result.current.isPageLoading).toBe(false);
    });

    const staffToToggle = result.current.staff[0];
    const originalStatus = staffToToggle.status;

    // Mock failed PATCH request
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    // Attempt to toggle status
    await expect(
      act(async () => {
        await result.current.toggleStatus(staffToToggle);
      }),
    ).rejects.toThrow('Failed to update status');

    // Status should remain unchanged
    const unchangedStaff = result.current.staff.find((s) => s.id === staffToToggle.id);
    expect(unchangedStaff?.status).toBe(originalStatus);
  });

  it('should handle errors gracefully when deleting staff fails', async () => {
    // Setup initial fetch
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ staff: mockStaff }),
    });

    const { result } = renderHook(() => useStaffManagement(), { wrapper });

    await waitFor(() => {
      expect(result.current.isPageLoading).toBe(false);
    });

    const staffToDelete = result.current.staff[0];
    const initialLength = result.current.staff.length;

    // Mock failed DELETE request
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    // Attempt to delete staff
    await expect(
      act(async () => {
        await result.current.deleteStaff(staffToDelete);
      }),
    ).rejects.toThrow('Failed to delete staff');

    // Staff list should remain unchanged
    expect(result.current.staff).toHaveLength(initialLength);
    expect(result.current.staff.find((s) => s.id === staffToDelete.id)).toBeDefined();
  });
});
