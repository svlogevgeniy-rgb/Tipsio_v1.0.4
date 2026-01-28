import { z } from 'zod';
import { STAFF_ROLES } from '@/lib/constants';

export const staffSchema = z.object({
  displayName: z.string().min(1, 'Display name is required'),
  fullName: z.string().optional(),
  role: z.enum(STAFF_ROLES),
  avatarUrl: z.string().optional(),
});

export type StaffForm = z.infer<typeof staffSchema>;

export interface Staff {
  id: string;
  displayName: string;
  fullName?: string;
  role: string;
  status: string;
  avatarUrl?: string | null;
  balance?: number;
  totalTips?: number;
  qrCode?: { id: string; shortCode: string; status: string };
  user?: { email?: string; phone?: string };
  _count?: { tips: number };
  createdAt?: string;
}
