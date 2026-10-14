# Booking architecture

Two rules under everything: **a night is sold only once**, and **only Stripe confirms that money arrived**, never a page.

## The flow

1. **Availability.** One Cloudflare Durable Object per property is the only gatekeeper for nights. Airtable mirrors what it decides; it never locks. (KV is eventually consistent, so it cannot be the lock.)
2. **Quote.** The Worker prices the dates: base, then season, then weekend uplift, then a date override set in the dashboard. Minimum nights follow the arrival date. Fees and taxes are separate lines; the guest sees the all-in total from the first screen (FTC fee rule, since May 12, 2025).
3. **Hold.** 35 minutes, set by a Durable Object alarm whose handler is safe to fire twice.
4. **Pay.** Stripe Checkout Session, expiring after 30 minutes (Stripe's minimum), `client_reference_id` = hold ID, idempotency key = hold ID. The guest ticks the rental agreement; the version is stored.
5. **Confirm.** Only the verified `checkout.session.completed` webhook confirms. Event IDs are logged so a repeat does nothing. The success page only displays.
6. **Record.** Written to Airtable through a queue (Airtable allows 5 requests per second per base; a 429 means wait 30 seconds). Prices, taxes and the cancellation-policy version are frozen on the booking.
7. **Tell.** Confirmation email with an `.ics` file; a ping to Eric and Mona.
8. **Calendar.** Private export at `/cal/{secret}.ics`: DTEND = checkout, stable UIDs, "Reserved" only, no guest data (RFC 5545). Imports polled every 15 to 30 minutes.
9. **Collect.** Deposit at booking with the card saved (`setup_future_usage=off_session`); balance charged about 30 days before arrival.
10. **Arrive.** Door code and wifi 24 to 48 hours before arrival, once paid.

## Webhooks

`checkout.session.completed`, `checkout.session.expired`, `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`, `charge.dispute.created`, `charge.dispute.closed`.

## Decisions

- **Build, not buy.** A quote / hold / confirm interface sits in front, so a commercial engine could replace it later.
- **No security-deposit holds** (they lapse in about 4 to 7 days); the agreement and a damage clause cover damage.
- **Taxes in the Worker** as separate lines: 8% NY sales tax (Delaware County) and 2% county occupancy.
- **No card or ID data** in Airtable; guest contact details in their own table.
- **Dashboard** behind Cloudflare Access with a one-time PIN. Secrets in Worker secrets. Rate-limit binding on `/quote` and `/hold`.
- **Costs:** Stripe 2.9% + 30¢ per payment; $15 per dispute.

## Paperwork before real payments

NY sales-tax vendor registration (NY Business Express); Delaware County 2% occupancy Certificate of Authority (treas@co.delaware.ny.us, 607-832-5070); county short-term-rental registry if the town takes part; insurance for paying guests (dwelling value plus $300,000 liability); a lawyer-drafted rental agreement; confirm whether the parcel is in the Village of Hobart or the Town of Stamford.

Everything can be built and tested in Stripe test mode first.
