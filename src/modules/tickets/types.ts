import type { JiraComment, Ticket } from '@/db/database';
import type { TicketPriority } from '@/utils/ticketPriority';

export type TicketType = 'jira' | 'local';

export type { TicketPriority };

export interface JiraTicket extends Ticket {
  type: 'jira';
  jiraData: {
    jiraId: string;
    jiraUrl: string;
    jiraKey: string;
    status?: string;
    assignee?: string;
    priority?: string;
    comments?: JiraComment[];
  };
}

export interface LocalTicket extends Ticket {
  type: 'local';
  jiraData?: never;
  customKey?: string;
}

export type { Ticket };
