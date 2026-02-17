export const INBOX_COLUMN_ID = 'inbox';

export const INBOX_SORT_MODES = [
	'priority',
	'createdNewest',
	'createdOldest',
	'updatedNewest',
	'updatedOldest',
] as const;

export type InboxSortMode = (typeof INBOX_SORT_MODES)[number];

export const DEFAULT_INBOX_SORT_MODE: InboxSortMode = 'priority';

export function normalizeInboxSortMode(value: unknown): InboxSortMode {
	return INBOX_SORT_MODES.includes(value as InboxSortMode)
		? (value as InboxSortMode)
		: DEFAULT_INBOX_SORT_MODE;
}
