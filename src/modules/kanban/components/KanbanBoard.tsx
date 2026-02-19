import {
  SortableContext,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Columns3, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Ticket } from "@/db/database";
import { INBOX_COLUMN_ID } from "@/modules/inbox/types";
import { FocusZone, useFocusZone } from "@/modules/focus";
import { useKanban } from "@/modules/kanban/hooks/useKanban";
import { KanbanColumn } from "./KanbanColumn";

export function KanbanBoard() {
  const {
    columns,
    getTicketsForColumn,
    handleTicketMove,
    handleTicketDelete,
    handleColumnTitleUpdate,
    handleColumnCreate,
    handleColumnDelete,
    creatingColumn,
    deletingColumn,
    deletingTicket,
    loading,
  } = useKanban();
  const { focusedData, focusActive, startFocus, endFocus } = useFocusZone();
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [showCreateColumnInput, setShowCreateColumnInput] = useState(false);
  const createColumnInputRef = useRef<HTMLInputElement>(null);

  const hasColumns = columns.length > 0;

  const moveTargets = useMemo(
    () => [{ id: INBOX_COLUMN_ID, title: "Inbox" }, ...columns],
    [columns],
  );

  const handleStartFocus = useCallback(
    (ticket: Ticket) => {
      if (focusActive) return;
      startFocus(ticket);
    },
    [focusActive, startFocus],
  );

  useEffect(() => {
    if (showCreateColumnInput) {
      createColumnInputRef.current?.focus();
    }
  }, [showCreateColumnInput]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-neutral-600 dark:text-neutral-400">Loading...</div>
      </div>
    );
  }

  const handleCreateSubmit = () => {
    const normalizedTitle = newColumnTitle.trim();
    if (!normalizedTitle) {
      return;
    }
    handleColumnCreate(normalizedTitle);
    setNewColumnTitle("");
    setShowCreateColumnInput(false);
  };

  return (
    <div className="h-screen bg-neutral-100 dark:bg-neutral-900 flex flex-col">
      <FocusZone
        moveTargets={moveTargets}
        onTicketMove={handleTicketMove}
        focusedData={focusedData}
        onEndFocus={endFocus}
      />
      <div className="px-6 pt-4 pb-2 flex items-center justify-between gap-4 min-h-12">
        <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Board
        </h1>
        {hasColumns && (
          <div className="w-[28rem] flex justify-end">
            {showCreateColumnInput ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  placeholder="New column title"
                  className="h-8 w-52 px-3 text-sm text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleCreateSubmit();
                    } else if (e.key === "Escape") {
                      setShowCreateColumnInput(false);
                      setNewColumnTitle("");
                    }
                  }}
                  ref={createColumnInputRef}
                />
                <button
                  type="button"
                  onClick={handleCreateSubmit}
                  disabled={creatingColumn}
                  className="h-8 px-3 text-sm font-medium rounded border border-neutral-700 dark:border-neutral-300 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateColumnInput(false);
                    setNewColumnTitle("");
                  }}
                  className="h-8 px-3 text-sm font-medium rounded border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowCreateColumnInput(true)}
                className="inline-flex items-center gap-2 h-8 px-3 text-sm font-medium rounded border border-neutral-700 dark:border-neutral-300 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              >
                <Plus className="size-4" aria-hidden />
                Add column
              </button>
            )}
          </div>
        )}
      </div>

      {hasColumns ? (
        <SortableContext
          items={columns.map((column) => column.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex-1 flex gap-4 px-6 pb-6 overflow-x-auto">
            {columns.map((column) => {
              const columnTickets = getTicketsForColumn(column.id);
              return (
                <SortableContext
                  key={column.id}
                  items={columnTickets.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <KanbanColumn
                    column={column}
                    tickets={columnTickets}
                    moveTargets={moveTargets}
                    onTitleUpdate={handleColumnTitleUpdate}
                    onDelete={handleColumnDelete}
                    deleting={deletingColumn}
                    onTicketMove={handleTicketMove}
                    onTicketDelete={handleTicketDelete}
                    deletingTicket={deletingTicket}
                    onStartFocus={handleStartFocus}
                    focusActive={focusActive}
                  />
                </SortableContext>
              );
            })}
          </div>
        </SortableContext>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 max-w-sm text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-700">
              <Columns3
                className="size-6 text-neutral-500 dark:text-neutral-400"
                aria-hidden
              />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                No columns yet
              </h2>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Add your first to start organizing tickets on the board.
              </p>
            </div>
            {showCreateColumnInput ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  placeholder="Column title"
                  className="h-9 w-48 px-3 text-sm text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleCreateSubmit();
                    } else if (e.key === "Escape") {
                      setShowCreateColumnInput(false);
                      setNewColumnTitle("");
                    }
                  }}
                  ref={createColumnInputRef}
                />
                <button
                  type="button"
                  onClick={handleCreateSubmit}
                  disabled={creatingColumn}
                  className="h-9 px-4 text-sm font-medium rounded-md border border-neutral-700 dark:border-neutral-300 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateColumnInput(false);
                    setNewColumnTitle("");
                  }}
                  className="h-9 px-3 text-sm font-medium rounded-md border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowCreateColumnInput(true)}
                className="inline-flex items-center gap-2 h-9 px-4 text-sm font-medium rounded-md border border-neutral-700 dark:border-neutral-300 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                <Plus className="size-4" aria-hidden />
                Add column
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
