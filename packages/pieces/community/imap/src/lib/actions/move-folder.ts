import { createAction, Property } from '@activepieces/pieces-framework';
import { imapAuth, moveMailbox, mailboxDropdown } from '../common';

const props = {
  mailbox: mailboxDropdown({
    displayName: 'Folder',
    description: 'Select the folder to move.',
    required: true,
  }),
  newParent: mailboxDropdown({
    displayName: 'Parent Folder',
    description: 'Select the new parent folder for this folder. Leave empty to move to root level.',
    required: false,
  }),
  newName: Property.ShortText({
    displayName: 'New Folder Name',
    description: 'New name for the folder. Leave empty to keep current name.',
    required: false,
  }),
};

export const moveFolder = createAction({
  auth: imapAuth,
  name: 'move_folder',
  displayName: 'Move Folder',
  description: 'Move a folder to a different location',
  props,
  async run({ auth, propsValue }) {
    const { mailbox, newParent, newName } = propsValue;
    return await moveMailbox({ auth, mailbox: mailbox!, newParent, newName });
  },
});
