/**
 * Hook for persisting venue registration state across steps
 */

import { useSessionStorageGroup } from '@/hooks/use-session-storage';
import type { Step1Form, Step2Form } from './schemas';

interface RegisterState extends Record<string, unknown> {
  step: number;
  step1Data: Step1Form | null;
  step2Data: Step2Form | null;
  midtransValid: boolean;
}

const INITIAL_STATE: RegisterState = {
  step: 1,
  step1Data: null,
  step2Data: null,
  midtransValid: false,
};

export function usePersistedRegisterState() {
  const { values, setValue, clearAll } = useSessionStorageGroup<RegisterState>(
    'venueRegister',
    INITIAL_STATE
  );

  return {
    step: values.step,
    setStep: (step: number) => setValue('step', step),
    step1Data: values.step1Data,
    setStep1Data: (data: Step1Form | null) => setValue('step1Data', data),
    step2Data: values.step2Data,
    setStep2Data: (data: Step2Form | null) => setValue('step2Data', data),
    midtransValid: values.midtransValid,
    setMidtransValid: (valid: boolean) => setValue('midtransValid', valid),
    clearPersistedState: clearAll,
  };
}
