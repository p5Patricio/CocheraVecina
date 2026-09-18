# CocheraVecina — Agent Guide & Project Playbook (`AGENTS.md`)

> **Project**: CocheraVecina (Marketplace de cocheras y pensión vehicular en México)  
> **Studio**: Symmetrical Code  
> **Last Updated**: September 2026  
> **Target Audience**: AI Agents, Engineers, and Maintainers  

---

## 1. Project Overview & Core Mission

**CocheraVecina** is a peer-to-peer parking and vehicle boarding marketplace in Mexico. It connects travelers and drivers with verified Mexican hosts who have available parking spaces (private carports, open yards, residential parking spots, and pensiones).

### Key Business Rules:
- **Flexible Durations**: Stays can be booked **by hours** or **by days** (no artificial day limits; hosts set minimum/maximum availability).
- **Vehicle Diversity**: Accommodates **motos / cuatrimotos** (`moto`), **compact cars** (`compact`), **sedans** (`sedan`), **SUVs** (`suv`), and **pickups / large trucks** (`truck`).
- **Space Types**:
  - `covered` (Cochera techada / portón eléctrico)
  - `uncovered` (Al aire libre / cajón privado)
  - `pension` (Pensión vehicular o estacionamiento comercial / lote vigilado)
- **Pilot & Expansion**: Initiated in León and El Bajío airport corridor (BJX), with nationwide coverage supporting all 32 Mexican states.

---

## 2. System Architecture & Tech Stack

```
                                    +------------------------------+
                                    |    Porkbun DNS (patodev.com) |
                                    +--------------+---------------+
                                                   |
                                                   v
                                    +------------------------------+
                                    |   Traefik (Coolify Ingress)  |
                                    +------+---------------+-------+
                                           |               |
               https://cocheravecina.patodev.com/          | https://api.cocheravecina.patodev.com/
                                           |               |
                                           v               v
                        +----------------------+       +----------------------+
                        |   Frontend Container |       |   Backend Container  |
                        |   Next.js 14 (App)   | ----> |   FastAPI (Python)   |
                        +----------------------+       +----------+-----------+
                                                                  |
                                                                  v
                                                       +----------------------+
                                                       |  PostgreSQL 16 DB    |
                                                       |  Docker volume pgdata|
                                                       +----------------------+
```

### 2.1 Backend (`/backend`)
- **Framework**: FastAPI (Python 3.12).
- **Database ORM**: SQLAlchemy 2.0 Async with `asyncpg` (PostgreSQL in production) and `aiosqlite` for lightweight testing.
- **Concurrency & Locking**: Explicit atomic transactions (`atomic_transaction`) with pessimistic row locking (`with_for_update`) to eliminate race conditions and double-bookings.
- **Validation**: Pydantic v2 schemas (`app/schemas/`).
- **Security**: PyJWT with OAuth2 password bearer tokens, bcrypt password hashing.
- **Media Pipeline**: Pillow (PIL) WebP conversion pipeline for profile avatars and spot photo galleries, served via `/media`.
- **Testing**: `pytest` with `httpx.AsyncClient`. Run with `python -m pytest backend/tests/`.

### 2.2 Frontend (`/frontend`)
- **Framework**: Next.js 14 (App Router, React 18, TypeScript).
- **Styling**: Tailwind CSS, custom design tokens, Lucide React icons.
- **Components**:
  - `CitySelector.tsx`: Combobox with accent-insensitive search covering all 32 Mexican states, metro zones, and airports.
  - Search Bar: Decoupled arrival and departure compartments (preventing native calendar picker collisions).
  - Dual Dashboard: Unified interface switching between Host ("Mis Cocheras y Solicitudes") and Guest ("Mis Reservas") modes.
- **SEO & Social Graph**:
  - Dynamic `sitemap.ts` (13 dynamic & static indexable routes).
  - `robots.ts` with strict indexing rules.
  - Schema.org JSON-LD graph (`WebSite`, `Organization`, `FAQPage`).
  - OpenGraph 1200×630 banner (`opengraph-image.jpg`), Twitter `summary_large_image`, SVG favicons with dark mode.

---

