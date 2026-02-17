import type { Ticket } from '@/db/database';
import type { AtlassianConfig } from '@/modules/settings';
import { createTicket, updateTicket, getAllTickets, getJiraTickets, deleteTickets } from '@/modules/tickets';
import {
  getValidAccessToken,
  getAtlassianConfig,
  refreshCloudIdFromToken,
  isJiraCloud,
} from '@/modules/settings';
import { INBOX_COLUMN_ID } from '@/modules/inbox/types';
import { normalizeTicketPriority } from '@/utils/ticketPriority';

const SKIP_RENDERED_FIELDS = new Set([
  'summary', 'description', 'status', 'assignee', 'priority',
  'issuetype', 'reporter', 'creator', 'created', 'updated',
  'resolutiondate', 'resolution', 'project', 'components',
  'labels', 'fixVersions', 'versions', 'duedate', 'votes',
  'watches', 'worklog', 'comment', 'attachment', 'timetracking',
]);

function descriptionToHtml(issue: JiraIssue): string | undefined {
  const rendered = issue.renderedFields;
  if (typeof rendered?.description === 'string' && rendered.description.trim()) {
    return rendered.description.trim();
  }

  if (rendered) {
    for (const [key, value] of Object.entries(rendered)) {
      if (SKIP_RENDERED_FIELDS.has(key)) continue;
      if (typeof value === 'string' && value.trim() && value.includes('<p')) {
        return value.trim();
      }
    }
  }

  const desc = issue.fields.description;
  if (typeof desc === 'string' && desc.trim()) {
    return desc.trim();
  }
  return undefined;
}

async function removeStaleJiraTickets(freshJiraKeys: Set<string>): Promise<void> {
  const existingJiraTickets = await getJiraTickets();
  const staleIds = existingJiraTickets
    .filter((t) => t.jiraData?.jiraKey && !freshJiraKeys.has(t.jiraData.jiraKey))
    .map((t) => t.id);
  if (staleIds.length > 0) {
    await deleteTickets(staleIds);
  }
}

export interface JiraSyncResult {
  created: Ticket[];
  updated: Ticket[];
}

async function issuesToTickets(
  issues: JiraIssue[],
  config: AtlassianConfig
): Promise<JiraSyncResult> {
  const freshJiraKeys = new Set(issues.map((i) => i.key));
  await removeStaleJiraTickets(freshJiraKeys);

  const allTickets = await getAllTickets();
  const existingByJiraKey = new Map<string, Ticket>();
  for (const t of allTickets) {
    if (t.type === 'jira' && t.jiraData?.jiraKey) {
      existingByJiraKey.set(t.jiraData.jiraKey, t);
    }
  }

  const created: Ticket[] = [];
  const updated: Ticket[] = [];

  for (const issue of issues) {
    const description = descriptionToHtml(issue);
    const jiraData = {
      jiraId: issue.id,
      jiraUrl: `${config.instanceUrl}/browse/${issue.key}`,
      jiraKey: issue.key,
      status: issue.fields.status.name,
      assignee: issue.fields.assignee?.displayName,
      priority: issue.fields.priority?.name,
    };
    const priority = normalizeTicketPriority(issue.fields.priority?.name);

    const existing = existingByJiraKey.get(issue.key);
    if (existing) {
      await updateTicket(existing.id, {
        title: issue.fields.summary,
        description,
        priority,
        jiraData: { ...existing.jiraData, ...jiraData },
      });
      updated.push({
        ...existing,
        title: issue.fields.summary,
        description,
        priority,
        jiraData: { ...existing.jiraData, ...jiraData },
      });
    } else {
      const createdTicket = await createTicket({
        title: issue.fields.summary,
        description,
        priority,
        type: 'jira',
        columnId: INBOX_COLUMN_ID,
        jiraData,
      });
      created.push(createdTicket);
    }
  }

  return { created, updated };
}

export interface JiraIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    description?: unknown;
    status: {
      name: string;
    };
    assignee?: {
      displayName: string;
    };
    priority?: {
      name: string;
    };
  };
  renderedFields?: Record<string, unknown>;
  self: string;
}

export interface JiraSearchResponse {
  issues: JiraIssue[];
}

const SEARCH_FIELDS = '*navigable';

function buildSearchUrl(cloudId: string | undefined, instanceUrl: string, jql: string): string {
  const base = cloudId
    ? `https://api.atlassian.com/ex/jira/${cloudId}`
    : instanceUrl;
  return `${base}/rest/api/3/search/jql?jql=${encodeURIComponent(jql)}&fields=${SEARCH_FIELDS}&maxResults=50&expand=renderedFields`;
}

export async function fetchJiraTickets(jql?: string): Promise<JiraSyncResult> {
  let config = await getAtlassianConfig();
  if (!config) {
    throw new Error('Atlassian configuration not found');
  }

  const accessToken = await getValidAccessToken();
  if (!accessToken) {
    throw new Error('No valid access token available');
  }

  if (!config.cloudId && isJiraCloud(config.instanceUrl)) {
    const refreshed = await refreshCloudIdFromToken(config, accessToken);
    if (refreshed) config = refreshed;
  }

  const defaultJql = jql || 'assignee = currentUser() AND status != Done ORDER BY updated DESC';
  const searchUrl = buildSearchUrl(config.cloudId, config.instanceUrl, defaultJql);

  const response = await fetch(searchUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication failed. Please reconnect to JIRA.');
    }
    throw new Error(`Failed to fetch JIRA tickets: ${response.statusText}`);
  }

  const data: JiraSearchResponse = await response.json();
  return issuesToTickets(data.issues, config);
}

