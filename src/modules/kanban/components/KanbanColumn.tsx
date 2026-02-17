import { useDndContext, useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { GripVertical, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Column } from "@/modules/kanban/types";
import type { Ticket } from "@/db/database";
import type { MoveTarget } from "@/modules/kanban/components/TicketCard";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { TicketCard } from "./TicketCard";

interface KanbanColumnProps {
  readonly column: Column;
  readonly tickets: Ticket[];
  readonly moveTargets: MoveTarget[];
  readonly onTitleUpdate: (columnId: string, newTitle: string) => void;
  readonly onDelete: (columnId: string) => void;
  readonly deleting: boolean;
  readonly onTicketMove: (ticketId: string, columnId: string) => void;
  readonly onTicketDelete: (ticketId: string) => void;
  readonly deletingTicket: boolean;
  readonly onStartFocus?: (ticket: Ticket) => void;
  readonly focusActive?: boolean;
}

export function KanbanColumn({
  column,
  tickets,
  moveTargets,
  onTitleUpdate,
  onDelete,
  deleting,
  onTicketMove,
  onTicketDelete,
  deletingTicket,
  onStartFocus,
  focusActive,
}: KanbanColumnProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const {
    setNodeRef,
    setActivatorNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: { type: "column" as const },
    disabled: isEditing,
  });

  const { active } = useDndContext();
  const isTicketDragActive = active?.data.current?.type === "ticket";

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: column.id,
  });
  const isTicketDropOver = isOver && isTicketDragActive;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleTitleSubmit = () => {
    if (editTitle.trim() && editTitle !== column.title) {
      onTitleUpdate(column.id, editTitle.trim());
    } else {
      setEditTitle(column.title);
    }
    setIsEditing(false);
  };

  const handleTitleCancel = () => {
    setEditTitle(column.title);
    setIsEditing(false);
  };

  const handleStartEditing = () => {
    setEditTitle(column.title);
    setIsEditing(true);
  };

  const handleDelete = () => {
    onDelete(column.id);
    setDeleteDialogOpen(false);
  };

  useEffect(() => {
    if (isEditing) {
      titleInputRef.current?.focus();
    }
  }, [isEditing]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex-shrink-0 w-72 bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 flex flex-col"
    >
      <div className="mb-4">
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleTitleSubmit();
              } else if (e.key === "Escape") {
                handleTitleCancel();
              }
            }}
            className="w-full px-2 py-1 text-lg font-semibold text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-700 border border-neutral-400 dark:border-neutral-500 rounded focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-500"
            ref={titleInputRef}
          />
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              ref={setActivatorNodeRef}
              className="shrink-0 p-1 rounded text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-700 dark:hover:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-500 cursor-grab active:cursor-grabbing touch-none"
              aria-label={`Drag ${column.title} column`}
              {...attributes}
              {...listeners}
            >
              <GripVertical className="size-4" aria-hidden />
            </button>
            <h2 className="flex-1 px-1 py-1 text-lg font-semibold text-neutral-900 dark:text-neutral-100 truncate">
              {column.title}
            </h2>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  type="button"
                  className="shrink-0 p-1 rounded text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-700 dark:hover:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-500"
                  aria-label={`${column.title} column options`}
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
                  <DropdownMenu.Item
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-700 dark:text-neutral-200 cursor-pointer data-[highlighted]:bg-neutral-100 dark:data-[highlighted]:bg-neutral-700 outline-none"
                    onSelect={(event) => {
                      event.preventDefault();
                      handleStartEditing();
                    }}
                  >
                    <Pencil className="size-3.5" aria-hidden />
                    Rename
                  </DropdownMenu.Item>
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
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>

            <DeleteConfirmationDialog
              open={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
              title="Delete column?"
              description={`"${column.title}" will be deleted and all tickets in this column will move to Inbox.`}
              loading={deleting}
              onConfirm={handleDelete}
            />
          </div>
        )}
        <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          {tickets.length} tickets
        </div>
      </div>

      <div
        ref={setDropRef}
        className={`flex-1 overflow-y-auto min-h-[8rem] rounded-md border-2 border-dashed p-2 transition-colors duration-150 ${
          isTicketDropOver
            ? "border-blue-500 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-950/30"
            : "border-neutral-200/60 dark:border-neutral-600/60"
        }`}
      >
        {tickets.map((ticket) => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            moveTargets={moveTargets}
            onMove={onTicketMove}
            onDelete={onTicketDelete}
            deleting={deletingTicket}
            onStartFocus={onStartFocus}
            focusActive={focusActive}
          />
        ))}
        {tickets.length === 0 && isTicketDropOver && (
          <div className="flex flex-col items-center justify-center min-h-[8rem] gap-2 text-sm text-blue-600 dark:text-blue-400 transition-colors">
            <span className="font-medium">Drop here</span>
            <span className="text-xs">Release to move ticket</span>
          </div>
        )}
      </div>
    </div>
  );
}
