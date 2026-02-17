import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Select from "@radix-ui/react-select";
import {
  ArrowRightLeft,
  ChevronRight,
  Eye,
  MoreVertical,
  Pencil,
  PlayCircle,
  Trash2,
} from "lucide-react";
import { Tooltip } from "@/components/Tooltip";
import { useEffect, useRef, useState } from "react";
import type { Ticket } from "@/db/database";
import { registerTicket, unregisterTicket } from "@/contexts/ticketRegistry";
import { useTicketDetail } from "@/hooks/useTicketDetail";
import { stripHtml } from "@/utils/sanitizeHtml";
import { TicketDescriptionEditor } from "@/components/TicketDescriptionEditor";
import { isEmptyEditorHtml } from "@/utils/editorHtml";
import { TICKET_PRIORITY_VALUES, type TicketPriority } from "@/modules/tickets";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";

type EditablePriority = TicketPriority | "none";

export interface MoveTarget {
  id: string;
  title: string;
}

interface TicketCardProps {
  readonly ticket: Ticket;
  readonly moveTargets?: readonly MoveTarget[];
  readonly onMove?: (ticketId: string, columnId: string) => void;
  readonly onDelete?: (ticketId: string) => void;
  readonly deleting?: boolean;
  readonly onTicketUpdate?: (
    ticketId: string,
    updates: {
      title?: string;
      description?: string;
      priority?: TicketPriority | undefined;
    },
  ) => void;
  readonly onRefresh?: () => void;
  readonly onStartFocus?: (ticket: Ticket) => void;
  readonly focusActive?: boolean;
}

