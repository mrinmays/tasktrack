import type { Ticket } from '@/db/database';

export type TicketType = 'jira' | 'local';

export interface JiraTicket extends Ticket {
  type: 'jira';
  jiraData: {
    jiraId: string;
    jiraUrl: string;
    jiraKey: string;
    status?: string;
    assignee?: string;
    priority?: string;
  };
}

export interface LocalTicket extends Ticket {
  type: 'local';
  jiraData?: never;
  customKey?: string;
}

export type { Ticket };
