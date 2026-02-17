import { createContext } from 'react';

export type ThemeChoice = 'light' | 'dark';

export interface ThemeContextValue {
  theme: ThemeChoice;
  setTheme: (t: ThemeChoice) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);
