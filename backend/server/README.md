# Photo submission service (legacy source)

This folder contains an earlier server implementation used during development. The mobile app's current production integration is managed separately; this folder should not be assumed to describe the deployed service.

## Security

- Do not commit credentials, environment files, service-account JSON, private keys, or access tokens.
- Store secrets only in the deployment platform's protected secret store.
- Restrict access to uploaded content and review submissions before publishing photos.
- Use server-side authorization, request validation, and abuse protection. Client-distributed keys are not secret.
- Rotate any credential that may have been committed or exposed, including through Git history.

Operational configuration, production identifiers, administrative setup, and security-control details are intentionally omitted from this public document. Contact project maintainers through a private channel for authorized deployment instructions.
