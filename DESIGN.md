# CocheraVecina — Design System Specification (`DESIGN.md`)

> **Version**: 1.0.0  
> **Status**: Production Reference  
> **Philosophy**: Airbnb marketplace ergonomics + Stripe transactional precision + Linear anti-slop craftsmanship.

---

## 1. Design Philosophy & Aesthetic Core

CocheraVecina is a peer-to-peer parking and vehicle boarding marketplace connecting drivers and travelers with trusted hosts across Mexico for hourly, daily, or extended stays.

- **Trust Over Flash**: Security and predictability reign supreme. Users trust us with their vehicles while traveling.
- **Photography & Clarity First**: Authentic photographs of garages, electric gates, and surveillance take precedence over abstract decorative graphics.
- **Anti-AI-Slop Restraint**: Zero purple/magenta gradients, zero floating blob meshes, zero generic 3-column feature templates with placeholder icons. Every pixel and line exists to guide the user to find a spot, book safely, or manage payouts.
- **Bi-tone Brand Balance**: Grounded in Deep Midnight Navy (`#080C1A` / `#0F172A`) for structural confidence, illuminated by Electric Cobalt Blue (`#2563EB`) on actionable elements, cushioned on clean crisp white and mist surfaces.

---

## 2. Color System & Semantic Tokens

### 2.1 Brand Palette
| Token | Hex | Role & Usage |
| :--- | :--- | :--- |
| `brand-navy-950` | `#080C1A` | Deepest brand canvas, dark mode headers, high-contrast borders |
| `brand-navy-900` | `#0F172A` | Primary text headings, logo frame, structural anchors |
| `brand-navy-800` | `#1E293B` | Secondary headers, dark card backgrounds |
| `brand-cobalt-600` | `#2563EB` | **Primary Action / Logo Accent**: Main CTA buttons, active tabs, canopy accent |
| `brand-cobalt-700` | `#1D4ED8` | Hover state for primary actions |
| `brand-cobalt-50` | `#EFF6FF` | Subtle brand tint for badges, selected rows, active highlights |
| `brand-amber-500` | `#F59E0B` | Spot ratings, pending approval status, caution indicators |
| `brand-emerald-600` | `#10B981` | Paid/Confirmed bookings, verified host badge, net payout totals |

### 2.2 Neutral Surfaces & Hairline Borders
| Token | Hex | Role & Usage |
| :--- | :--- | :--- |
| `surface-canvas` | `#FFFFFF` | Primary page background and card fill |
| `surface-subtle` | `#F8FAFC` | Page body background, search bar container, alternating rows |
| `surface-elevated` | `#FFFFFF` | Modals, dropdowns, floating search widgets with crisp shadow |
| `border-hairline` | `#E2E8F0` | Default 1px structural separator for cards and headers |
| `border-subtle` | `#F1F5F9` | Inner dividers, secondary boundaries |
| `border-strong` | `#CBD5E1` | Input borders on hover, active card strokes |
| `text-primary` | `#0F172A` | Highest-emphasis text, spot titles, pricing values |
| `text-secondary` | `#475569` | Body descriptions, address strings, host labels |
| `text-muted` | `#94A3B8` | Date hints, placeholder labels, disabled states |

---

## 3. Typography System

The system relies on modern, geometric, high-legibility sans-serif typography.

- **Primary Font**: `Plus Jakarta Sans` or `Inter`, system fallback `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`.
- **Monospace Font (Code, IDs, CLABE, booking numbers)**: `'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace`.

### Typographic Scale
| Level | Size / Line-Height | Weight | Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Display Hero** | `36px / 1.15` (sm: `44px / 1.1`) | `800` (Extrabold) | `-0.03em` | Main landing headline |
| **Heading 1** | `28px / 1.25` | `700` (Bold) | `-0.025em` | Spot detail title, page headers |
| **Heading 2** | `20px / 1.3` | `700` (Bold) | `-0.02em` | Section titles, modal titles |
| **Heading 3** | `16px / 1.35` | `600` (Semibold) | `-0.01em` | Card titles, dashboard module headers |
| **Body Large** | `16px / 1.5` | `400` / `500` | `0` | Lead paragraphs, key descriptions |
| **Body Regular** | `14px / 1.45` | `400` / `500` | `0` | Default body copy, list items |
| **Body Small / Meta** | `12px / 1.4` | `500` / `600` | `+0.01em` | Address lines, timestamps, pill labels |
| **Micro Badge** | `11px / 1.2` | `700` (Bold) | `+0.03em` | Uppercase chips, feature tags, vehicle sizes |

---

## 4. Component Patterns & Rules

