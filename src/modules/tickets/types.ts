import type { Ticket } from '@/db/database';

export type TicketType = 'jira' | 'custom';

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

export interface CustomTicket extends Ticket {
  type: 'custom';
  jiraData?: never;
  customKey?: string;
}

export type { Ticket };
