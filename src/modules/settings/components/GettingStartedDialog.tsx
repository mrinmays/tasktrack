import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

interface GettingStartedDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export function GettingStartedDialog({
  open,
  onOpenChange,
}: GettingStartedDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[101] w-[92vw] max-w-2xl max-h-[80vh] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white dark:bg-neutral-900 shadow-2xl focus:outline-none overflow-hidden">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-700 px-5 py-4">
            <div>
              <Dialog.Title className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Getting Started
              </Dialog.Title>
              <Dialog.Description className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                A quick guide for general-purpose TaskTrack usage.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="p-1.5 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
                aria-label="Close getting started"
              >
                <X className="size-5" aria-hidden />
              </button>
            </Dialog.Close>
          </div>

          <div className="px-5 py-4 overflow-y-auto space-y-5">
            <section className="space-y-1.5">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                What is TaskTrack?
              </h3>
              <p className="text-sm leading-6 text-neutral-700 dark:text-neutral-300">
                TaskTrack is a focused workspace for managing your assigned
                work. It presents your tickets in a clean, local Kanban board
                designed for clarity, prioritization, and execution without the
                typical overhead.
              </p>
            </section>

            <section className="space-y-1.5">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Why TaskTrack?
              </h3>
              <p className="text-sm leading-6 text-neutral-700 dark:text-neutral-300">
                Opening JIRA often means navigating layers of UI before reaching
                the work that matters. TaskTrack removes that friction by giving
                you a fast, distraction-free view of your tickets.
              </p>
            </section>

            <section className="space-y-1.5">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Read-Only by Design
              </h3>
              <p className="text-sm leading-6 text-neutral-700 dark:text-neutral-300">
                TaskTrack never modifies your JIRA data. The integration is
                intentionally read-only.
              </p>
              <p className="text-sm leading-6 text-neutral-700 dark:text-neutral-300">
                Required permissions:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
                <li>
                  <strong>read:user</strong> — used only to identify your
                  account
                </li>
                <li>
                  <strong>read:work</strong> — used only to fetch assigned
                  tickets
                </li>
              </ul>
              <p className="text-sm leading-6 text-neutral-700 dark:text-neutral-300">
                Nothing performed inside TaskTrack affects your actual JIRA
                tickets.
              </p>
            </section>

            <section className="space-y-1.5">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Core Workflow
              </h3>
              <p className="text-sm leading-6 text-neutral-700 dark:text-neutral-300">
                Sync your JIRA tickets and organize them into a local Kanban
                board. Prioritize what deserves attention, move items across
                columns, and focus on execution.
              </p>
            </section>

            <section className="space-y-1.5">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Built for Focus
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
                <li>First-class Pomodoro support</li>
                <li>Sort tickets by Updated, Created, or Priority</li>
                <li>Fast search and keyboard navigation</li>
                <li>Lightweight ticket details on demand</li>
              </ul>
            </section>

            <section className="space-y-1.5">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Local Tickets
              </h3>
              <p className="text-sm leading-6 text-neutral-700 dark:text-neutral-300">
                Not all work originates in JIRA. TaskTrack allows creation of
                local-only tickets.
              </p>
              <p className="text-sm leading-6 text-neutral-700 dark:text-neutral-300">
                You can:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
                <li>Add descriptions</li>
                <li>Assign priority</li>
                <li>Link them to JIRA tickets when needed</li>
              </ul>
            </section>

            <section className="space-y-1.5">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Ticket Details
              </h3>
              <p className="text-sm leading-6 text-neutral-700 dark:text-neutral-300">
                Click any ticket title to view its details instantly, without
                leaving your workflow.
              </p>
            </section>

            <section className="space-y-1.5">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                How to Get Started
              </h3>
              <ol className="list-decimal pl-5 space-y-1 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
                <li>Connect TaskTrack to JIRA</li>
                <li>Sync your assigned tickets</li>
                <li>Prioritize and organize your board</li>
                <li>Start focused execution</li>
              </ol>
              <p className="text-sm leading-6 text-neutral-700 dark:text-neutral-300">
                TaskTrack is designed to reduce cognitive load, minimize context
                switching, and keep your attention on completing work.
              </p>
            </section>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
