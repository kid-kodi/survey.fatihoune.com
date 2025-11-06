// This file is for the React Email preview server only
// The actual templates are in lib/email-templates/

import { TestEmail } from '../lib/email-templates/TestEmail';

export default function TestEmailPreview() {
  return <TestEmail name="John Doe" locale="en" />;
}
