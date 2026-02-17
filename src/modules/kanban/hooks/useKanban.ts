import { useQueryClient } from '@tanstack/react-query';
import type { Ticket } from '@/db/database';
import type { Column } from '@/modules/kanban/types';
import { queryKeys } from '@/hooks/queryKeys';
import { INBOX_COLUMN_ID } from '@/modules/inbox/types';
import {
  useColumnsQuery,
  useCreateColumnMutation,
  useDeleteColumnMutation,
  useReorderColumnsMutation,
  useUpdateColumnMutation,
} from '@/modules/kanban/hooks/useColumnsQuery';
import {
  useAllTicketsQuery,
  useDeleteTicketMutation,
  useMoveTicketMutation,
  useUpdateTicketMutation,
} from '@/modules/tickets/hooks/useTicketsQuery';

function sortTicketsByOrder(a: Ticket, b: Ticket): number {
  if (a.order !== b.order) {
    return a.order - b.order;
  }
  if (a.createdAt !== b.createdAt) {
    return a.createdAt - b.createdAt;
  }
  return a.id.localeCompare(b.id);
}

export function useKanban() {
  const queryClient = useQueryClient();
  const columnsQuery = useColumnsQuery();
  const ticketsQuery = useAllTicketsQuery();
  const updateColumnMutation = useUpdateColumnMutation();
  const createColumnMutation = useCreateColumnMutation();
  const deleteColumnMutation = useDeleteColumnMutation();
  const reorderColumnsMutation = useReorderColumnsMutation();
  const moveTicketMutation = useMoveTicketMutation();
  const updateTicketMutation = useUpdateTicketMutation();
  const deleteTicketMutation = useDeleteTicketMutation();

  const columns: Column[] = columnsQuery.data ?? [];
  const tickets: Ticket[] = ticketsQuery.data ?? [];
  const loading = columnsQuery.isLoading || ticketsQuery.isLoading;

  const handleColumnTitleUpdate = (columnId: string, newTitle: string) => {
    updateColumnMutation.mutate({ columnId, updates: { title: newTitle } });
  };

  const handleTicketMove = (ticketId: string, newColumnId: string) => {
    moveTicketMutation.mutate({ ticketId, newColumnId });
  };

  const handleTicketUpdate = (
    ticketId: string,
    updates: { title?: string; description?: string }
  ) => {
    updateTicketMutation.mutate({ id: ticketId, updates });
  };

  const handleTicketDelete = (ticketId: string) => {
    deleteTicketMutation.mutate(ticketId);
  };

  const handleColumnReorder = (newOrder: string[]) => {
    reorderColumnsMutation.mutate(newOrder);
  };

  const handleColumnCreate = (title: string) => {
    const normalizedTitle = title.trim();
    if (!normalizedTitle) {
      return;
    }
    createColumnMutation.mutate(normalizedTitle);
  };

  const handleColumnDelete = (columnId: string) => {
    deleteColumnMutation.mutate({
      columnId,
      destinationColumnId: INBOX_COLUMN_ID,
    });
  };

  const getTicketsForColumn = (columnId: string): Ticket[] => {
    return tickets
      .filter((ticket) => ticket.columnId === columnId)
      .sort(sortTicketsByOrder);
  };

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.columns });
    queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
  };

  return {
    columns,
    tickets,
    loading,
    handleColumnTitleUpdate,
    handleColumnCreate,
    handleColumnDelete,
    handleTicketMove,
    handleTicketDelete,
    handleTicketUpdate,
    handleColumnReorder,
    getTicketsForColumn,
    refresh,
    creatingColumn: createColumnMutation.isPending,
    deletingColumn: deleteColumnMutation.isPending,
    deletingTicket: deleteTicketMutation.isPending,
  };
}
