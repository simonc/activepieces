import { createAction, Property } from '@activepieces/pieces-framework';
import { imapAuth, mailboxDropdown, getMailboxStats as getImapMailboxStats } from '../common';

const props = {
  mailbox: mailboxDropdown({
    displayName: 'Mailbox',
    description: 'Select the mailbox to analyze.',
    required: true,
  }),
  includeSizeInfo: Property.Checkbox({
    displayName: 'Include Size Information',
    description: 'Calculate total size (may be slow for large mailboxes).',
    defaultValue: false,
    required: false,
  })
};

export const getMailboxStats = createAction({
  auth: imapAuth,
  name: 'get_mailbox_stats',
  displayName: 'Get Mailbox Statistics',
  description: 'Retrieve detailed statistics about a mailbox',
  props,
  async run({ auth, propsValue }) {
    const { mailbox, includeSizeInfo } = propsValue;

    return await getImapMailboxStats({
      auth,
      mailbox: mailbox!,
      includeSizeInfo: !!includeSizeInfo,
    });
  },
});
