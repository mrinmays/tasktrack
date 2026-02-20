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

function sortByPriorityAsc(a: Ticket, b: Ticket): number {
  const rankA = getTicketPriorityRank(a.priority);
  const rankB = getTicketPriorityRank(b.priority);
  const aHasPriority = Number.isFinite(rankA);
  const bHasPriority = Number.isFinite(rankB);

  if (!aHasPriority && !bHasPriority) {
    return sortByManualOrder(a, b);
  }
  if (!aHasPriority) {
    return 1;
  }
  if (!bHasPriority) {
    return -1;
  }

  const priorityRankDiff = rankA - rankB;
  if (priorityRankDiff !== 0) {
    return priorityRankDiff;
  }
  return sortByManualOrder(a, b);
}

function sortByPriorityDesc(a: Ticket, b: Ticket): number {
  const rankA = getTicketPriorityRank(a.priority);
  const rankB = getTicketPriorityRank(b.priority);
  const aHasPriority = Number.isFinite(rankA);
  const bHasPriority = Number.isFinite(rankB);

  if (!aHasPriority && !bHasPriority) {
    return sortByManualOrder(a, b);
  }
  if (!aHasPriority) {
    return 1;
  }
  if (!bHasPriority) {
    return -1;
  }

  const priorityRankDiff = rankB - rankA;
  if (priorityRankDiff !== 0) {
    return priorityRankDiff;
  }
  return sortByManualOrder(a, b);
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

export function sortInboxTickets(tickets: readonly Ticket[], mode: InboxSortMode): Ticket[] {
  const clone = [...tickets];
  if (mode === 'custom') {
    return clone.sort(sortByManualOrder);
  }
  if (mode === 'priorityAscending') {
    return clone.sort(sortByPriorityAsc);
  }
  if (mode === 'priorityDescending') {
    return clone.sort(sortByPriorityDesc);
  }
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
  return clone.sort(sortByManualOrder);
}
