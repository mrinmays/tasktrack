import { useEffect, useRef } from 'react';
import type { PomodoroPhase } from '@/modules/focus/types';

function phaseMessage(phase: PomodoroPhase): string {
  return phase === 'work' ? 'Time to focus!' : 'Time for a break!';
}

export function useDocumentTitle(
  display: string,
  phase: PomodoroPhase,
  isActive: boolean,
): void {
  const originalTitleRef = useRef(document.title);

  useEffect(() => {
    const savedTitle = originalTitleRef.current;
    if (!isActive) {
      document.title = savedTitle;
      return;
    }
    document.title = `${display} - ${phaseMessage(phase)}`;
    return () => {
      document.title = savedTitle;
    };
  }, [display, phase, isActive]);
}
