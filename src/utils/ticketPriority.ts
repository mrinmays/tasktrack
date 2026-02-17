export const TICKET_PRIORITY_VALUES = ['Highest', 'High', 'Medium', 'Low', 'Lowest'] as const;

export type TicketPriority = (typeof TICKET_PRIORITY_VALUES)[number];

const PRIORITY_RANK: Record<TicketPriority, number> = {
  Highest: 0,
  High: 1,
  Medium: 2,
  Low: 3,
  Lowest: 4,
};

export function normalizeTicketPriority(priority?: string): TicketPriority | undefined {
  if (!priority) {
    return undefined;
  }

  const normalized = priority.trim().toLowerCase();
  if (normalized === 'highest') return 'Highest';
  if (normalized === 'high') return 'High';
  if (normalized === 'medium') return 'Medium';
  if (normalized === 'low') return 'Low';
  if (normalized === 'lowest') return 'Lowest';

  return undefined;
}

export function getTicketPriorityRank(priority?: TicketPriority): number {
  if (!priority) {
    return Number.POSITIVE_INFINITY;
  }
  return PRIORITY_RANK[priority];
}