## 3. Stripe Connect & Payment Integration

### 3.1 What We Achieved
We implemented a complete marketplace payment workflow using **Stripe Connect with Express Accounts** tailored for Mexican tax and banking regulations (`country="MX"`, currency `MXN`).

### 3.2 Commission & Payout Mathematics
Every booking operates under a dual-fee marketplace structure:

$$\text{Guest Total} = \text{Base Amount} + 10\% \text{ (Traveler Platform Fee)}$$
$$\text{Host Payout} = \text{Base Amount} - 5\% \text{ (Host Marketplace Commission)}$$
$$\text{Platform Revenue (Application Fee)} = 10\% + 5\% = 15\% \text{ of Base Amount}$$

*Example: For a \$1,000 MXN base booking, the guest pays \$1,100 MXN, the host receives \$950 MXN deposited to their CLABE, and CocheraVecina retains \$150 MXN.*

### 3.3 Transaction Flow
1. **Host Onboarding**: Host clicks "Conectar cuenta Stripe" in Dashboard. Backend calls `stripe.Account.create(type="express", country="MX", capabilities={"transfers": {"requested": True}, "card_payments": {"requested": True}})` and returns an onboarding URL via `stripe.AccountLink.create`.
2. **Checkout**: When guest books, backend creates a Stripe Checkout Session with **Destination Charges**:
   ```python
   session = stripe.checkout.Session.create(
       payment_method_types=["card"],
       line_items=[{...}],
       mode="payment",
       payment_intent_data={
           "application_fee_amount": application_fee,
           "transfer_data": {"destination": host_stripe_account_id},
       },
       success_url=f"{settings.FRONTEND_URL}/bookings/{booking.id}?success=true",
       cancel_url=f"{settings.FRONTEND_URL}/spots/{spot.id}?cancelled=true",
   )
   ```
3. **Webhooks (`POST /api/v1/payments/webhook`)**:
   - `checkout.session.completed`: Marks booking as `PAID`.
   - `account.updated`: Updates `host.payouts_enabled` status in database.
4. **Flexible Cancellation & Refunds**:
   - 100% automatic refund if cancelled at least **24 hours prior to check-in** (or if host rejects/cancels).
   - Stripe reverses transfer and refunds fee:
     ```python
     stripe.Refund.create(
         payment_intent=booking.stripe_payment_intent_id,
         reverse_transfer=True,
         refund_application_fee=True,
     )
     ```

> [!CRITICAL]
> **Stripe Sandbox / Test Mode Only**: Keep Stripe strictly in test mode (`sk_test_...` / `pk_test_...`). Never switch to live keys without explicit owner authorization.

---

## 4. Infrastructure, Coolify & Deployment Guide

