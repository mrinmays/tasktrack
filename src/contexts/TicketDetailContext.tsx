import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Ticket } from '@/db/database';
import { TicketDetailContext } from '@/contexts/ticket-detail-context';
import { subscribeToTicketsRemoved } from '@/utils/ticketsRemoved';

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

  useEffect(() => {
    return subscribeToTicketsRemoved((ticketIds) => {
      if (selectedTicket && ticketIds.includes(selectedTicket.id)) {
        closeTicketDetail();
      }
    });
  }, [selectedTicket, closeTicketDetail]);

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
