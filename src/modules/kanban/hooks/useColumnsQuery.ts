import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/hooks/queryKeys';
import {
  createColumnWithNextOrder,
  deleteColumnAndMoveTickets,
  getAllColumns,
  reorderColumns,
  updateColumn,
} from '@/modules/kanban/services/column.service';
import type { Column } from '@/modules/kanban/types';

export function useColumnsQuery() {
  return useQuery({
    queryKey: queryKeys.columns,
    queryFn: getAllColumns,
  });
}

export function useUpdateColumnMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ columnId, updates }: { columnId: string; updates: Partial<Omit<Column, 'id' | 'createdAt'>> }) =>
      updateColumn(columnId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.columns });
    },
  });
}

export function useReorderColumnsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (columnIds: string[]) => reorderColumns(columnIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.columns });
    },
  });
}

export function useCreateColumnMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (title: string) => createColumnWithNextOrder(title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.columns });
    },
  });
}

export function useDeleteColumnMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      columnId,
      destinationColumnId,
    }: {
      columnId: string;
      destinationColumnId: string;
    }) => deleteColumnAndMoveTickets(columnId, destinationColumnId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.columns });
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.inbox });
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.jira });
    },
  });
}
