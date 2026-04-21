# TraceLite — Figma AI Design Brief

> **Instructions for Figma AI / design agent:** Use this document to generate a complete UI design for TraceLite, an API observability dashboard. Design every screen described below as high-fidelity dark-mode frames. Follow the specifications exactly.

---

## Product Summary

TraceLite is a lightweight SaaS dashboard that shows developers analytics about their API usage — request volume, error rates, latency, and per-endpoint breakdowns. Think a simplified, minimal Datadog or PostHog.

**Target user:** Solo developers and small teams who want simple API monitoring.
**Tone:** Technical, clean, professional. Not playful — this is a dev tool.
**Comparable products for design reference:** Vercel Dashboard, Linear, PostHog, Datadog (but much simpler).

---

## Design System

### Theme
- **Dark mode only** — no light mode variant needed
- **Minimal and dense** — this is a data-heavy dashboard, maximize information density without feeling cramped

### Colors

| Name | Hex | Usage |
|---|---|---|
| Background | `#0a0a0b` | Page background, behind everything |
| Card | `#141416` | Cards, panels, sidebar, modals |
| Card Hover | `#1c1c1f` | Hover states on cards, active sidebar items |
| Border | `#27272a` | Card borders, dividers, input borders |
| Text Primary | `#fafafa` | Headings, values, primary content |
| Text Secondary | `#a1a1aa` | Labels, descriptions, timestamps, muted text |
| Text Muted | `#52525b` | Disabled text, placeholder text |
| Accent / Primary | `#3b82f6` | Primary buttons, active nav, links, focus rings |
| Accent Hover | `#2563eb` | Button hover state |
| Success | `#22c55e` | 2xx status badges, healthy indicators, positive trends |
| Warning | `#eab308` | 4xx status badges, elevated error rates |
| Error / Danger | `#ef4444` | 5xx status badges, error indicators, negative trends, destructive actions |
| Chart Blue | `#3b82f6` | Primary data line in charts |
| Chart Red | `#ef4444` | Error data line in charts |
| Chart Purple | `#8b5cf6` | Latency data line in charts |

### Typography

| Element | Font | Size | Weight | Color |
|---|---|---|---|---|
| Page title | Inter | 24px | 600 | Text Primary |
| Section heading | Inter | 16px | 600 | Text Primary |
| Card title / Label | Inter | 12px | 500 | Text Secondary, uppercase, letter-spacing 0.05em |
| Body text | Inter | 14px | 400 | Text Primary |
| Small text / Timestamps | Inter | 12px | 400 | Text Secondary |
| Metric value (big number) | Inter | 28px | 700 | Text Primary |
| Code / API key | JetBrains Mono | 13px | 400 | Text Primary |
| Badge text | Inter | 11px | 500 | White |

### Spacing & Sizing

| Element | Value |
|---|---|
| Border radius (cards, buttons, inputs) | 8px |
| Border radius (badges, pills) | 4px |
| Card padding | 20px |
| Page content padding | 32px |
| Gap between metric cards | 16px |
| Gap between major sections | 24px |
| Sidebar width | 240px |
| Input height | 40px |
| Button height | 40px |
| Table row height | 48px |

### Component Styles

**Cards:**
- Background: Card (`#141416`)
- Border: 1px solid Border (`#27272a`)
- Border radius: 8px
- Padding: 20px
- No shadow (flat design)

**Buttons (Primary):**
- Background: Accent (`#3b82f6`)
- Text: white, 14px, 500 weight
- Border radius: 8px
- Height: 40px, horizontal padding: 16px
- Hover: Accent Hover (`#2563eb`)

**Buttons (Secondary / Ghost):**
- Background: transparent
- Border: 1px solid Border (`#27272a`)
- Text: Text Secondary
- Hover: Card Hover background

**Inputs:**
- Background: `#0a0a0b` (page bg, slightly recessed look)
- Border: 1px solid Border (`#27272a`)
- Text: Text Primary
- Placeholder: Text Muted
- Focus: border changes to Accent, subtle glow/ring

**Badges (Status Codes):**
- 2xx: Success bg at 15% opacity, Success text
- 4xx: Warning bg at 15% opacity, Warning text
- 5xx: Error bg at 15% opacity, Error text
- Method badges: similar pattern (GET=blue, POST=green, PUT=yellow, DELETE=red)