### 4.1 Navbar
- **Height**: `64px` (`h-16`). Sticky header with subtle backdrop blur: `bg-white/95 backdrop-blur-md border-b border-slate-200/80`.
- **Logo Presentation**: Always utilize the official bi-tone mark `logo.png` / `logo-mark.png` alongside clean typographic lockup `Cochera` (Navy 900) + `Vecina` (Cobalt 600) + `MX` country badge.
- **Actions**:
  - Direct search navigation.
  - "Publicar mi espacio" action with distinct border or subtle blue tint.
  - User profile avatar chip with dropdown / direct dashboard link.

### 4.2 Floating Search Widget (Airbnb-Style Pill)
- **Geometry**: Compact rounded pill on mobile (`rounded-2xl`), unified segmented bar on desktop (`rounded-full shadow-lg shadow-slate-900/5 border border-slate-200/80 bg-white`).
- **Interaction**:
  - Divided into 4 explicit zones:
    1. **Destino / Ciudad**: Combobox with accent-insensitive search covering all 32 Mexican states, metro areas, and airport hubs.
    2. **Llegada**: Date selector with separate compartment preventing native calendar icon collision.
    3. **Salida**: Departure date selector.
    4. **Vehículo**: Dropdown supporting Moto / Cuatrimoto (`moto`), Auto compacto (`compact`), Sedán (`sedan`), Camioneta / SUV (`suv`), and Pickup / Grande (`truck`).
  - Hover states apply soft gray highlights (`bg-slate-50/80`).
  - Search trigger is a solid Cobalt button (`bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-7 py-3.5`).

### 4.3 Spot Listing Card
- **Aspect Ratio**: Photo container fixed at `16:10` or `4:3` with `rounded-2xl overflow-hidden border border-slate-200/60 bg-slate-100`.
- **Photo Polish**: Next.js optimized WebP rendering via `getMediaUrl` with subtle zoom hover effect (`group-hover:scale-105 transition-transform duration-300 ease-out`).
- **Badge Overlay**: Floating top-left/bottom-left pills with backdrop blur:
  - Space Type: `"Techado"`, `"Al aire libre"`, or `"Pensión"`.
  - Max Vehicle: `"Hasta SUV"`, `"Sedán"`, `"Moto"`, etc. (`bg-blue-600 text-white font-bold`).
- **Content Hierarchy**:
  - Row 1: City + Neighborhood in bold small caps.
  - Row 2: Spot title (truncate 1 line, font-bold).
  - Row 3: Price in Mexican Pesos: **`$180 MXN`** `/ día` or **`$25 MXN`** `/ hora` (`text-base font-extrabold text-slate-900`).

### 4.4 Booking & Quote Card (Stripe / Airbnb Hybrid)
- Sticky desktop sidebar widget (`sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm`).
- **Price Transparency Breakdown**:
  - Base amount: `$X MXN × N días`
  - Tarifa de servicio al viajero: `+10%`
  - Garantía de reembolso: `100% reembolsable hasta 24h antes`
  - Total exacto destacado: Large bold total.
- **Action**: Primary full-width Cobalt button with loading state.

### 4.5 Host & Guest Dual Dashboard
- **Header Profile Card**: Displays user avatar with instantaneous upload trigger, email, full name, and verified badge.
- **Segmented Controls**: Sleek pill tabs (`bg-slate-100 p-1 rounded-xl`) switching between "Mis Reservas" (Guest) and "Mis Cocheras & Solicitudes" (Host).
- **Stripe Connect Banner**: Clear callout showing payout readiness or one-click onboarding via Express.

---

## 5. Micro-Interactions & Motion Tokens

Following the **Linear** standard: motion should be swift, intentional, and never delay user actions.

- **Fast Transitions**: `150ms ease-out` for hover states, buttons, links, border-color.
- **Standard Scale**: `200ms cubic-bezier(0.16, 1, 0.3, 1)` for modal entries and dropdown reveals.
- **Hover Lift**: Small elevation (`hover:-translate-y-0.5 hover:shadow-md`) strictly on listing cards; buttons only transition background color and internal shadow.

---

## 6. Hard Rules: Anti-AI-Slop Checklist

1. **NO Purple/Pink Tech Gradients**: Strict adherence to Deep Navy (`#0F172A`), Cobalt Blue (`#2563EB`), and neutral slates.
2. **NO Decorative Abstract Blobs**: Use real UI containers, dot grids, or subtle hairline dividers.
3. **NO Generic Icon-in-Circle Features**: Present information as concrete data chips, interactive filters, or realistic photos.
4. **NO Fluffy Marketing Jargon**: Replace "Experiencia revolucionaria potenciada por IA" with plain Mexican automotive reality: "Cochera techada con portón eléctrico a 8 min del Poliforum".
5. **Hairlines Over Heavy Shadows**: Rely on `border border-slate-200/80` with minimal `shadow-sm` rather than heavy blurred drop shadows.
6. **Strict WCAG 2.1 AA Contrast**: Ensure all text over surfaces satisfies minimum 4.5:1 contrast.