export function TicketCard({
  ticket,
  moveTargets,
  onMove,
  onDelete,
  deleting = false,
  onTicketUpdate,
  onRefresh,
  onStartFocus,
  focusActive = false,
}: TicketCardProps) {
  const { openTicketDetail } = useTicketDetail();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(ticket.title);
  const [editDescription, setEditDescription] = useState(
    ticket.description ?? "",
  );
  const [editPriority, setEditPriority] = useState<EditablePriority>(
    ticket.priority ?? "none",
  );
  const editTitleRef = useRef(ticket.title);
  const editDescRef = useRef(ticket.description ?? "");
  const editPriorityRef = useRef(ticket.priority);

  useEffect(() => {
    registerTicket(ticket);
    return () => unregisterTicket(ticket.id);
  }, [ticket.id, ticket]);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: ticket.id,
    data: {
      type: "ticket" as const,
      columnId: ticket.columnId,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const hasMenuActions = Boolean(
    onMove || onDelete || (onTicketUpdate && onRefresh),
  );
  const showMenu = Boolean(moveTargets && hasMenuActions);
  const moveDestinations =
    showMenu && moveTargets
      ? moveTargets.filter((t) => t.id !== ticket.columnId)
      : [];

  const openEdit = () => {
    editTitleRef.current = ticket.title;
    editDescRef.current = ticket.description ?? "";
    editPriorityRef.current = ticket.priority;
    setEditTitle(ticket.title);
    setEditDescription(ticket.description ?? "");
    setEditPriority(ticket.priority ?? "none");
    setEditOpen(true);
  };

  const saveEdit = () => {
    const title = editTitle.trim();
    const rawDesc = editDescription.trim();
    const desc = rawDesc && !isEmptyEditorHtml(rawDesc) ? rawDesc : undefined;
    const priority = editPriority === "none" ? undefined : editPriority;
    if (
      title &&
      (title !== editTitleRef.current ||
        desc !== (editDescRef.current ?? "") ||
        priority !== editPriorityRef.current)
    ) {
      onTicketUpdate?.(ticket.id, {
        title,
        description: desc,
        priority,
      });
      onRefresh?.();
    }
    setEditOpen(false);
  };

  const dragProps = showMenu ? {} : { ...attributes, ...listeners };
  const contentDragProps = showMenu ? { ...attributes, ...listeners } : {};

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-3 mb-2 hover:shadow-md transition-shadow flex flex-col ${showMenu ? "" : "cursor-move"}`}
      {...dragProps}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className={`flex-1 min-w-0 ${showMenu ? "cursor-move" : ""}`}
          {...contentDragProps}
        >
          <button
            type="button"
            className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 text-left hover:text-neutral-600 dark:hover:text-neutral-300 hover:underline transition-colors w-full line-clamp-4"
            onClick={(e) => {
              e.stopPropagation();
              openTicketDetail(ticket);
            }}
          >
            {ticket.title}
          </button>
          {ticket.description && typeof ticket.description === "string" && (
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2">
              {stripHtml(ticket.description)}
            </p>
          )}
          {ticket.type === "jira" && ticket.jiraData && (
            <div className="mt-2 flex items-center flex-wrap gap-2">
              <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded">
                {ticket.jiraData.jiraKey}
              </span>
              {ticket.jiraData.priority && (
                <span className="text-xs px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded font-medium">
                  {ticket.jiraData.priority}
                </span>
              )}
            </div>
          )}
          {ticket.type === "local" && ticket.customKey && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded">
                {ticket.customKey}
              </span>
              {ticket.priority && (
                <span className="text-xs px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded font-medium">
                  {ticket.priority}
                </span>
              )}
            </div>
          )}
          {ticket.type === "local" && !ticket.customKey && ticket.priority && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded font-medium">
                {ticket.priority}
              </span>
            </div>
          )}
        </div>
        {showMenu && (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                className="shrink-0 p-1 rounded text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-700 dark:hover:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-500"
                aria-label="Ticket options"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <MoreVertical className="size-4" aria-hidden />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="z-[60] min-w-[10rem] rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 py-1 shadow-lg"
                side="right"
                sideOffset={8}
                align="start"
              >
                {onMove && moveDestinations.length > 0 && (
                  <DropdownMenu.Sub>
                    <DropdownMenu.SubTrigger className="flex items-center justify-between gap-2 px-3 py-1.5 text-sm text-neutral-700 dark:text-neutral-300 data-[highlighted]:bg-neutral-100 dark:data-[highlighted]:bg-neutral-700 outline-none">
                      <span className="flex items-center gap-2">
                        <ArrowRightLeft className="size-3.5" aria-hidden />
                        Move to…
                      </span>
                      <ChevronRight className="size-3.5 shrink-0" aria-hidden />
                    </DropdownMenu.SubTrigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.SubContent
                        className="z-[60] min-w-[10rem] rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 py-1 shadow-lg"
                        sideOffset={4}
                        avoidCollisions={false}
                      >
                        {moveDestinations.map((dest) => (
                          <DropdownMenu.Item
                            key={dest.id}
                            className="px-3 py-1.5 text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer data-[highlighted]:bg-neutral-100 dark:data-[highlighted]:bg-neutral-700 outline-none"
                            onSelect={() => onMove(ticket.id, dest.id)}
                          >
                            {dest.title}
                          </DropdownMenu.Item>
                        ))}
                      </DropdownMenu.SubContent>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Sub>
                )}
                <DropdownMenu.Item
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer data-[highlighted]:bg-neutral-100 dark:data-[highlighted]:bg-neutral-700 outline-none"
                  onSelect={() => openTicketDetail(ticket)}
                >
                  <Eye className="size-3.5" aria-hidden />
                  View details
                </DropdownMenu.Item>
                {onTicketUpdate && onRefresh && (
                  <DropdownMenu.Item
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer data-[highlighted]:bg-neutral-100 dark:data-[highlighted]:bg-neutral-700 outline-none"
                    onSelect={openEdit}
                  >
                    <Pencil className="size-3.5" aria-hidden />
                    Edit
                  </DropdownMenu.Item>
                )}
                {onDelete && (
                  <>
                    <DropdownMenu.Separator className="my-1 h-px bg-neutral-200 dark:bg-neutral-700" />
                    <DropdownMenu.Item
                      className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 cursor-pointer data-[highlighted]:bg-red-50 dark:data-[highlighted]:bg-red-950/40 outline-none disabled:opacity-60"
                      disabled={deleting}
                      onSelect={(event) => {
                        event.preventDefault();
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="size-3.5" aria-hidden />
                      Delete
                    </DropdownMenu.Item>
                  </>
                )}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        )}
      </div>

      {onStartFocus && (
        <div className="flex justify-end mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-700/50">
          <Tooltip
            content={
              focusActive
                ? "Another ticket is in focus"
                : "Start focused work session"
            }
          >
            <button
              type="button"
              disabled={focusActive}
              onClick={(e) => {
                e.stopPropagation();
                onStartFocus(ticket);
              }}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-neutral-500 dark:disabled:hover:text-neutral-400 disabled:hover:bg-transparent"
            >
              <PlayCircle className="size-3.5" aria-hidden />
              Focus
            </button>
          </Tooltip>
        </div>
      )}

      <Dialog.Root open={editOpen} onOpenChange={setEditOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40" />
          <Dialog.Content
            className="fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white dark:bg-neutral-800 p-4 shadow-xl"
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <Dialog.Title className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Edit ticket
            </Dialog.Title>
            <Dialog.Description className="sr-only">
              Edit ticket title and description
            </Dialog.Description>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveEdit();
              }}
              className="mt-3 space-y-3"
            >
              <label className="block">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Title
                </span>
                <textarea
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  rows={1}
                  className="mt-1 w-full rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 px-3 py-2 text-sm focus:border-neutral-400 dark:focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-500 resize-none"
                  required
                />
              </label>
              <label htmlFor="ticket-edit-description" className="block">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Description
                </span>
                <div className="mt-1">
                  <TicketDescriptionEditor
                    id="ticket-edit-description"
                    value={editDescription}
                    onChange={setEditDescription}
                    placeholder="Description (optional)"
                    minHeight="4rem"
                  />
                </div>
              </label>
              {ticket.type === "local" && (
                <label className="block">
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Priority
                  </span>
                  <Select.Root
                    value={editPriority}
                    onValueChange={(value) =>
                      setEditPriority(value as EditablePriority)
                    }
                  >
                    <Select.Trigger className="mt-1 inline-flex w-full items-center justify-between px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md text-sm bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-500 focus:border-neutral-400 dark:focus:border-neutral-500 outline-none">
                      <Select.Value placeholder="No priority" />
                      <Select.Icon>
                        <ChevronRight
                          className="size-3.5 text-neutral-500 dark:text-neutral-400 rotate-90"
                          aria-hidden
                        />
                      </Select.Icon>
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Content
                        className="z-[60] overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-lg"
                        position="popper"
                        sideOffset={4}
                        align="start"
                      >
                        <Select.Viewport className="p-1">
                          <Select.Item
                            value="none"
                            className="flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-700 dark:text-neutral-300 rounded cursor-pointer outline-none data-[highlighted]:bg-neutral-100 dark:data-[highlighted]:bg-neutral-700"
                          >
                            <Select.ItemText>No priority</Select.ItemText>
                          </Select.Item>
                          {TICKET_PRIORITY_VALUES.map((priority) => (
                            <Select.Item
                              key={priority}
                              value={priority}
                              className="flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-700 dark:text-neutral-300 rounded cursor-pointer outline-none data-[highlighted]:bg-neutral-100 dark:data-[highlighted]:bg-neutral-700"
                            >
                              <Select.ItemText>{priority}</Select.ItemText>
                            </Select.Item>
                          ))}
                        </Select.Viewport>
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>
                </label>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="px-3 py-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-700 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-600"
                  >
                    Cancel
                  </button>
                </Dialog.Close>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-sm font-medium text-white dark:text-neutral-900 bg-neutral-800 dark:bg-neutral-200 rounded-md hover:bg-neutral-700 dark:hover:bg-neutral-300"
                >
                  Save
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {onDelete && (
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete ticket?"
          description={`"${ticket.title}" will be permanently deleted.`}
          loading={deleting}
          onConfirm={() => {
            onDelete(ticket.id);
            setDeleteDialogOpen(false);
          }}
        />
      )}
    </div>
  );
}
