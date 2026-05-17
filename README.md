# HTML Form Autofill Samples

Static samples that demonstrate correct HTML form attributes for common inputs:

- email and phone fields
- login and password fields
- account registration and password changes
- one-time codes
- credit card and billing or shipping fields
- serial number and license key fields without a standard autocomplete token

The site is intentionally static. It prevents form submission and does not store, log, display, or transmit entered values.

## Development

```sh
npm ci
npm run check
```

## GitHub Pages

The site is deployed by GitHub Actions from `.github/workflows/pages.yml` using GitHub Pages' OIDC-based deployment flow. No credentials are stored in this repository.
