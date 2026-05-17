# Browser and OS test matrix

This repository contains static HTML samples for form autofill attributes. Do not enter real email addresses, phone numbers, credit card numbers, passwords, OTPs, serial numbers, or license keys while testing.

Autofill behavior depends on browser, OS, saved profiles, password managers, stored payment information, and user settings. The success criterion is that each page exposes standard HTML that user agents can understand.

| Environment | Target fields | Expected result | Status |
| --- | --- | --- | --- |
| iOS Safari | Email, phone, OTP, password | Saved contact, OTP, or password suggestions can appear when the device has matching data and settings enabled. | Not yet manually tested |
| Android Chrome | Email, phone, card, OTP | Chrome Autofill or keyboard suggestions can appear when matching data is available. | Not yet manually tested |
| macOS Safari | Contact, password, card | Safari and Keychain suggestions can appear when enabled. | Not yet manually tested |
| macOS Chrome | Google Password Manager and Autofill | Chrome suggestions can appear for contact, password, and payment fields when enabled. | Not yet manually tested |
| Windows Chrome | Email, card, password | Chrome Autofill suggestions can appear when matching profile data exists. | Not yet manually tested |
| Windows Edge | Microsoft Autofill | Edge suggestions can appear when Microsoft Autofill has matching data. | Not yet manually tested |

## Static checks

| Check | Expected result | Command |
| --- | --- | --- |
| File structure | All pages, assets, docs, and Pages workflow exist. | `npm test` |
| Labels | Every input has an explicit `label for` matching the input `id`. | `npm test` |
| Input identity | Every input has `id`, `name`, and `autocomplete`. | `npm test` |
| Pattern descriptions | Every `pattern` input has visible help via `aria-describedby` and a `title`. | `npm test` |
| No persistence or network submit | JavaScript prevents submit and avoids storage, cookies, fetch, XHR, beacon, and logging. | `npm test` |
| HTML validation | Pages pass `html-validate`. | `npm run lint:html` |

## Success criteria

| Field group | Required implementation |
| --- | --- |
| Email | `type="email"` and `autocomplete="email"` |
| Phone | `type="tel"` and `autocomplete="tel"` |
| Login | `autocomplete="username"` and `autocomplete="current-password"` |
| New password | `autocomplete="new-password"` |
| OTP | `autocomplete="one-time-code"` and `inputmode="numeric"` |
| Credit card | `cc-name`, `cc-number`, `cc-exp`, `cc-exp-month`, `cc-exp-year`, and `cc-csc` |
| Billing and shipping | `billing postal-code` and `shipping postal-code` |
| Serial number | State that there is no generic standard token and avoid misusing unrelated tokens |
| MDN sources | Show relevant MDN URLs in the site |
| Security | Never submit, store, log, or display entered values |
