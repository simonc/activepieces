import { createPiece } from '@activepieces/pieces-framework';
import { PieceCategory } from '@activepieces/shared';
import { newEmail } from './lib/triggers/new-email';
import { imapAuth } from './lib/common';
import { markEmailAsRead } from './lib/actions/mark-email-read';
import { copyEmail } from './lib/actions/copy-email';
import { deleteEmail } from './lib/actions/delete-email';
import { moveEmail } from './lib/actions/move-email';
import { createFolder } from './lib/actions/create-folder';
import { deleteFolder } from './lib/actions/delete-folder';
import { renameFolder } from './lib/actions/rename-folder';
import { moveFolder } from './lib/actions/move-folder';
import { getMailboxStats } from './lib/actions/get-mailbox-stats';

export const imapPiece = createPiece({
  displayName: 'IMAP',
  description: 'Receive new email, update emails',
  minimumSupportedRelease: '0.30.0',
  logoUrl: 'https://cdn.activepieces.com/pieces/imap.png',
  categories: [PieceCategory.BUSINESS_INTELLIGENCE],
  authors: ['kishanprmr', 'MoShizzle', 'khaledmashaly', 'abuaboud', 'simonc'],
  auth: imapAuth,
  actions: [
    // Email actions
    markEmailAsRead,
    copyEmail,
    moveEmail,
    deleteEmail,

    // Folder management actions
    createFolder,
    renameFolder,
    moveFolder,
    deleteFolder,
    getMailboxStats,
  ],
  triggers: [newEmail],
});
