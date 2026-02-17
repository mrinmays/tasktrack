import { createContext } from 'react';
import type { Ticket } from '@/db/database';

export interface TicketDetailContextValue {
  readonly selectedTicket: Ticket | null;
  readonly openTicketDetail: (ticket: Ticket) => void;
  readonly closeTicketDetail: () => void;
}

export const TicketDetailContext = createContext<TicketDetailContextValue | null>(null);
