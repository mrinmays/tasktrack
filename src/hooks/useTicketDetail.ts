import { useContext } from 'react';
import { TicketDetailContext } from '@/contexts/ticket-detail-context';

export function useTicketDetail() {
  const ctx = useContext(TicketDetailContext);
  if (!ctx) {
    throw new Error('useTicketDetail must be used within a TicketDetailProvider');
  }
  return ctx;
}
