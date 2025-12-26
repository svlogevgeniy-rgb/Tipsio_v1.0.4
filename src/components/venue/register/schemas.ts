import { z } from 'zod';
import { DISTRIBUTION_MODE_VALUES } from '@/types/distribution';

export const step1Schema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
    venueName: z.string().min(2, 'Venue name must be at least 2 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const step2Schema = z.object({
  clientKey: z.string().min(1, 'Client Key is required'),
  serverKey: z.string().min(1, 'Server Key is required'),
  merchantId: z.string().min(1, 'Merchant ID is required'),
});

export const step3Schema = z.object({
  distributionMode: z.enum(DISTRIBUTION_MODE_VALUES),
});

export type Step1Form = z.infer<typeof step1Schema>;
export type Step2Form = z.infer<typeof step2Schema>;
export type Step3Form = z.infer<typeof step3Schema>;
