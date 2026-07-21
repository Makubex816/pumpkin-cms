# Authorize.Net Gated Intake and Payment Architecture

## Current state

```text
upstream head inspected: 18b5cea01d23298b95b5945999e66a4aec8d748b
Authorize.Net implementation observed: no
partner intent: future tenant additive/push
implementation authority now: none
transaction authority now: none
```

CAPTCHA and visual-editor delivery do not satisfy the payment gate.

## Intake questions when source appears

- Is the change tenant configuration only or a complete payment flow?
- Are credentials represented only by secret references?
- Does card data bypass Pumpkin servers through Accept.js or Accept Hosted?
- What are PaymentIntent, PaymentAttempt, PaymentTransaction, and PaymentEvent contracts?
- How are duplicate submissions, ambiguous timeouts, webhooks, capture, void, refund, and settlement handled?
- Which tenant categories and merchant accounts are approved?
- What sandbox and production evidence exists?

## Stable architecture

```text
Booking/order domain
→ PaymentIntent
→ hosted/tokenized provider UI
→ one-time payment token
→ server-side provider transaction
→ PaymentAttempt/Transaction
→ signed/deduplicated webhook event
→ authoritative provider readback
```

Payment records remain separate from FormEntry. Tenant configuration alone is not “payments complete.”
