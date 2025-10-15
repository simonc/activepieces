import { createAction, Property } from '@activepieces/pieces-framework';
import { imapAuth, deleteMailbox, mailboxDropdown } from '../common';

const warningNotice = `
**WARNING: Folder Deletion**

This action permanently deletes folders from your IMAP server. This action cannot be undone.
`;

const props = {
  mailbox: mailboxDropdown({
    displayName: 'Folder to Delete',
    description: 'Select the folder to permanently delete.',
    required: true,
  }),
  warningNotice: Property.MarkDown({
    value: warningNotice,
  }),
};

export const deleteFolder = createAction({
  auth: imapAuth,
  name: 'delete_folder',
  displayName: 'Delete Folder',
  description: 'Permanently delete a folder (mailbox) and all its contents from the IMAP server',
  props,
  async run({ auth, propsValue }) {
    const { mailbox } = propsValue;
    return await deleteMailbox({ auth, mailbox: mailbox! });
  },
});
