import { DOCUMENT_STATUS, WEBHOOK_EVENTS } from './constants';

export interface CurrentUser {
  id: string;
  email: string;
  desired_name: string;
}

export interface CurrentUserResponse {
  current_user: CurrentUser;
}

export interface Document {
  id: string;
  app_id: string;
  checksum: string;
  created_at: string;
  document_template_id: string;
  download_url: string | null;
  filename: string | null;
  meta: string | null;
  payload: string | null;
  preview_url: string;
  public_share_link: string | null;
  status: (typeof DOCUMENT_STATUS)[keyof typeof DOCUMENT_STATUS];
  updated_at: string;
  parsed_meta?: Record<string, unknown> | null;
  parsed_payload?: Record<string, unknown> | null;
}

export interface DocumentCard {
  id: string;
  app_id: string;
  created_at: string;
  document_template_id: string;
  document_template_identifier: string;
  download_url: string | null;
  failure_cause: string | null;
  filename: string | null;
  meta: string | null;
  output_type: string;
  public_share_link: string | null;
  status: (typeof DOCUMENT_STATUS)[keyof typeof DOCUMENT_STATUS];
  updated_at: string;
  parsed_meta?: Record<string, unknown> | null;
}

export interface DocumentCardsResponse {
  document_cards: DocumentCard[];
}

export interface DocumentTemplateCard {
  id: string;
  identifier: string;
}

export interface DocumentTemplateCardsResponse {
  document_template_cards: DocumentTemplateCard[];
}

export interface RestHook {
  id: string;
  workspace_id: string;
  event: string;
  url: string;
  document_template_ids?: string[];
  platform: string;
}

export interface RestHookResponse {
  rest_hook: RestHook;
}

export type WebhookEvent = (typeof WEBHOOK_EVENTS)[keyof typeof WEBHOOK_EVENTS];

export interface WorkspaceCard {
  id: string;
  identifier: string;
}

export interface WorkspaceCardsResponse {
  workspace_cards: WorkspaceCard[];
}
