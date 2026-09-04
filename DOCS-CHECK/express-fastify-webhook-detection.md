# Express & Fastify Webhook Detection

## Overview

Implemented support for detecting payment webhook handlers in Express and
Fastify for rule `MP006`.

Previously, MP006 primarily recognized framework handlers such as exported
`POST` functions. Express and Fastify route registrations could therefore be
missed even when they processed payment webhook requests without verifying
their signatures.

## What Was Changed

Updated `src/detectors/webhook-signature.ts` to recognize:

- Express `app.post(...)`
- Express `router.post(...)`
- Express `app.use(...)`
- Fastify `fastify.post(...)`
- Fastify `fastify.route({ method, url, handler })`

The route must contain `webhook` so that ordinary HTTP routes are not treated
as webhook handlers.

The existing request-body check and payment-gateway detection are still used
to reduce false positives.

GitHub, Slack, and other non-payment webhooks are intentionally ignored when
no supported payment gateway is present.

The implementation also supports verified counterparts, which should remain
silent when the webhook signature is properly checked.

## Webhook Route Detection

MP006 now recognizes Express and Fastify webhook route registrations in addition
to Next.js-style exported handlers.

The detector checks both the file path and the source code for webhook indicators.

This is important because routes such as:

`app.post('/webhooks/razorpay', ...)`

contain the webhook path directly in the source code rather than in the filename.

The detector therefore uses:

```ts
const looksLikeWebhook =
  /webhook/i.test(ctx.relPath) ||
  /webhook/i.test(text) ||
  SIGNATURE_HEADER_RE.test(text);
```

### Test coverage

The implementation includes fixtures for:

- Vulnerable Express webhook → MP006 detected
- Verified Express webhook → no finding
- Vulnerable Fastify `fastify.post()` webhook → MP006 detected
- Verified Fastify webhook → no finding
- Vulnerable Fastify `fastify.route()` webhook → MP006 detected
- Verified Fastify `fastify.route()` webhook → no finding
- Non-payment Express GitHub webhook → no finding


### Manual Testing

```bash
# Tests an unverified Express Razorpay webhook.
# Expected: MP006 CRITICAL finding.
node dist/cli.js manual-test-express

# Tests an Express webhook that verifies the payment signature.
# Expected: No payment logic flaws found.
node dist/cli.js manual-test-express-verified

# Tests a non-payment Express GitHub webhook.
# Expected: It is ignored and no payment finding is reported.
node dist/cli.js manual-test-github

# Tests an unverified Fastify Razorpay webhook using fastify.post().
# Expected: MP006 CRITICAL finding.
node dist/cli.js manual-test-fastify

# Tests an unverified Fastify webhook using fastify.route().
# Expected: MP006 CRITICAL finding.
node dist/cli.js manual-test-fastify-route

# Tests a Fastify webhook with signature verification.
# Expected: No payment logic flaws found.
node dist/cli.js manual-test-fastify-verified

# Tests an unverified Stripe webhook.
# Expected: MP006 CRITICAL finding.
node dist/cli.js manual-test-stripe

# Tests an unverified Cashfree webhook.
# Expected: MP006 CRITICAL finding.
node dist/cli.js manual-test-cashfree

# Runs all manual webhook fixtures together.
# Expected: Vulnerable fixtures are detected while safe fixtures remain silent.
node dist/cli.js manual-test
```