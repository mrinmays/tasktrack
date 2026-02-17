import type { Ticket } from '@/db/database';

const ticketRegistry = new Map<string, Ticket>();

export function registerTicket(ticket: Ticket): void {
  ticketRegistry.set(ticket.id, ticket);
}

export function unregisterTicket(ticketId: string): void {
  ticketRegistry.delete(ticketId);
}

export function getTicketById(ticketId: string): Ticket | undefined {
  return ticketRegistry.get(ticketId);
}
