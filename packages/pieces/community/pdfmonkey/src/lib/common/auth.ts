import { PieceAuth } from '@activepieces/pieces-framework';
import { makeClient } from './client';

export const pdfmonkeyAuth = PieceAuth.SecretText({
  displayName: 'auth.displayName',
  description: 'auth.description',
  required: true,
  validate: async ({ auth }: { auth: string }) => {
    try {
			const client = makeClient(auth);
      const user = await client.getCurrentUser();
      const label = user.desired_name
        ? `${user.desired_name} (${user.email})`
        : user.email;

      return { valid: true, label };
    } catch {
      return { valid: false, error: 'Invalid API Key.' };
    }
  },
});
