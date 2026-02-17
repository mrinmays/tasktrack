import { Formik, Form, Field, ErrorMessage, useFormikContext } from 'formik';
import * as Select from '@radix-ui/react-select';
import * as Yup from 'yup';
import { Check, ChevronDown, X, ExternalLink } from 'lucide-react';
import { useMemo } from 'react';
import { useTicketDetail } from '@/hooks/useTicketDetail';
import { updateTicket } from '@/modules/tickets';
import { isValidTicketKey } from '@/modules/tickets/utils/validateTicketKey';
import { useJiraTicketsQuery } from '@/modules/tickets/hooks/useTicketsQuery';
import { TicketDescriptionEditor } from '@/components/TicketDescriptionEditor';
import { isEmptyEditorHtml } from '@/utils/editorHtml';
import { SanitizedHtml } from './SanitizedHtml';

const ticketValidationSchema = Yup.object({
  title: Yup.string().trim().required('Title is required'),
  description: Yup.string().trim().optional(),
  customKey: Yup.string()
    .trim()
    .optional()
    .test('jira-format', 'Must be in format PROJ-123', (value) => {
      if (!value) return true;
      return isValidTicketKey(value);
    }),
});

const SIDEBAR_WIDTH = 420;

function TicketDescriptionField({ id }: { readonly id?: string }) {
  const { setFieldValue, values } = useFormikContext<{ description: string }>();
  return (
    <TicketDescriptionEditor
      id={id}
      value={values.description ?? ''}
      onChange={(html) => setFieldValue('description', html)}
      placeholder="Description (optional)"
      minHeight="5rem"
    />
  );
}

const SELECT_NONE = '__none__';
const SELECT_OTHER = '__other__';

function TicketKeyField({ jiraKeyOptions }: { readonly jiraKeyOptions: readonly string[] }) {
  const { setFieldValue, setFieldTouched, values, errors, touched } =
    useFormikContext<{ customKey: string }>();

  const currentValue = values.customKey ?? '';
  const isKnownJiraKey = currentValue !== '' && jiraKeyOptions.includes(currentValue);
  const isOtherMode = currentValue !== '' && !isKnownJiraKey;

  let selectValue = SELECT_NONE;
  if (currentValue !== '') {
    selectValue = isKnownJiraKey ? currentValue : SELECT_OTHER;
  }

  const handleSelectChange = (val: string) => {
    if (val === SELECT_NONE) {
      setFieldValue('customKey', '');
    } else if (val === SELECT_OTHER) {
      setFieldValue('customKey', currentValue && !isKnownJiraKey ? currentValue : '');
    } else {
      setFieldValue('customKey', val);
    }
  };

  const showError = touched.customKey && errors.customKey;

  return (
    <div className="space-y-1.5">
      <span className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
        Ticket ID
      </span>
      <Select.Root value={selectValue} onValueChange={handleSelectChange}>
        <Select.Trigger
          className="inline-flex w-full items-center justify-between px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md text-sm bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-500 focus:border-neutral-400 dark:focus:border-neutral-500 outline-none"
          aria-label="Ticket ID"
        >
          <Select.Value placeholder="No ticket ID" />
          <Select.Icon>
            <ChevronDown className="size-3.5 text-neutral-500 dark:text-neutral-400" aria-hidden />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content
            className="z-[60] overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-lg"
            position="popper"
            sideOffset={4}
            align="start"
          >
            <Select.Viewport className="p-1">
              <Select.Item
                value={SELECT_NONE}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-700 dark:text-neutral-300 rounded cursor-pointer outline-none data-[highlighted]:bg-neutral-100 dark:data-[highlighted]:bg-neutral-700"
              >
                <Select.ItemText>No ticket ID</Select.ItemText>
                <Select.ItemIndicator className="ml-auto">
                  <Check className="size-3.5" aria-hidden />
                </Select.ItemIndicator>
              </Select.Item>
              {jiraKeyOptions.length > 0 && (
                <Select.Group>
                  <Select.Label className="px-3 py-1 text-[10px] font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                    Synced JIRA tickets
                  </Select.Label>
                  {jiraKeyOptions.map((key) => (
                    <Select.Item
                      key={key}
                      value={key}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-700 dark:text-neutral-300 rounded cursor-pointer outline-none data-[highlighted]:bg-neutral-100 dark:data-[highlighted]:bg-neutral-700"
                    >
                      <Select.ItemText>
                        <span className="inline-flex items-center gap-1.5">
                          <span className="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded">{key}</span>
                        </span>
                      </Select.ItemText>
                      <Select.ItemIndicator className="ml-auto">
                        <Check className="size-3.5" aria-hidden />
                      </Select.ItemIndicator>
                    </Select.Item>
                  ))}
                </Select.Group>
              )}
              <Select.Separator className="h-px my-1 bg-neutral-200 dark:bg-neutral-700" />
              <Select.Item
                value={SELECT_OTHER}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-700 dark:text-neutral-300 rounded cursor-pointer outline-none data-[highlighted]:bg-neutral-100 dark:data-[highlighted]:bg-neutral-700"
              >
                <Select.ItemText>Other (enter manually)</Select.ItemText>
                <Select.ItemIndicator className="ml-auto">
                  <Check className="size-3.5" aria-hidden />
                </Select.ItemIndicator>
              </Select.Item>
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
      {(isOtherMode || selectValue === SELECT_OTHER) && (
        <div>
          <input
            type="text"
            value={currentValue}
            onChange={(e) => setFieldValue('customKey', e.target.value)}
            onBlur={() => setFieldTouched('customKey', true)}
            placeholder="e.g. PROJ-123"
            className={`w-full px-3 py-2 border rounded-md text-sm bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-500 focus:border-neutral-400 dark:focus:border-neutral-500 ${
              showError
                ? 'border-red-400 dark:border-red-500'
                : 'border-neutral-300 dark:border-neutral-600'
            }`}
          />
          {showError && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.customKey}</p>
          )}
        </div>
      )}
      {isKnownJiraKey && (
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">Currently selected:</span>
          <span className="inline-block text-xs px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded">
            {currentValue}
          </span>
        </div>
      )}
    </div>
  );
}

