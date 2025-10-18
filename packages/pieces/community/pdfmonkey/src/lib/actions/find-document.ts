import { createAction, Property } from '@activepieces/pieces-framework';
import { pdfmonkeyAuth, makeClient, type Document } from '../common';
import { propsValidation } from '@activepieces/pieces-common';
import { z } from 'zod';

const props = {
	documentId: Property.ShortText({
		displayName: 'actions.findDocument.documentId.displayName',
		description: 'actions.findDocument.documentId.description',
		required: true,
	}),
};

export const findDocumentAction = createAction({
	auth: pdfmonkeyAuth,
	name: 'findDocument',
	displayName: 'actions.findDocument.displayName',
	description: 'actions.findDocument.description',
	props,
	run: async ({ auth, propsValue }: { auth: string, propsValue: { documentId: string } }): Promise<Document> => {
		await propsValidation.validateZod(propsValue, {
      documentId: z.string().uuid(),
    });

		const client = makeClient(auth);
		return client.getDocument(propsValue.documentId);
	},
});
