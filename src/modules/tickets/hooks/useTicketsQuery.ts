import type { Ticket } from '@/db/database';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/hooks/queryKeys';
import { dispatchTicketsRemoved } from '@/utils/ticketsRemoved';
import {
  createTicket,
  deleteTicket,
  getAllTickets,
  getJiraTickets,
  getTicketsByColumn,
  moveTicket,
  reorderTicketInColumn,
  updateTicket,
} from '@/modules/tickets/services/ticket.service';

export function useAllTicketsQuery() {
  return useQuery({
    queryKey: queryKeys.tickets.all,
    queryFn: getAllTickets,
  });
}

export function useTicketsByColumnQuery(columnId: string) {
  return useQuery({
    queryKey: queryKeys.tickets.column(columnId),
    queryFn: () => getTicketsByColumn(columnId),
    enabled: !!columnId,
  });
}

export function useJiraTicketsQuery() {
  return useQuery({
    queryKey: queryKeys.tickets.jira,
    queryFn: getJiraTickets,
  });
}

type CreateTicketInput = Parameters<typeof createTicket>[0];

export function useCreateTicketMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTicketInput) => createTicket(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.column(variables.columnId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.jira });
    },
  });
}

export function useUpdateTicketMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Omit<Ticket, 'id' | 'createdAt'>>;
    }) => updateTicket(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.jira });
    },
  });
}

export function useMoveTicketMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      ticketId,
      newColumnId,
      targetTicketId,
    }: {
      ticketId: string;
      newColumnId: string;
      targetTicketId?: string;
    }) => moveTicket(ticketId, newColumnId, targetTicketId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.jira });
    },
  });
}

export function useReorderTicketInColumnMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      ticketId,
      overTicketId,
      columnId,
    }: {
      ticketId: string;
      overTicketId: string;
      columnId: string;
    }) => reorderTicketInColumn(ticketId, overTicketId, columnId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.jira });
    },
  });
}

export function useDeleteTicketMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ticketId: string) => deleteTicket(ticketId),
    onSuccess: (_, ticketId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.jira });
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.inbox });
      dispatchTicketsRemoved([ticketId]);
    },
  });
}
