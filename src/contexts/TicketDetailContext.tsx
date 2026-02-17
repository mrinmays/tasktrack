import { useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Ticket } from '@/db/database';
import { TicketDetailContext } from '@/contexts/ticket-detail-context';

interface TicketDetailProviderProps {
  readonly children: ReactNode;
}

export function TicketDetailProvider({ children }: TicketDetailProviderProps) {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const openTicketDetail = useCallback((ticket: Ticket) => {
    setSelectedTicket(ticket);
  }, []);

  const closeTicketDetail = useCallback(() => {
    setSelectedTicket(null);
  }, []);

  const value = useMemo(
    () => ({ selectedTicket, openTicketDetail, closeTicketDetail }),
    [selectedTicket, openTicketDetail, closeTicketDetail]
  );

  return (
    <TicketDetailContext.Provider value={value}>
      {children}
    </TicketDetailContext.Provider>
  );
}
