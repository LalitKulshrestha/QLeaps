# Update the existing Quantum Leaps Google script

The website and Google backend are separate deployments. The website detects version 2 automatically. Until the Google deployment is updated, enquiries and general CV submissions use the existing handler; public job posting stays disabled.

1. Open your existing project: https://script.google.com/u/0/home/projects/17mGXCdz-Qq20nlnz_mTr_sR64giHLP-sAmeBFdk_LCmXPHoweoa9vwAf/edit
2. Save a copy of the current Code.gs for rollback. Replace its complete contents with the supplied `Code.gs`. Do not add it alongside the old `doGet` and `doPost` functions.
3. Save. Choose `setupQuantumLeaps` from the function selector and click Run. Complete Google's permission prompt yourself if requested. This creates the `Jobs` and `Applications` tabs, appends J:L headers to `Submissions`, and creates a new private resume folder. Existing submission rows remain intact. A conflicting Jobs/Applications schema causes an error instead of overwriting columns.
4. Choose Deploy → Manage deployments. Edit the EXISTING web-app deployment that matches the URL currently in `script.js` (deployment ID starts `AKfycby0XQE0A8B`). Select New version and deploy. Keep its existing execution identity and public access setting. Updating the existing deployment preserves its `/exec` URL; creating a different deployment requires changing the website URL.
5. Open that `/exec` URL. It must show `"version":2`. Refresh qleaps.in. The hiring requirement button should become enabled and the job-seeker view should show the approved feed or an empty state.

## Job approval
Employer submissions arrive in `Jobs` with Status `Pending`. Review the company, role and description. Change column C to `Approved` to publish. Use `Closed` or `Rejected` to keep a role off the public feed. Closing dates are inclusive in India time. Approved jobs may take up to a minute to refresh in a visitor's existing session.

## Applications
Applications have their own reference and Job ID. The server obtains company/title from the approved job, rather than trusting the browser. One candidate can apply to multiple jobs without those applications overwriting each other. Reapplying to the same job updates that candidate's application, preserving its reference and workflow status. A general CV has a blank Job ID. Old historical candidate rows remain in Submissions; new applications are in Applications.

New resumes live in the new private Drive folder. Open them while signed into the owning Google account, or grant named members of your recruitment team access directly. The code never makes new CV files public. Old files uploaded by the previous script remain shareable; it does not retroactively change those files or their permissions.

The public endpoint returns only approved job fields. It never publishes candidate records, employer contact information, or resume links. Submission receipts contain only status and a reference and require a random 128-bit token. Google ContentService redirects JSONP responses to googleusercontent.com; the website's CSP permits those two Google script hosts.

## Verification after deployment
Use your own authorised test data:
- Submit one job; verify its reference exists in Jobs and it stays hidden while Pending.
- Approve it; refresh the job-seeker view and verify the correct role appears.
- Apply with a real PDF/Word test CV; verify the Application row, Job ID and private Drive file.
- Apply to a second role using the same email/phone; verify there are two application rows.
- Close the first role; verify it disappears and the server rejects further applications to it.
- Confirm enquiries still append to Submissions and that no candidate data appears in the public job response.

No new paid services or Netlify functions are required. Existing Netlify, Google Apps Script and Drive quotas apply. File validation checks extension, size and basic file signatures; it is not a malware scanner. Public form submissions should be monitored for abuse.
