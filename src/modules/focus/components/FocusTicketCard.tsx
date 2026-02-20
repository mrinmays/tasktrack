import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ArrowRightLeft, CheckCircle2, ChevronRight } from 'lucide-react';
import { Tooltip } from '@/components/Tooltip';
import type { Ticket } from '@/db/database';
import type { MoveTarget } from '@/modules/kanban/components/TicketCard';
import { SanitizedHtml } from '@/modules/kanban/components/SanitizedHtml';

interface FocusTicketCardProps {
  readonly ticket: Ticket;
  readonly originalColumnId: string;
  readonly moveTargets: readonly MoveTarget[];
  readonly onDone: () => void;
  readonly onDismiss: () => void;
  readonly onMoveTo: (columnId: string) => void;
}

export function FocusTicketCard({
  ticket,
  originalColumnId,
  moveTargets,
  onDone,
  onDismiss,
  onMoveTo,
}: FocusTicketCardProps) {
  const moveDestinations = moveTargets.filter((t) => t.id !== originalColumnId);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="order-2 lg:order-1 shrink-0 mt-3 lg:mt-0">
        <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-4">
          {ticket.title}
        </h3>
        {ticket.type === 'jira' && ticket.jiraData && (
          <div className="mt-1.5 flex flex-wrap items-start gap-2">
            <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded break-words whitespace-normal max-w-full">
              {ticket.jiraData.jiraKey}
            </span>
            {ticket.jiraData.status && (
              <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded font-medium break-words whitespace-normal max-w-full">
                {ticket.jiraData.status}
              </span>
            )}
            {ticket.jiraData.priority && (
              <span className="text-xs px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded font-medium break-words whitespace-normal max-w-full">
                {ticket.jiraData.priority}
              </span>
            )}
          </div>
        )}
        {ticket.type === 'local' && ticket.customKey && (
          <div className="mt-1.5 flex flex-wrap items-start gap-2">
            <span className="text-xs px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded break-words whitespace-normal max-w-full">
              {ticket.customKey}
            </span>
            {ticket.priority && (
              <span className="text-xs px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded font-medium break-words whitespace-normal max-w-full">
                {ticket.priority}
              </span>
            )}
          </div>
        )}
        {ticket.type === 'local' && !ticket.customKey && ticket.priority && (
          <div className="mt-1.5 flex flex-wrap items-start gap-2">
            <span className="text-xs px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded font-medium break-words whitespace-normal max-w-full">
              {ticket.priority}
            </span>
          </div>
        )}
      </div>

      {ticket.description && typeof ticket.description === 'string' && (
        <div className="order-3 lg:order-2 flex-1 min-h-0 mt-3 lg:mt-2 overflow-y-auto">
          <SanitizedHtml
            html={ticket.description}
            className="text-sm text-neutral-600 dark:text-neutral-400 ticket-description-content"
          />
        </div>
      )}

      <div className="order-1 lg:order-3 mt-4 flex flex-wrap items-center gap-2 pb-3 border-b border-neutral-200 dark:border-neutral-700 lg:pb-0 lg:pt-3 lg:border-b-0 lg:border-t">
        <button
          type="button"
          onClick={onDone}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
        >
          <CheckCircle2 className="size-3.5" aria-hidden />
          Done
        </button>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
            >
              <ArrowRightLeft className="size-3.5" aria-hidden />
              Move to...
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="z-[60] min-w-[10rem] rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 py-1 shadow-lg"
              sideOffset={4}
            >
              {moveDestinations.map((dest) => (
                <DropdownMenu.Item
                  key={dest.id}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer data-[highlighted]:bg-neutral-100 dark:data-[highlighted]:bg-neutral-700 outline-none"
                  onSelect={() => onMoveTo(dest.id)}
                >
                  <ChevronRight className="size-3.5" aria-hidden />
                  {dest.title}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        <Tooltip content="Return to original column">
          <button
            type="button"
            onClick={onDismiss}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          >
            Dismiss
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
