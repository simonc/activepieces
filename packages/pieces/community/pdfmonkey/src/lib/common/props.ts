import { Property } from '@activepieces/pieces-framework';
import { makeClient } from './client';
import { WorkspaceCard, DocumentTemplateCard } from './types';

interface DropdownParams {
  description?: string;
  displayName: string;
  required: boolean;
  multiple?: boolean;
}

const _failure = (placeholder: string) => ({
  disabled: true,
  options: [],
  placeholder,
});

export const workspaceIdDropdown = (params: DropdownParams) =>
  Property.Dropdown<string>({
    displayName: params.displayName,
    description: params.description,
    required: params.required,
    refreshers: ['auth'],
    options: async ({ auth }: { auth: string }) => {
      if (!auth) {
        return _failure('Please connect your account first.');
      }

      try {
				const client = makeClient(auth);
				const workspaces = await client.getWorkspaceCards();
        const options = workspaces.map(({ identifier, id }: WorkspaceCard) => ({
          label: identifier,
          value: id,
        }));

        return { disabled: false, options };
      } catch (error) {
        return _failure('Error loading workspaces.');
      }
    },
  });

export const templateIdDropdown = (params: DropdownParams) => {
	const dropdownType = params.multiple === true ? Property.MultiSelectDropdown<string> : Property.Dropdown<string>;

	return dropdownType({
    displayName: params.displayName,
    description: params.description,
    required: params.required,
    refreshers: ['workspaceId'],
    options: async ({ auth, workspaceId }: { auth: string; workspaceId: string }) => {
      if (!auth) {
        return _failure('Please connect your account first.');
      }

      if (!workspaceId) {
        return _failure('Please select a workspace first.');
      }

      try {
				const client = makeClient(auth);
				const templates = await client.getTemplateCards(workspaceId);
        const options = templates.map(({ identifier, id }: DocumentTemplateCard) => ({
          label: identifier,
          value: id,
        }));

        return { disabled: false, options };
      } catch (error) {
        return _failure('Error loading document templates.');
      }
    },
  });
}