**Table:**
- Header row: Text Secondary, 12px uppercase, no background
- Data rows: 48px tall, subtle bottom border (`--border`)
- Hover: Card Hover background
- Alternating rows: not needed (hover is enough)

---

## Screens to Design

Design each of the following as a separate Figma frame at **1440x900px** (desktop).

---

### Frame 1: Login Page

**Layout:** Centered vertically and horizontally on the page. No sidebar.

**Elements:**
- Full page background: Background color
- Centered container, max-width 400px
- Top: "⚡ TraceLite" logo/wordmark (lightning bolt emoji or icon + "TraceLite" in 20px bold)
- Below logo: Card containing:
  - "Log in to your account" — 16px, Text Secondary
  - Email input field with label "Email"
  - Password input field with label "Password"
  - "Log In" primary button, full width
  - Divider line
  - "Don't have an account? Sign up →" link text, centered, Text Secondary with "Sign up" in Accent color

---

### Frame 2: Signup Page

**Layout:** Same centered layout as Login.

**Elements:**
- Same container as login
- "⚡ TraceLite" logo
- Card containing:
  - "Create your account" — 16px, Text Secondary
  - Email input
  - Password input
  - Confirm password input
  - "Create Account" primary button, full width
  - "Already have an account? Log in →" link

---

### Frame 3: Overview Dashboard

**Layout:** Sidebar (240px, left) + Main content area (fluid, right)

**Sidebar:**
- Background: Card color, right border
- Top: "⚡ TraceLite" wordmark, 18px bold
- Navigation (vertical list, 32px gap from logo):
  - ● Overview (active state: Text Primary color, Card Hover background, 3px left accent bar)
  - ○ Requests (inactive: Text Secondary, icon + label)
  - ○ Endpoints (inactive)
  - ○ Settings (inactive)
- Icons: use simple line icons (Lucide style) — grid icon for Overview, list icon for Requests, bar-chart icon for Endpoints, gear icon for Settings
- Bottom section (pinned to bottom):
  - Org selector: Card with org name "My Startup" + chevron-down icon, click to open dropdown
  - Below: user email "dev@myapp.com" in Text Muted, 12px
  - "Log out" link in Text Muted

**Main content:**

**Row 1 — Metric Cards (4 cards in a row, equal width):**

Card 1: "TOTAL REQUESTS"
- Label: "TOTAL REQUESTS" (12px, uppercase, Text Secondary)
- Value: "24,891" (28px, bold, Text Primary)
- Trend: "↑ 12.3% vs yesterday" (12px, Success color)

Card 2: "ERROR RATE"
- Label: "ERROR RATE"
- Value: "2.4%" (28px, bold, Text Primary)
- Trend: "↓ 0.8%" (12px, Success color — down is good for errors)

Card 3: "AVG LATENCY"
- Label: "AVG LATENCY"
- Value: "127ms"
- Trend: "↓ 15ms" (Success color)

Card 4: "ACTIVE API KEYS"
- Label: "ACTIVE API KEYS"
- Value: "3"
- Trend: "— No change" (Text Muted)

**Row 2 — Request Volume Chart (full width card):**
- Card header: "Request Volume" left-aligned, time range pills right-aligned: [24h] [7d] [30d] — "24h" is active (Accent bg)
- Chart: Area chart with soft gradient fill below the line
  - Blue line + blue gradient: total requests over time
  - Red line (thinner, dashed or lighter): errors
  - X-axis: time labels (12am, 4am, 8am, 12pm, 4pm, 8pm, 12am)
  - Y-axis: request count (0, 5k, 10k, 15k, 20k)
  - Show a tooltip hovering over one data point: small dark card with "Apr 5, 2:00 PM — Requests: 1,245 — Errors: 31"
- Legend: small colored dots + labels below chart or in header

**Row 3 — Two cards side by side (50/50):**

Left card: "Top Endpoints"
- Ranked list, 5 rows
- Each row: rank number (Text Muted), endpoint path (Text Primary, monospace), request count right-aligned (Text Secondary)
- Subtle horizontal progress bar behind each row showing relative volume (Accent color, low opacity)
- Data:
  1. `/api/users` — 8,421
  2. `/api/orders` — 4,102
  3. `/api/products` — 3,890
  4. `/api/auth/login` — 2,340
  5. `/api/search` — 1,988

Right card: "Status Distribution"
- Horizontal stacked bar chart (one bar, full width) showing proportion:
  - Green segment (2xx): 87%
  - Yellow segment (4xx): 10%
  - Red segment (5xx): 3%
