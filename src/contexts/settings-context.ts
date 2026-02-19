import { createContext } from 'react';
import type { SectionId } from '@/modules/settings';

export interface SettingsContextValue {
  openSettings: (section?: SectionId) => void;
}

export const SettingsContext = createContext<SettingsContextValue | null>(null);
