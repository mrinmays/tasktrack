import type { Ticket } from '@/db/database';
import type { InboxSortMode } from '@/modules/inbox/types';
import { getTicketPriorityRank } from '@/utils/ticketPriority';

function sortByManualOrder(a: Ticket, b: Ticket): number {
  if (a.order !== b.order) {
    return a.order - b.order;
  }
  if (a.createdAt !== b.createdAt) {
    return a.createdAt - b.createdAt;
  }
  return a.id.localeCompare(b.id);
}

function sortByCreatedAtDesc(a: Ticket, b: Ticket): number {
  if (a.createdAt !== b.createdAt) {
    return b.createdAt - a.createdAt;
  }
  return sortByManualOrder(a, b);
}

function sortByCreatedAtAsc(a: Ticket, b: Ticket): number {
  if (a.createdAt !== b.createdAt) {
    return a.createdAt - b.createdAt;
  }
  return sortByManualOrder(a, b);
}

function sortByUpdatedAtDesc(a: Ticket, b: Ticket): number {
  if (a.updatedAt !== b.updatedAt) {
    return b.updatedAt - a.updatedAt;
  }
  return sortByManualOrder(a, b);
}

function sortByUpdatedAtAsc(a: Ticket, b: Ticket): number {
  if (a.updatedAt !== b.updatedAt) {
    return a.updatedAt - b.updatedAt;
  }
  return sortByManualOrder(a, b);
}

function sortByPriorityDesc(a: Ticket, b: Ticket): number {
  const priorityRankDiff = getTicketPriorityRank(a.priority) - getTicketPriorityRank(b.priority);
  if (priorityRankDiff !== 0) {
    return priorityRankDiff;
  }
  return sortByManualOrder(a, b);
}

export function sortInboxTickets(tickets: readonly Ticket[], mode: InboxSortMode): Ticket[] {
  const clone = [...tickets];
  if (mode === 'createdNewest') {
    return clone.sort(sortByCreatedAtDesc);
  }
  if (mode === 'createdOldest') {
    return clone.sort(sortByCreatedAtAsc);
  }
  if (mode === 'updatedNewest') {
    return clone.sort(sortByUpdatedAtDesc);
  }
  if (mode === 'updatedOldest') {
    return clone.sort(sortByUpdatedAtAsc);
  }
  return clone.sort(sortByPriorityDesc);
}
