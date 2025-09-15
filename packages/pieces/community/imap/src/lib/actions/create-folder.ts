import { createAction, Property } from '@activepieces/pieces-framework';
import { imapAuth, createMailbox, mailboxDropdown } from '../common';

const props = {
  folderName: Property.ShortText({
    displayName: 'Folder Name',
    description: 'Name of the new folder to create.',
    required: true,
  }),
  parentFolder: mailboxDropdown({
    displayName: 'Parent Folder',
    description: 'Parent folder (leave empty for root level).',
    required: false,
  }),
};

export const createFolder = createAction({
  auth: imapAuth,
  name: 'create_folder',
  displayName: 'Create Folder',
  description: 'Create a new folder (mailbox) on the IMAP server',
  props,
  async run({ auth, propsValue }) {
    const { folderName, parentFolder } = propsValue;

    return await createMailbox({
      auth,
      folderName,
      parentFolder: parentFolder || undefined,
    });
  },
});
