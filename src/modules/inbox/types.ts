export const INBOX_COLUMN_ID = 'inbox';

export const INBOX_SORT_MODES = [
	'custom',
	'priorityAscending',
	'priorityDescending',
	'createdNewest',
	'createdOldest',
	'updatedNewest',
	'updatedOldest',
] as const;

export type InboxSortMode = (typeof INBOX_SORT_MODES)[number];

export const DEFAULT_INBOX_SORT_MODE: InboxSortMode = 'priorityAscending';

export function normalizeInboxSortMode(value: unknown): InboxSortMode {
	if (value === 'priority') {
		return 'priorityAscending';
	}
	return INBOX_SORT_MODES.includes(value as InboxSortMode)
		? (value as InboxSortMode)
		: DEFAULT_INBOX_SORT_MODE;
}
