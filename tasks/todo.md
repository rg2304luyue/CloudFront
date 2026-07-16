# CloudBack backend audit todo

## Scope

- Review sibling backend project `CloudBack` for logic vulnerabilities and concurrency risks.
- Focus areas: authentication/authorization, order creation, stock deduction, cart changes, payment callbacks, user ownership checks, distributed transactions, and idempotency.

## Findings todo

- [x] Map modules, controllers, services, and persistence layer.
- [x] Check order and stock flows for oversell, duplicate submission, and missing transaction boundaries.
- [x] Check payment flow for callback idempotency and amount/order ownership validation.
- [x] Check user/cart/product endpoints for missing ownership or role checks.
- [x] Check cross-service calls and MQ/Redis usage for retries, race conditions, and eventual consistency gaps.

## Risk todo list

- [x] P0: Fix Gateway whitelist matching. `AuthGlobalFilter` now uses method-aware exact routes and numeric-only `/products/{id}` matching, strips trusted headers, and returns HTTP 401 for auth failures.
- [x] P0: Protect internal product mutation endpoints. `ProductController` now requires `X-Internal-Token` for stock deduct/restore and seller/admin role for product upload.
- [x] P0: Add explicit admin authorization to product admin APIs. `AdminProductController` now checks `X-User-Role == ADMIN`.
- [x] P0: Re-check category write authorization after fixing whitelist. Gateway no longer whitelists category write methods; downstream role checks remain in place.
- [x] P1: Revalidate product status and price at order creation. `OrderServiceImpl` now reloads product detail/price from product service, and stock deduction SQL requires `status = 1`.
- [x] P1: Make stock restoration reliable and idempotent. Failed stock restores now enqueue `stock-restore`, and `StockRestoreConsumer` processes it with Redis idempotency.
- [x] P1: Redesign Outbox claiming to avoid duplicate or cross-module sends. Outbox now uses topic-scoped polling, `PENDING -> SENDING` claim, and timeout recovery.
- [x] P1: Avoid direct status overwrite on ship/receive. Ship and receive transitions now use conditional updates.
- [x] P2: Harden public product detail and hot-list filtering. Product detail/list/hot/search loaders now filter to published products.
- [x] P2: Normalize HTTP auth failures. Gateway now returns HTTP 401.

## Review

## Startup follow-up

- [x] Diagnose product/order startup failure: both failed because `CLOUD_INTERNAL_TOKEN` was not present in the local environment.
- [ ] Add `CLOUD_INTERNAL_TOKEN` to the local `CloudBack/.env` using the non-sensitive template entry in `.env.example`.
- [x] Verify product/order compilation with a temporary process-level token: `mvnw.cmd -q -DskipTests -pl cloud-product,cloud-order -am compile`.

## Payment incident follow-up

- [x] Reconcile pending Alipay payments before creating another page-pay request.
- [x] Add payment-service recovery polling for recent pending records after restart or lost callback.
- [x] Add CAS claiming for reconciliation records and handle `TRADE_CLOSED`.
- [x] Add order-list refresh polling without per-order Alipay N+1 queries.
- [x] Run subagent review and resolve the duplicate-query and stale-order-list findings.
- [x] Verify backend Maven compile and frontend Vite build after the payment changes.
- [ ] Confirm the existing Ubuntu `payment.last_sync_time` column exists before deployment; no database migration was executed automatically.

## Frontend reliability and usability follow-up

- [x] Inspect routing, request state, cart, order, and payment-facing pages.
- [x] Make polling resilient to request errors and page visibility changes.
- [x] Fix cart quantity rollback after a delayed update fails.
- [x] Remove order-list refresh flicker and overlapping requests.
- [x] Improve guest search and narrow-screen navigation.
- [x] Build, start the local preview, and complete an independent review.

## Frontend review

- Two independent static reviews were completed; payment polling, delayed cart rollback, async checkbox handling, route keyword reset, auth-state cleanup, and visibility re-scheduling findings were addressed.
- Verification: `npm run build` passed. Vite reported two existing `@vueuse/core` PURE-annotation warnings only.
- Local preview: `http://localhost:5173/`.

## Documentation follow-up

- [x] Reconcile frontend README with current auth, cart, polling, payment, and responsive behavior.
- [x] Add backend operational notes for payment reconciliation, Outbox claiming, internal token, and schema verification.
- [x] Verify README command snippets and close the documentation review.

## Documentation review

- Independent frontend and backend documentation reviews completed; stale authentication, cart, polling, payment recovery, internal-token, Outbox, and schema-operation notes were corrected or clarified.
- No real `.env` file or database was read or modified.

- Implemented backend fixes in sibling `CloudBack`.
- Verification: `mvnw.cmd -q -DskipTests compile` passed for the full multi-module backend.
- Follow-up review: subagent review requested after implementation.
- Subagent review findings resolved: stock compensation outbox now writes in `REQUIRES_NEW`, internal stock token has no public default, payment result includes `tradeNo`, and product price sorting is null-safe.
