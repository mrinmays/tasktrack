import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/hooks/queryKeys';
import { dispatchTicketsRemoved } from '@/utils/ticketsRemoved';
import { fetchJiraTickets } from '@/modules/inbox/services/jira.service';

export function useJiraSyncMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jql?: string) => fetchJiraTickets(jql),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.jira });
      if (result.deleted.length > 0) {
        dispatchTicketsRemoved(result.deleted);
      }
    },
  });
}