### 4.1 Server & Domain Details
- **VPS Provider**: Contabo VPS (`62.171.169.34`).
- **Domain Base**: `patodev.com` (DNS managed on Porkbun).
- **Public Endpoints**:
  - Web Application: [https://cocheravecina.patodev.com](https://cocheravecina.patodev.com)
  - Backend API: [https://api.cocheravecina.patodev.com](https://api.cocheravecina.patodev.com)
  - OpenAPI Swagger Docs: [https://api.cocheravecina.patodev.com/docs](https://api.cocheravecina.patodev.com/docs)
  - Healthcheck: [https://api.cocheravecina.patodev.com/health](https://api.cocheravecina.patodev.com/health)

> [!CAUTION]
> **CRITICAL SECURITY RULE — ZERO DEMOX INTERACTION**:
> Under **NO CIRCUMSTANCES** should any agent inspect, touch, stop, modify, or delete the existing `Demox` container, Coolify resource, or Porkbun DNS records. Only interact with the `CocheraVecina` project.

### 4.2 Coolify Configuration
- **Coolify Instance**: Running locally on server / internal network at `http://localhost:8000`.
- **Project**: `CocheraVecina`
- **Environment**: `production`
- **Resource UUID**: `u5pc2vu8ab23t6txtn9tr3cx` (Docker Compose application).
- **Compose Services**:
  1. `postgres`: PostgreSQL 16 Alpine with persistent volume `postgres_data`.
  2. `backend`: FastAPI Python 3.12 container, connects to `postgres:5432`, exposed via Traefik to `https://api.cocheravecina.patodev.com`.
  3. `frontend`: Next.js 14 standalone multi-stage build, exposed via Traefik to `https://cocheravecina.patodev.com`.

### 4.3 Step-by-Step Deployment Process
Whenever code changes are ready to deploy to production:

1. **Verify locally**:
   - Backend tests: `python -m pytest`
   - Frontend build: `npm run build` inside `frontend/`
2. **Commit and push to GitHub**:
   ```bash
   git add .
   git commit -m "feat(scope): your descriptive conventional commit"
   git push origin main
   ```
3. **Trigger Coolify Deployment**:
   - **Method A (Browser / Coolify Dashboard)**:
     - Navigate to `http://localhost:8000/project/0vtakfcqcojolp6zcauteijw/environment/ytki7qagmuwlbi9toe6fmxio/application/u5pc2vu8ab23t6txtn9tr3cx`.
     - Click the **Deploy** button.
   - **Method B (Webhook / API)**:
     - Trigger Coolify's deployment webhook for resource `u5pc2vu8ab23t6txtn9tr3cx`.
4. **Monitor Logs**:
   - Follow build progress in Coolify deployment logs.
   - Wait until `Container postgres Healthy`, `Container backend Started`, `Container frontend Started`, and `New container started.` are displayed.
5. **Sanity Check Production**:
   ```bash
   curl -I https://cocheravecina.patodev.com/
   curl -I https://api.cocheravecina.patodev.com/health
   ```

---

## 5. Design System Reference (`DESIGN.md`)

Our design system is fully documented in [`DESIGN.md`](file:///c:/Users/Usuario/Documents/CocheraVecina/DESIGN.md).

### Quick Summary of Design Standards:
- **Palette**: Deep Midnight Navy (`#0F172A` / `#080C1A`) + Electric Cobalt Blue (`#2563EB` / `#1D4ED8`) + Slate borders (`#E2E8F0`).
- **Official Brand Mark**: Bi-tone vehicle silhouette under a protective carport canopy arch located at `/logo.png` and `/logo-mark-192.png`.
- **Anti-AI-Slop Restraint**: Zero purple/magenta gradients, zero floating blob meshes, zero generic marketing clichés. Clean Airbnb-level clarity + Stripe-grade transactional precision + Linear-speed transitions (150ms).

---

## 6. Current Progress & Immediate Next Steps

### Completed Milestones:
- [x] Full-stack architecture with Postgres, FastAPI, and Next.js 14.
- [x] Database concurrency control with row-level locks on bookings.
- [x] Stripe Connect onboarding and destination checkout in test mode.
- [x] Multi-image WebP upload pipeline for user avatars and spot listings.
- [x] Brand identity, bi-tone logo assets, and frontend redesign.
- [x] Dynamic Mexico city selector with accent-insensitive search.
- [x] Scope expansion: Hourly & daily rates, moto/quad/car/truck support, covered/uncovered/pensión space types.
- [x] Production deployment on Contabo VPS with SSL via Coolify.
- [x] 100/100 SEO overhaul with OpenGraph banner, JSON-LD schemas, sitemap, and robots.txt.

### Up Next in Priority Order:
1. **Email Verification via 6-digit OTP (Resend)**:
   - Integrate `resend` Python SDK in backend.
   - Add fields to `User` model: `verification_code`, `verification_code_expires_at`, `email_verified_at`.
   - Dispatch emails from `verificacion@patodev.com` or `hola@patodev.com` using the verified domain `patodev.com`.
   - Provide endpoints `POST /api/v1/auth/verify-code` and `POST /api/v1/auth/resend-code`.
   - Add modal dialog in frontend during registration / before checkout.
   - Set `RESEND_API_KEY` in Coolify environment variables.
2. **End-to-End Sandbox Booking Test**:
   - Create sample listings in León, BJX Airport, and CDMX.
   - Complete guest reservation with Stripe test card (`4242...`).
   - Confirm host dashboard reflects incoming booking and payout status.
