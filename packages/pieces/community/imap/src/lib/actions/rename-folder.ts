import { createAction, Property } from '@activepieces/pieces-framework';
import { imapAuth, renameMailbox, mailboxDropdown } from '../common';

const props = {
  mailbox: mailboxDropdown({
    displayName: 'Folder',
    description: 'Select the folder to rename.',
    required: true,
  }),
  newName: Property.ShortText({
    displayName: 'New Folder Name',
    description: 'New name for the folder.',
    required: true,
  }),
};

export const renameFolder = createAction({
  auth: imapAuth,
  name: 'rename_folder',
  displayName: 'Rename Folder',
  description: 'Change the name of a folder',
  props,
  async run({ auth, propsValue }) {
    const { mailbox, newName } = propsValue;
    return await renameMailbox({ auth, mailbox: mailbox!, newName });
  },
});
