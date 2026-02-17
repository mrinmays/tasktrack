import Dexie, { type Table } from 'dexie';

export interface Ticket {
  id: string;
  title: string;
  description?: string;
  type: 'jira' | 'local';
  columnId: string;
  order: number;
  jiraData?: {
    jiraId: string;
    jiraUrl: string;
    jiraKey: string;
    status?: string;
    assignee?: string;
    priority?: string;
  };
  customKey?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Column {
  id: string;
  title: string;
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface Setting {
  key: string;
  value: string;
}

export class TaskTrackDatabase extends Dexie {
  tickets!: Table<Ticket>;
  columns!: Table<Column>;
  settings!: Table<Setting>;

  constructor() {
    super('TaskTrackDB');
    this.version(1).stores({
      tickets: 'id, columnId, type, createdAt',
      columns: 'id, order',
      settings: 'key',
    });
    this.version(2)
      .stores({
        tickets: 'id, columnId, type, createdAt, order, [columnId+order]',
        columns: 'id, order',
        settings: 'key',
      })
      .upgrade(async (transaction) => {
        type LegacyTicket = Omit<Ticket, 'order'> & { order?: number };
        const ticketsTable = transaction.table<LegacyTicket, string>('tickets');
        const tickets = await ticketsTable.toArray();

        const groupedByColumn = new Map<string, LegacyTicket[]>();
        for (const ticket of tickets) {
          const columnTickets = groupedByColumn.get(ticket.columnId) ?? [];
          columnTickets.push(ticket);
          groupedByColumn.set(ticket.columnId, columnTickets);
        }

        const migratedTickets: Ticket[] = [];
        for (const columnTickets of groupedByColumn.values()) {
          const sortedTickets = [...columnTickets].sort((a, b) => {
            if (a.createdAt !== b.createdAt) {
              return a.createdAt - b.createdAt;
            }
            return a.id.localeCompare(b.id);
          });

          for (const [index, ticket] of sortedTickets.entries()) {
            migratedTickets.push({
              ...ticket,
              order: index,
            });
          }
        }

        if (migratedTickets.length > 0) {
          await ticketsTable.bulkPut(migratedTickets);
        }
      });
    this.version(3).stores({
      tickets: 'id, columnId, type, createdAt, order, [columnId+order]',
      columns: 'id, order',
      settings: 'key',
    });
    this.version(4).upgrade(async (transaction) => {
      const ticketsTable = transaction.table<Ticket, string>('tickets');
      await ticketsTable.where('type').equals('custom').modify({ type: 'local' });
    });
  }
}

export const db = new TaskTrackDatabase();