- Legend below: colored dot + label + percentage for each
- Or alternatively: a donut/ring chart (designer's choice for what looks cleaner)

---

### Frame 4: Requests Explorer

**Sidebar:** Same as Overview, but "Requests" nav item is active.

**Main content:**

**Filter bar (top, full width):**
- Search input: placeholder "Search by endpoint..." with magnifying glass icon
- Dropdown: "Status" (default: "All") — multi-select: 2xx, 3xx, 4xx, 5xx
- Dropdown: "Time range" (default: "Last 24h") — Last hour, Last 24h, Last 7d, Last 30d, Custom
- "Clear filters" text button on right (Text Secondary, appears only when filters active)

**Table (full width card below filters):**

| Timestamp | Method | Endpoint | Status | Latency |
|---|---|---|---|---|
| Apr 5, 12:41:03 PM | `GET` | /api/users | `200` | 42ms |
| Apr 5, 12:41:02 PM | `POST` | /api/orders | `201` | 187ms |
| Apr 5, 12:40:58 PM | `GET` | /api/search | `500` | 2,104ms |
| Apr 5, 12:40:55 PM | `GET` | /api/users/1 | `404` | 12ms |
| Apr 5, 12:40:51 PM | `DELETE` | /api/orders/42 | `204` | 89ms |
| Apr 5, 12:40:48 PM | `POST` | /api/auth/login | `401` | 34ms |
| Apr 5, 12:40:44 PM | `GET` | /api/products | `200` | 28ms |
| Apr 5, 12:40:40 PM | `PUT` | /api/users/3 | `200` | 156ms |

- Method column: colored badge (GET=blue, POST=green, PUT=yellow, DELETE=red)
- Status column: colored badge (200/201/204=green, 401/404=yellow, 500=red)
- Latency: Text Primary, right-aligned. Values over 1000ms shown in Warning or Error color
- Endpoint: monospace font

**Pagination (bottom of table):**
- "Showing 1–25 of 1,168" on left (Text Secondary)
- Page numbers on right: ◀ 1 2 3 ... 47 ▶

**Expanded row (show one row expanded):**
- The 3rd row (the 500 error one) is expanded
- Below the row, show a detail panel (Card Hover background, no separate card border, indented):
  - Request ID: `req_a1b2c3d4` (monospace)
  - API Key: `tl_live_****7f2a` (monospace, masked)
  - User Agent: `axios/1.6.0`
  - IP Address: `192.168.1.42`
  - Metadata: `{ "region": "us-east-1" }` (monospace, code block style)

---

### Frame 5: Endpoints Breakdown

**Sidebar:** "Endpoints" nav item active.

**Main content:**

**Time range selector (top right):** Pill buttons: [24h] [7d] [30d]

**Table (full width card):**

| Endpoint | Requests | Error Rate | Avg Latency | P95 | P99 |
|---|---|---|---|---|---|
| /api/users | 8,421 | 1.2% | 45ms | 120ms | 340ms |
| /api/orders | 4,102 | 3.8% | 187ms | 450ms | 1.2s |
| /api/products | 3,890 | 0.5% | 32ms | 89ms | 210ms |
| /api/auth/login | 2,340 | 8.1% | 95ms | 280ms | 890ms |
| /api/search | 1,988 | 2.1% | 210ms | 800ms | 2.4s |

- Endpoint: monospace
- Error Rate: cell has subtle background tint — green for <2%, yellow for 2-5%, red for >5%
- Latency cells: similar color coding — green <100ms, yellow 100-500ms, red >500ms
- Column headers are sortable (show sort arrow icon on the currently sorted column)
- Default sort: Requests descending

---

### Frame 6: Settings Page

**Sidebar:** "Settings" nav item active.

**Main content:**

**Section 1: Organization card**
- "Organization" heading
- Row: "Name" label → "My Startup" value
- Row: "Slug" label → "my-startup" value (monospace)
- Row: "Plan" label → "FREE" badge (Text Secondary bg) + "Upgrade →" link in Accent
- Row: "Created" label → "March 15, 2026" value

**Section 2: API Keys card**
- Header row: "API Keys" heading on left, "+ Create New Key" primary button on right
- Key cards (stacked vertically, each is a sub-card):

Key 1:
- Name: "Production Key" (14px, Text Primary, bold)
- Key preview: `tl_live_****7f2a` (monospace, Text Secondary)
- Created: "Apr 1, 2026" (12px, Text Muted)
- Last used: "2 minutes ago" (12px, Text Muted)
- Actions (right side): [Copy] ghost button with copy icon, [Revoke] ghost button in Error color

Key 2:
- Name: "Staging Key"
- Key preview: `tl_live_****a3b1`
- Created: "Apr 2, 2026"
- Last used: "3 hours ago"
- Actions: [Copy] [Revoke]

Key 3 (revoked):
- Name: "Old Key" with strikethrough
- Key preview: `tl_live_****d4e5` in Text Muted
- "Revoked" badge (Error color, low opacity bg)
- No action buttons

---

### Frame 7: Create API Key Modal

**Overlay:** Semi-transparent black overlay (`#000000` at 50% opacity) over the Settings page.

**Modal:**
- Centered, max-width 480px
- Background: Card color, border
- Header: "Create API Key" (16px, bold) + X close button on right
- Body:
  - "Key Name" label + input field (placeholder: "e.g., Production, Staging")
  - Description text: "This key will have access to send tracking events for your organization." (12px, Text Secondary)
- Footer:
  - "Cancel" secondary button on left
  - "Create Key" primary button on right

---

### Frame 8: API Key Created Success Modal

**Same overlay as Frame 7.**

**Modal:**
- Same container style
- Header: "API Key Created" with a Success-colored checkmark icon
- Body:
  - "Your new API key:" label
  - Key displayed in full: `tl_live_8a3f2b1c9d4e5f6a7b8c9d0e1f2a3b4c` in a code block (dark bg, monospace, 14px)
  - [Copy to Clipboard] button next to it (icon + text)
  - ⚠️ Warning box (Warning color border, Warning bg at 10%):
    - "Make sure to copy your API key now. You won't be able to see it again."
- Footer:
  - "Done" primary button, full width

---

### Frame 9: Empty State — Overview (New User, No Data)

**Sidebar + layout same as Overview.**

**Main content (instead of charts/data):**
- Centered content block (vertically and horizontally within main area)
- Large icon: chart/analytics line icon (48px, Text Muted)
- Heading: "No data yet" (20px, Text Primary)
- Subtext: "Send your first tracking event to see analytics here." (14px, Text Secondary)
- Code block card below:
  ```
  curl -X POST https://api.tracelite.dev/v1/track \
    -H "X-API-Key: YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"method":"GET","endpoint":"/api/users","statusCode":200,"latencyMs":42}'
  ```
  (monospace, dark code block with copy button)
- Below code block: "View setup guide →" link in Accent color

---

### Frame 10: Mobile View — Overview (375px width)

**Design the Overview page at 375px width to show mobile responsiveness:**

- No sidebar — instead, a bottom tab bar with 4 icons (Overview, Requests, Endpoints, Settings)
- Top bar: "⚡ TraceLite" on left, org selector/avatar on right
- Metric cards: 2x2 grid (smaller values, 20px instead of 28px)
- Chart: full width, shorter height
- Top Endpoints and Status Distribution: stacked vertically (full width each)

---

## Design Deliverables Summary

| Frame | Name | Size |
|---|---|---|
| 1 | Login | 1440x900 |
| 2 | Signup | 1440x900 |
| 3 | Overview Dashboard | 1440x900 |
| 4 | Requests Explorer | 1440x900 |
| 5 | Endpoints Breakdown | 1440x900 |
| 6 | Settings | 1440x900 |
| 7 | Create API Key Modal | 1440x900 (overlay) |
| 8 | Key Created Success Modal | 1440x900 (overlay) |
| 9 | Empty State — Overview | 1440x900 |
| 10 | Mobile — Overview | 375x812 |

---

## Final Notes for the Design Agent

- **Consistency is critical** — every page must use the same sidebar, spacing, colors, and typography
- **Data should look realistic** — use the sample data provided, not lorem ipsum
- **Charts should look polished** — smooth lines, subtle gradients, proper axis labels
- **Pay attention to status color coding** — this is an analytics tool, colors convey meaning
- **Empty states matter** — Frame 9 shows what a new user sees, make it welcoming and actionable
- **Monospace font for all technical data** — API keys, endpoints, request IDs, code snippets
- **No decorative illustrations** — this is a dev tool, keep it utilitarian and data-focused
