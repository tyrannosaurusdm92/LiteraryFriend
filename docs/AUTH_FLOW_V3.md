# LiteraryFriend Access Flow — V3

## Initial access screen

The first screen contains exactly four access actions: **Download app**, **Sign in**, **Sign up**, and **Skip login**. Branding and the supplied animated art can remain around those actions, but account fields and recovery controls do not appear until requested.

- **Download app** uses the installable-web-app flow when the browser exposes it and otherwise explains the browser install command.
- **Sign in** reveals email/username and current-password fields, a Show/Hide password control, the Google account option, and **Forgot password**.
- **Sign up** reveals display name, username, email, optional backup phone, new password, password confirmation, and the Google account option.
- **Skip login** enters the full workspace immediately in local mode without creating an account or producing a session.

## Password-manager compatibility

The access forms use standard form names and autocomplete tokens: `username`, `email`, `current-password`, `new-password`, `tel`, and `one-time-code`. Sign-up phone capture is treated as an optional recovery contact after account creation because the backend registration contract itself accepts identity/password data, while recovery-phone storage is handled through recovery-contact actions.

## Recovery containment

All reset controls are under **Forgot password**. The hidden recovery panel contains reset request, reset completion, and emergency recovery-code sign-in. Verification and two-factor challenge panels are also hidden until a completed account action requires them. No reset-code or new-password form is present on the initial access choice screen.

## Security presentation

The user interface uses familiar actions such as Sign in, Verify, Recover account, Link Google, Connect Drive, and Sign out device. Deployment URLs, action identifiers, storage sheet details, Drive folder IDs, request payloads, and authentication internals are not displayed.
