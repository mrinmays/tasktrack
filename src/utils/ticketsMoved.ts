const TICKET_MOVED_EVENT = 'ticket-moved';

export interface TicketMovedDetail {
  ticketId: string;
  newColumnId: string;
}

export function dispatchTicketMoved(detail: TicketMovedDetail): void {
  globalThis.dispatchEvent(
    new CustomEvent<TicketMovedDetail>(TICKET_MOVED_EVENT, {
      detail,
    }),
  );
}

export function subscribeToTicketMoved(
  handler: (detail: TicketMovedDetail) => void,
): () => void {
  const listener = (e: Event) => {
    const ev = e as CustomEvent<TicketMovedDetail>;
    if (ev.detail) {
      handler(ev.detail);
    }
  };
  globalThis.addEventListener(TICKET_MOVED_EVENT, listener);
  return () => globalThis.removeEventListener(TICKET_MOVED_EVENT, listener);
}
