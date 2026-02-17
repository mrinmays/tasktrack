const JIRA_KEY_PATTERN = /^[A-Z][A-Z0-9_]+-\d+$/;

export function isValidTicketKey(key: string): boolean {
  return JIRA_KEY_PATTERN.test(key);
}
