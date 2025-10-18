import {
	createTrigger,
	Property,
	TriggerStrategy,
} from '@activepieces/pieces-framework';
import { MarkdownVariant } from '@activepieces/shared';
import {
	pdfmonkeyAuth,
	makeClient,
	workspaceIdDropdown,
	templateIdDropdown,
	type DocumentCard,
	parseDocumentFields,
	WEBHOOK_EVENTS,
} from '../common';

const WEBHOOK_TRIGGER_KEY = 'pdfmonkey_webhook_failed_id';

const props = {
  workspaceId: workspaceIdDropdown({
    displayName: 'triggers.documentFailed.workspaceId.displayName',
    description: 'triggers.documentFailed.workspaceId.description',
    required: true,
  }),

  templateIds: templateIdDropdown({
    displayName: 'triggers.documentFailed.templateIds.displayName',
    description: 'triggers.documentFailed.templateIds.description',
    required: false,
    multiple: true,
  }),

  debugInstructions: Property.MarkDown({
    value: 'triggers.documentFailed.debugInstructions',
    variant: MarkdownVariant.TIP,
  }),
};

export const documentFailedTrigger = createTrigger({
  auth: pdfmonkeyAuth,
  name: 'documentFailed',
  displayName: 'triggers.documentFailed.displayName',
  description: 'triggers.documentFailed.description',
  props,
  type: TriggerStrategy.WEBHOOK,

  async onEnable(context) {
    const { auth, propsValue, webhookUrl, store } = context;
    const { workspaceId, templateIds } = propsValue;

    const client = makeClient(auth);
    const restHook = await client.registerWebhook(
      WEBHOOK_EVENTS.GENERATION_FAILED,
      webhookUrl,
      workspaceId,
      templateIds,
    );

    await store.put<string>(WEBHOOK_TRIGGER_KEY, restHook.id);
  },

  async onDisable(context) {
    const { auth, store } = context;
    const webhookId = await store.get<string>(WEBHOOK_TRIGGER_KEY);

    if (webhookId) {
      try {
        const client = makeClient(auth);
        await client.unregisterWebhook(webhookId);
      } catch (error) {
        console.warn(`Warning: Failed to delete webhook ${webhookId}:`, error);
      } finally {
        await store.delete(WEBHOOK_TRIGGER_KEY);
      }
    }
  },

  async run(context) {
    const body = context.payload.body as { document: DocumentCard };
    const documentCard = parseDocumentFields(body.document);

    return [documentCard];
  },

  sampleData: {
    app_id: 'c2b67b84-4aac-49ea-bed8-69a15d7a65d3',
    created_at: '2022-04-07T11:01:38.201+02:00',
    document_template_id: '96611e9e-ab03-4ac3-8551-1b485210c892',
    document_template_identifier: 'My Awesome Template',
    download_url: null,
    failure_cause: 'Timeout loading https://example.com/failing-image.png.',
    filename: null,
    id: '11475e57-0334-4ad5-8896-9462a2243957',
    meta: '{ "_filename": "my-test-document.pdf" }',
    output_type: 'pdf',
    parsed_meta: { _filename: 'my-test-document.pdf' },
    public_share_link: null,
    status: 'failure',
    updated_at: '2025-10-03T11:12:56.023+02:00',
  },
});
