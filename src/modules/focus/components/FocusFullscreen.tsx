import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Minimize2 } from 'lucide-react';
import type { Ticket } from '@/db/database';
import type { MoveTarget } from '@/modules/kanban/components/TicketCard';
import type { PomodoroPhase, PomodoroSettings } from '@/modules/focus/types';
import { FocusTicketCard } from './FocusTicketCard';
import { PomodoroTimer } from './PomodoroTimer';

interface FocusFullscreenProps {
  readonly ticket: Ticket;
  readonly originalColumnId: string;
  readonly moveTargets: readonly MoveTarget[];
  readonly onDone: () => void;
  readonly onDismiss: () => void;
  readonly onMoveTo: (columnId: string) => void;
  readonly phase: PomodoroPhase;
  readonly display: string;
  readonly running: boolean;
  readonly completedSessions: number;
  readonly settings: PomodoroSettings;
  readonly onStart: () => void;
  readonly onPause: () => void;
  readonly onReset: () => void;
  readonly onSwitchPhase: (phase: PomodoroPhase, autoStart?: boolean) => void;
  readonly onExit: () => void;
}

const PHASE_BACKGROUNDS: Record<PomodoroPhase, string> = {
  work: 'bg-neutral-100 dark:bg-neutral-950',
  shortBreak: 'bg-neutral-100 dark:bg-neutral-950',
  longBreak: 'bg-neutral-100 dark:bg-neutral-950',
};

export function FocusFullscreen({
  ticket,
  originalColumnId,
  moveTargets,
  onDone,
  onDismiss,
  onMoveTo,
  phase,
  display,
  running,
  completedSessions,
  settings,
  onStart,
  onPause,
  onReset,
  onSwitchPhase,
  onExit,
}: FocusFullscreenProps) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
  }, []);

  useEffect(() => {
    if (!isClosing) return;
    const timeout = globalThis.setTimeout(onExit, 200);
    return () => globalThis.clearTimeout(timeout);
  }, [isClosing, onExit]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        handleClose();
      }
    };
    globalThis.addEventListener('keydown', handleKeyDown, true);
    return () => globalThis.removeEventListener('keydown', handleKeyDown, true);
  }, [handleClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const background = PHASE_BACKGROUNDS[phase];

  return createPortal(
    <dialog
      open
      className={`focus-fullscreen-overlay fixed inset-0 z-[200] ${background} ${isClosing ? 'focus-fullscreen-exit' : 'focus-fullscreen-enter'} w-full h-full max-w-none max-h-none m-0 p-0 border-none`}
      aria-label="Focus mode fullscreen"
    >
      <div className="absolute top-5 right-5 z-10">
        <button
          type="button"
          onClick={handleClose}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white/70 dark:bg-neutral-800/70 text-neutral-600 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-700 backdrop-blur-sm border border-neutral-200/50 dark:border-neutral-700/50 transition-all shadow-sm"
          aria-label="Exit fullscreen"
        >
          <Minimize2 className="size-3.5" aria-hidden />
          <span className="hidden sm:inline">Exit</span>
        </button>
      </div>

      <div className="flex items-center justify-center h-full px-8 py-12">
        <div className="flex w-full max-w-6xl gap-8 h-full max-h-[600px]">
          <div className="flex-[3] min-w-0 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm rounded-2xl p-8 border border-neutral-200/50 dark:border-neutral-700/50 shadow-lg">
            <FocusTicketCard
              ticket={ticket}
              originalColumnId={originalColumnId}
              moveTargets={moveTargets}
              onDone={onDone}
              onDismiss={onDismiss}
              onMoveTo={onMoveTo}
            />
          </div>

          <div className="flex-[2] min-w-0">
            <PomodoroTimer
              phase={phase}
              display={display}
              running={running}
              completedSessions={completedSessions}
              settings={settings}
              onStart={onStart}
              onPause={onPause}
              onReset={onReset}
              onSwitchPhase={onSwitchPhase}
            />
          </div>
        </div>
      </div>

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2">
        <span className="text-xs text-neutral-400 dark:text-neutral-500 select-none">
          Press <kbd className="px-1.5 py-0.5 rounded bg-white/60 dark:bg-neutral-800/60 border border-neutral-200/50 dark:border-neutral-700/50 text-neutral-500 dark:text-neutral-400 font-mono text-[10px]">Esc</kbd> to exit
        </span>
      </div>
    </dialog>,
    document.body,
  );
}