export function TicketDetailSidebar({ onSaved }: { readonly onSaved?: () => void }) {
  const { selectedTicket, closeTicketDetail } = useTicketDetail();
  const jiraTicketsQuery = useJiraTicketsQuery();
  const jiraKeyOptions = useMemo(
    () => (jiraTicketsQuery.data ?? []).map((t) => t.jiraData?.jiraKey).filter(Boolean) as string[],
    [jiraTicketsQuery.data],
  );

  const isOpen = selectedTicket !== null;
  const isJira = selectedTicket?.type === 'jira';
  const isEditable = !isJira;

  const handleSave = async (values: { title: string; description: string; customKey: string }) => {
    if (!selectedTicket || !isEditable) return;
    const title = values.title.trim();
    const rawDesc = values.description?.trim() ?? '';
    const description = rawDesc && !isEmptyEditorHtml(rawDesc) ? rawDesc : undefined;
    const customKey = values.customKey?.trim().toUpperCase() || undefined;
    const hasChanges =
      title !== selectedTicket.title ||
      description !== (selectedTicket.description ?? '') ||
      customKey !== (selectedTicket.customKey ?? undefined);
    if (hasChanges) {
      await updateTicket(selectedTicket.id, { title, description, customKey: customKey ?? '' });
      onSaved?.();
    }
    closeTicketDetail();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 transition-opacity"
          onClick={closeTicketDetail}
          aria-hidden
        />
      )}
      <aside
        className="fixed right-0 top-0 h-full bg-white dark:bg-neutral-900 shadow-2xl z-50 flex flex-col border-l border-neutral-200 dark:border-neutral-700 transition-transform duration-300 ease-in-out"
        style={{
          width: SIDEBAR_WIDTH,
          transform: isOpen ? 'translateX(0)' : `translateX(${SIDEBAR_WIDTH}px)`,
        }}
        aria-label="Ticket details"
      >
        {selectedTicket && (
          <Formik
            key={selectedTicket.id}
            initialValues={{
              title: selectedTicket.title,
              description: selectedTicket.description ?? '',
              customKey: selectedTicket.customKey ?? '',
            }}
            validationSchema={ticketValidationSchema}
            onSubmit={handleSave}
            enableReinitialize
          >
            {({ isSubmitting, dirty }) => (
              <Form className="flex flex-col h-full">
                <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 shrink-0">
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 truncate pr-2">
                    {isJira ? 'JIRA Ticket' : 'Ticket Details'}
                  </h2>
                  <button
                    type="button"
                    onClick={closeTicketDetail}
                    className="p-1.5 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
                    aria-label="Close sidebar"
                  >
                    <X className="size-5" aria-hidden />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 min-h-0">
                  {isJira && selectedTicket.jiraData && (
                    <div className="flex items-center gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                      <span className="text-sm px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-md font-medium">
                        {selectedTicket.jiraData.jiraKey}
                      </span>
                      {selectedTicket.jiraData.jiraUrl && (
                        <a
                          href={selectedTicket.jiraData.jiraUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
                        >
                          Open in JIRA
                          <ExternalLink className="size-3" aria-hidden />
                        </a>
                      )}
                    </div>
                  )}
                  {!isJira && selectedTicket.customKey && (
                    <div className="flex items-center gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                      <span className="text-sm px-2.5 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-md font-medium">
                        {selectedTicket.customKey}
                      </span>
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="ticket-title"
                      className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"
                    >
                      Title
                    </label>
                    {isEditable ? (
                      <>
                        <Field
                          as="textarea"
                          id="ticket-title"
                          name="title"
                          className="w-full rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 px-3 py-2 text-sm focus:border-neutral-400 dark:focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-500 resize-none"
                        />
                        <ErrorMessage
                          name="title"
                          component="p"
                          className="text-xs text-red-600 dark:text-red-400 mt-1"
                        />
                      </>
                    ) : (
                      <p className="text-sm text-neutral-900 dark:text-neutral-500 bg-neutral-50 dark:bg-neutral-900 rounded-md px-3 py-2 border border-neutral-200 dark:border-neutral-700">
                        {selectedTicket.title}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="ticket-description"
                      className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"
                    >
                      Description
                    </label>
                    {isEditable ? (
                      <TicketDescriptionField id="ticket-description" />
                    ) : (
                      <div className="text-sm bg-neutral-50 dark:bg-neutral-900 rounded-md px-3 py-2 border border-neutral-200 dark:border-neutral-700 min-h-[5rem] overflow-hidden">
                        {selectedTicket.description ? (
                          <SanitizedHtml
                            html={selectedTicket.description}
                            className="ticket-description-content"
                          />
                        ) : (
                          <p className="text-neutral-500 dark:text-neutral-400">No description</p>
                        )}
                      </div>
                    )}
                  </div>

                  {isEditable && (
                    <TicketKeyField jiraKeyOptions={jiraKeyOptions} />
                  )}

                  <div>
                    <span className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Type</span>
                    <p className="text-sm text-neutral-900 dark:text-neutral-500 bg-neutral-50 dark:bg-neutral-900 rounded-md px-3 py-2 border border-neutral-200 dark:border-neutral-700 capitalize">
                      {selectedTicket.type}
                    </p>
                  </div>

                  {isJira && selectedTicket.jiraData && (
                    <>
                      {selectedTicket.jiraData.status && (
                        <div>
                          <span className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                            Status
                          </span>
                          <p className="text-sm text-neutral-900 dark:text-neutral-500 bg-neutral-50 dark:bg-neutral-900 rounded-md px-3 py-2 border border-neutral-200 dark:border-neutral-700">
                            {selectedTicket.jiraData.status}
                          </p>
                        </div>
                      )}
                      {selectedTicket.jiraData.assignee && (
                        <div>
                          <span className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                            Assignee
                          </span>
                          <p className="text-sm text-neutral-900 dark:text-neutral-500 bg-neutral-50 dark:bg-neutral-900 rounded-md px-3 py-2 border border-neutral-200 dark:border-neutral-700">
                            {selectedTicket.jiraData.assignee}
                          </p>
                        </div>
                      )}
                      {selectedTicket.jiraData.priority && (
                        <div>
                          <span className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                            Priority
                          </span>
                          <p className="text-sm text-neutral-900 dark:text-neutral-500 bg-neutral-50 dark:bg-neutral-900 rounded-md px-3 py-2 border border-neutral-200 dark:border-neutral-700">
                            {selectedTicket.jiraData.priority}
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                        Created
                      </span>
                      <p className="text-sm text-neutral-900 dark:text-neutral-500 bg-neutral-50 dark:bg-neutral-900 rounded-md px-3 py-2 border border-neutral-200 dark:border-neutral-700">
                        {new Date(selectedTicket.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                        Updated
                      </span>
                      <p className="text-sm text-neutral-900 dark:text-neutral-500 bg-neutral-50 dark:bg-neutral-900 rounded-md px-3 py-2 border border-neutral-200 dark:border-neutral-700">
                        {new Date(selectedTicket.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {isEditable && (
                  <div className="shrink-0 border-t border-neutral-200 dark:border-neutral-700 px-5 py-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={closeTicketDetail}
                      className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !dirty}
                      className="px-4 py-2 text-sm font-medium text-white dark:text-neutral-900 bg-neutral-800 dark:bg-neutral-200 rounded-md hover:bg-neutral-700 dark:hover:bg-neutral-300 disabled:opacity-50 transition-colors"
                    >
                      {isSubmitting ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                )}
              </Form>
            )}
          </Formik>
        )}
      </aside>
    </>
  );
}
