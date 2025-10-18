import { ResumePayload } from '@activepieces/shared';
import {
  ActionContext,
  CleanupContext,
  createAction,
  Property,
  Store,
} from '@activepieces/pieces-framework';
import { propsValidation } from '@activepieces/pieces-common';
import { ExecutionType, PauseType } from '@activepieces/shared';
import { StatusCodes } from 'http-status-codes';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import {
  type Document,
  type DocumentCard,
  DOCUMENT_STATUS,
  makeClient,
  parseDocumentFields,
  PLATFORM_NAME,
  pdfmonkeyAuth,
  templateIdDropdown,
  WEBHOOK_EVENTS,
  workspaceIdDropdown,
} from '../common';

const props = {
  workspaceId: workspaceIdDropdown({
    displayName: 'actions.generateDocument.workspaceId.displayName',
    description: 'actions.generateDocument.workspaceId.description',
    required: true,
  }),
  templateId: templateIdDropdown({
    displayName: 'actions.generateDocument.templateId.displayName',
    description: 'actions.generateDocument.templateId.description',
    required: true,
  }),
  payload: Property.Json({
    displayName: 'actions.generateDocument.payload.displayName',
    description: 'actions.generateDocument.payload.description',
    required: true,
  }),
  lineItems: Property.Array({
    displayName: 'actions.generateDocument.lineItems.displayName',
    description: 'actions.generateDocument.lineItems.description',
    required: false,
    properties: {
      payload: Property.Json({
        displayName: 'actions.generateDocument.lineItems.payload.displayName',
        description: 'actions.generateDocument.lineItems.payload.description',
        required: true,
      }),
    },
  }),
  meta: Property.Json({
    displayName: 'actions.generateDocument.meta.displayName',
    description: 'actions.generateDocument.meta.description',
    required: false,
  }),
  fileName: Property.ShortText({
    displayName: 'actions.generateDocument.fileName.displayName',
    required: false,
  }),
};

const WEBHOOK_STORE_KEY = 'pdfmonkey_temp_webhook_id';

/**
 * Cleanup the webhook registration
 * This function is called both in the resume phase (successful completion)
 * and in the onCleanup hook (timeout or failure)
 */
async function cleanupWebhook(
  auth: any,
  store: Store,
  runId: string,
): Promise<void> {
  const webhookIdKey = `${WEBHOOK_STORE_KEY}_${runId}`;
  const webhookId = await store.get<string>(webhookIdKey);

  if (webhookId) {
    const client = makeClient(auth);
    try {
      await client.unregisterWebhook(webhookId);
    } catch (error) {
      console.warn(`Warning: Failed to delete webhook ${webhookId}:`, error);
    } finally {
      await store.delete(webhookIdKey);
    }
  }
}

/**
 * Begin phase of the action
 * This will register a webhook with a unique channel id, then create a document
 * and wait for the success/failure webhook to arrive.
 */
async function beginPhase(context: ActionContext): Promise<Document> {
  const { auth, generateResumeUrl, propsValue, run, store } = context;

  await propsValidation.validateZod(propsValue, {
    templateId: z.string().uuid(),
    payload: z.record(z.unknown()),
    meta: z.record(z.unknown()).optional(),
    fileName: z.string().optional(),
  });

  const { workspaceId, templateId, payload, lineItems, meta, fileName } =
    propsValue;

  const channelId = uuidv4();
  const resumeUrl = generateResumeUrl({ queryParams: {} });

  // Register webhook with both success and failure events
  const client = makeClient(auth);
  const restHook = await client.registerWebhook(
    `${WEBHOOK_EVENTS.GENERATION_SUCCESS},${WEBHOOK_EVENTS.GENERATION_FAILED}`,
    resumeUrl,
    workspaceId,
    undefined,
    `${PLATFORM_NAME} Resume`,
  );

  // Store webhook ID for cleanup on resume using unique key per flow run
  const webhookIdKey = `${WEBHOOK_STORE_KEY}_${run.id}`;
  await store.put<string>(webhookIdKey, restHook.id);

  // Build meta payload with webhook channel
  const metaPayload = { ...(meta || {}) };
  metaPayload['_webhook_channel'] = channelId;
  if (fileName) {
    metaPayload['_filename'] = fileName;
  }

  // Build document payload, adding line items if provided
  const documentPayload = { ...payload };
  if (lineItems && Array.isArray(lineItems) && lineItems.length > 0) {
    documentPayload['lineItems'] = lineItems;
  }

  // Create document
  const document = await client.createDocument({
    templateId,
    documentPayload,
    metaPayload,
  });

  // Pause execution until success/failure webhook arrives
  run.pause({
    pauseMetadata: {
      type: PauseType.WEBHOOK,
      response: document,
    },
  });

  return document;
}

async function resumePhase(
  context: ActionContext & { resumePayload: ResumePayload },
): Promise<DocumentCard> {
  const { auth, store, resumePayload, run } = context;

  // Clean up webhook registration
  await cleanupWebhook(auth, store, run.id);

  // Parse document card from webhook payload
  const webhookBody = resumePayload.body as {
    document: DocumentCard;
  };
  const documentCard = parseDocumentFields(webhookBody.document);

  // Handle failure status
  if (documentCard.status === DOCUMENT_STATUS.FAILURE) {
    context.run.stop({
      response: {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        body: documentCard,
      },
    });
  }

  // Return successful document
  return documentCard;
}

export const generateDocumentAction = createAction({
  auth: pdfmonkeyAuth,
  name: 'generateDocument',
  displayName: 'actions.generateDocument.displayName',
  description: 'actions.generateDocument.description',
  props,
  run: async (context): Promise<DocumentCard | void> => {
    const { executionType } = context;

    if (executionType === ExecutionType.BEGIN) {
      await beginPhase(context);
    } else if (executionType === ExecutionType.RESUME) {
      await resumePhase(context);
    } else {
      throw new Error('Invalid execution type');
    }
  },
  onCleanup: async (context: CleanupContext): Promise<void> => {
    const { auth, store, run } = context;
    await cleanupWebhook(auth, store, run.id);
  },
});
