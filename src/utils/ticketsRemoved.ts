const TICKETS_REMOVED_EVENT = 'tickets-removed';

export function dispatchTicketsRemoved(ticketIds: string[]): void {
  if (ticketIds.length === 0) return;
  globalThis.dispatchEvent(
    new CustomEvent<{ ticketIds: string[] }>(TICKETS_REMOVED_EVENT, {
      detail: { ticketIds },
    }),
  );
}

export function subscribeToTicketsRemoved(
  handler: (ticketIds: string[]) => void,
): () => void {
  const listener = (e: Event) => {
    const ev = e as CustomEvent<{ ticketIds: string[] }>;
    handler(ev.detail?.ticketIds ?? []);
  };
  globalThis.addEventListener(TICKETS_REMOVED_EVENT, listener);
  return () => globalThis.removeEventListener(TICKETS_REMOVED_EVENT, listener);
}
