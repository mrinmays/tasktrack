import { useQuery } from '@tanstack/react-query';
import { getAllColumns } from '@/modules/kanban';
import { getAllTickets, getTicketsByColumn, moveTicket } from '@/modules/tickets';
import { queryKeys } from '@/hooks/queryKeys';
import { INBOX_COLUMN_ID } from '@/modules/inbox/types';

async function loadInboxTickets(): Promise<Awaited<ReturnType<typeof getTicketsByColumn>>> {
  const [columns, allTickets] = await Promise.all([getAllColumns(), getAllTickets()]);
  const validColumnIds = new Set([INBOX_COLUMN_ID, ...columns.map((c) => c.id)]);
  const orphanedTickets = allTickets.filter((t) => !validColumnIds.has(t.columnId));
  for (const ticket of orphanedTickets) {
    await moveTicket(ticket.id, INBOX_COLUMN_ID);
  }
  return getTicketsByColumn(INBOX_COLUMN_ID);
}

export function useInboxTicketsQuery() {
  return useQuery({
    queryKey: queryKeys.tickets.inbox,
    queryFn: loadInboxTickets,
  });
}
