import {
  HttpMethod,
  QueryParams,
  httpClient,
} from '@activepieces/pieces-common';
import {
  BASE_URL,
  DOCUMENT_STATUS,
  PLATFORM_NAME,
  POLL_INTERVAL_MS,
  TIMEOUT_MS,
} from './constants';
import type {
  CurrentUser,
  CurrentUserResponse,
  Document,
  DocumentTemplateCard,
  DocumentTemplateCardsResponse,
  WorkspaceCard,
  WorkspaceCardsResponse,
  DocumentCard,
  DocumentCardsResponse,
  RestHook,
  RestHookResponse,
  WebhookEvent,
} from './types';

export function makeClient(apiKey: string): PdfmonkeyClient {
  return new PdfmonkeyClient(apiKey);
}

export function parseDocumentFields<T extends DocumentCard | Document>(
  document: T,
): T {
  if (document.meta && document.meta.length > 2) {
    try {
      document.parsed_meta = JSON.parse(document.meta);
    } catch (error) {
      // If parsing fails, leave parsed_meta undefined
    }
  }

  // Only Document has a payload
  if (
    'payload' in document &&
    document.payload &&
    document.payload.length > 2
  ) {
    try {
      document.parsed_payload = JSON.parse(document.payload);
    } catch (error) {
      // If parsing fails, leave parsed_payload undefined
    }
  }

  return document;
}

export class PdfmonkeyClient {
  constructor(private apiKey: string) {}

  async createDocument({
    templateId,
    documentPayload,
    metaPayload,
  } : {
    templateId: string,
    documentPayload: Record<string, unknown>,
    metaPayload: Record<string, unknown>,
  }): Promise<Document> {
    const { document } = await this.#makeRequest<{ document: Document }>({
      method: HttpMethod.POST,
      path: '/documents',
      body: {
        document: {
          document_template_id: templateId,
          payload: documentPayload,
          meta: metaPayload,
          status: DOCUMENT_STATUS.PENDING,
        },
      },
    });

    return parseDocumentFields(document);
  }

  async deleteDocument({ documentId }: { documentId: string }): Promise<void> {
    await this.#makeRequest<void>({
      method: HttpMethod.DELETE,
      path: `/documents/${documentId}`,
    });
  }

  async generateDocument(
    { templateId, documentPayload, metaPayload }: {
      templateId: string,
      documentPayload: Record<string, unknown>,
      metaPayload: Record<string, unknown>,
    }
  ): Promise<Document> {
    return await this.createDocument({ templateId, documentPayload, metaPayload });
  }

  async getCurrentUser(): Promise<CurrentUser> {
    const { current_user } = await this.#makeRequest<CurrentUserResponse>({
      path: '/current_user',
    });

    return current_user;
  }

  async getDocument(documentId: string): Promise<Document> {
    const { document } = await this.#makeRequest<{ document: Document }>({
      path: `/documents/${documentId}`,
    });

    return parseDocumentFields(document);
  }

  async getDocumentCard(documentId: string): Promise<DocumentCard> {
    const { document_card } = await this.#makeRequest<{
      document_card: DocumentCard;
    }>({
      path: `/documents/${documentId}`,
    });

    return parseDocumentFields(document_card);
  }

  async getDocumentCards(
    workspaceId: string,
    templateIds?: string[],
  ): Promise<DocumentCard[]> {
    const query: QueryParams = { 'q[workspaceId]': workspaceId, page: 'all' };

    if (templateIds && templateIds.length > 0) {
      query['q[documentTemplateId]'] = templateIds.join(',');
    }

    const { document_cards } = await this.#makeRequest<DocumentCardsResponse>({
      path: '/document_cards',
      query,
    });

    return document_cards.map(parseDocumentFields);
  }

  async getTemplateCards(workspaceId: string): Promise<DocumentTemplateCard[]> {
    const { document_template_cards } =
      await this.#makeRequest<DocumentTemplateCardsResponse>({
        path: '/document_template_cards',
        query: { 'q[workspaceId]': workspaceId, page: 'all' },
      });

    return document_template_cards;
  }

  async getWorkspaceCards(): Promise<WorkspaceCard[]> {
    const { workspace_cards } = await this.#makeRequest<WorkspaceCardsResponse>(
      { path: '/workspace_cards' },
    );

    return workspace_cards;
  }

  async registerWebhook(
    event: WebhookEvent | string,
    webhookUrl: string,
    workspaceId: string,
    templateIds?: string[],
    platform: string = PLATFORM_NAME,
    custom_channel?: string,
  ): Promise<RestHook> {
    const { rest_hook } = await this.#makeRequest<RestHookResponse>({
      method: HttpMethod.POST,
      path: '/rest_hooks',
      body: {
        rest_hook: {
          workspace_id: workspaceId,
          document_template_ids: templateIds || [],
          event: event,
          platform: platform,
          url: webhookUrl,
          custom_channel: channel,
        },
      },
    });

    return rest_hook;
  }

  async unregisterWebhook(webhookId: string): Promise<void> {
    await this.#makeRequest<void>({
      method: HttpMethod.DELETE,
      path: `/rest_hooks/${webhookId}`,
    });
  }

  async #makeRequest<T>({
    method = HttpMethod.GET,
    path,
    query,
    body,
  }: {
    method?: HttpMethod;
    path: string;
    query?: QueryParams;
    body?: unknown;
  }): Promise<T> {
    try {
      const response = await httpClient.sendRequest<T>({
        method,
        url: `${BASE_URL}${path}`,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': PLATFORM_NAME,
        },
        body,
        queryParams: query,
      });

      return response.body;
    } catch (error) {
      if (error instanceof Error) {
        const errorMessage = error.message || 'Unknown error occurred';
        throw new Error(
          `PDFMonkey API request failed [${method} ${path}]: ${errorMessage}`,
        );
      }
      throw new Error(`PDFMonkey API request failed [${method} ${path}]`);
    }
  }
}
