import { createAction, Property } from '@activepieces/pieces-framework';
import { pdfmonkeyAuth, makeClient } from '../common';
import { propsValidation } from '@activepieces/pieces-common';
import { z } from 'zod';

const props = {
	documentId: Property.ShortText({
		displayName: 'actions.deleteDocument.documentId.displayName',
		description: 'actions.deleteDocument.documentId.description',
		required: true,
	}),
};

export const deleteDocumentAction = createAction({
	auth: pdfmonkeyAuth,
	name: 'deleteDocument',
	displayName: 'actions.deleteDocument.displayName',
	description: 'actions.deleteDocument.description',
	props,
	run: async ({ auth, propsValue }: { auth: string, propsValue: { documentId: string } }): Promise<{ deletedAt: string }> => {
		await propsValidation.validateZod(propsValue, {
			documentId: z.string().uuid(),
		});

		const client = makeClient(auth);
		await client.deleteDocument(propsValue.documentId);

		return { deletedAt: new Date().toISOString() };
	},
});
