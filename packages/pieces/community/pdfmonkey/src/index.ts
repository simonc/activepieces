import { createPiece } from '@activepieces/pieces-framework';
import { PieceCategory } from '@activepieces/shared';
import { createCustomApiCallAction } from '@activepieces/pieces-common';
import { pdfmonkeyAuth, BASE_URL, PLATFORM_NAME } from './lib/common';
import { generateDocumentAction } from './lib/actions/generate-document';
import { deleteDocumentAction } from './lib/actions/delete-document';
import { findDocumentAction } from './lib/actions/find-document';
import { documentGeneratedTrigger } from './lib/triggers/document-generated';
import { documentFailedTrigger } from './lib/triggers/document-failed';

export const pdfmonkey = createPiece({
  displayName: 'PDFMonkey',
  description: 'piece.description',
  auth: pdfmonkeyAuth,
  minimumSupportedRelease: '0.36.1',
  logoUrl: 'https://cdn.activepieces.com/pieces/pdfmonkey.png',
  authors: ['Sanket6652', 'simonc'],
  categories: [PieceCategory.CONTENT_AND_FILES],
  actions: [
    generateDocumentAction,
    deleteDocumentAction,
    findDocumentAction,
    createCustomApiCallAction({
      auth: pdfmonkeyAuth,
      baseUrl: () => BASE_URL,
      authMapping: async (auth) => ({
        Authorization: `Bearer ${auth}`,
        'Content-Type': 'application/json',
        'User-Agent': PLATFORM_NAME,
      }),
    }),
  ],
  triggers: [documentGeneratedTrigger, documentFailedTrigger],
});
