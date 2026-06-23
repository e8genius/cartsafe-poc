# CartSafe — Analysis Deck (3 slides)

> PayMe Product Home Assignment. Built from the WhatsApp e-commerce chat data, a RICE
> prioritization pass, and a technical feasibility study. All numbers below come from
> that research or from public competitor pricing. Nothing here is invented.

---

## Slide 1 — The problem we chose, and why it's worth money

**Title:** Small Shopify stores quietly lose margin to stacked discounts

**The problem (plain version):**
A shopper buys a gift card using a 10% coupon. Later they spend that gift card and
add *another* coupon on top. The store ends up giving two discounts on one sale. The
same thing happens when a coupon lands on an item that's already marked down. The
owner rarely notices, because each order looks normal on its own.

**Why this one, out of everything in the chat:**
- We read ~330 distinct pain points from the group. **42% were "high severity":**
  real money lost, operations blocked, or legal risk.
- We scored the top groups with a RICE matrix. **"E-commerce ops & workarounds"
  ranked #1 (14.4)**, well ahead of the next group.
- It wins on the thing that matters for a fast POC: **zero outside dependencies.**
  No need for API deals with couriers, banks, or ERPs. We can ship in ~3–4 weeks.
- It hits margin directly. Every stacked order is cash that left the building.

**Why nobody has solved it for this audience yet (the market gap):**
- **PromoLock** blocks stacking properly, but it's built for Shopify Plus and costs
  **$300–$600/month.** Out of reach for a small store.
- Cheap apps ($4–$50/month) take a shortcut called "draft orders." That shortcut
  **breaks Apple Pay / Google Pay express checkout** and messes up sales tracking.
- The cheap validation apps literally **can't see gift cards** at checkout, so they
  can't catch the exact problem we're solving.

> So there's an open lane: a low-cost app, built on Shopify's native tools, that works
> on the Basic plan. That lane is CartSafe.

---

## Slide 2 — Who it's for, and what we promise them

**Title:** For the owner who runs the whole store alone

**Target users:**
- Small Shopify merchants on the **Basic or Standard plan** (not Plus).
- People who **run the store themselves** — marketing, support, packing, all of it.
- Israeli e-commerce owners like the ones in this WhatsApp group. They run real
  promotions and gift-card campaigns, so they're exposed to this leak every sale.

**What they feel today:**
- "I keep running coupons and gift cards because they drive sales, but I can't tell
  how much margin I'm handing back by accident."
- "The tool that fixes this costs more than my whole Shopify bill."
- "The cheap one broke my express checkout, so I uninstalled it."

**Core value proposition (one sentence):**
> CartSafe stops customers from stacking a coupon on top of a gift card, on a plain
> Shopify Basic plan, without breaking express checkout and without Plus-level prices.

**Why merchants pick us over the alternatives:**
- **Affordable, not enterprise.** Priced for a Basic-plan store, not for Plus.
- **Doesn't break the checkout.** We stay on Shopify's native rails, so Apple Pay,
  Google Pay, and your analytics keep working.
- **The merchant stays in control.** See below.

**What actually happens when a stacked order gets through:**

Payment goes through first. Shopify's checkout is fast and locked down — intercepting
a live transaction requires Shopify Plus. CartSafe doesn't try to block the payment.
Instead, it reacts the moment the order is created.

As soon as our webhook fires, CartSafe places a **fulfillment hold** on the order.
That means: money is with the merchant, product is in the warehouse, and nothing ships.
The order sits flagged in the admin panel until a human looks at it.

The merchant then picks one of three paths:
1. **Refund the customer** and cancel the order.
2. **Contact the customer** — explain the policy, offer to send if they pay the
   difference, or offer a partial refund.
3. **Let it through** — for a loyal customer, the merchant can lift the hold manually
   and ship anyway.

This matters commercially: the merchant never loses money without a conscious choice.
No surprise cancellation fees, no automated refund going out at 2am.

---

## Slide 3 — How we measure success

**Title:** One number that matters, four that explain it

---

**North Star: ₪ protected per active store per month**
The margin CartSafe saved a merchant from leaking. This is the number they quote
when deciding whether to keep paying for the app.

---

**Secondary metrics**

| Metric | What it tells us |
|---|---|
| Catch rate | Are we actually detecting every stacked order? Target: 100% |
| False hold rate | Are we freezing legitimate orders by mistake? Target: ~0% |
| Express checkout conversion | Did our install break Apple Pay / Google Pay? This is how cheap competitors fail — we watch it per store on day one |
| Hold resolution rate | Are merchants reviewing flagged orders within 48h? If not, they've checked out — and churn follows |

---

**Business health (two numbers)**
- Install → paid conversion — did the trial prove value?
- Monthly churn — are they staying, or did the promotions stop?

---

> POC pass/fail: catch rate 100%, false holds 0%, express checkout unchanged.

---

## Slide 4 — Links and resources

**Title:** Where to find the work

**GitHub repositories (public)**
- Product App & Analysis: https://github.com/e8genius/cartsafe-poc
- Storefront Simulator: https://github.com/e8genius/cartsafe-simulator

**What's in this repo:**
- `/analyzer` — Python pipeline that parsed the WhatsApp chat, scored pain points, and produced the RICE matrix
- `/cartsafe poc product` — Shopify App (Remix + Node.js + Prisma), with full PRD, architecture docs, and API flows

**How to run the simulator locally (from its separate repo):**
```bash
git clone https://github.com/e8genius/cartsafe-simulator.git
cd cartsafe-simulator
npm install
npm run dev
# opens at http://localhost:3000
```

**Source data**
- WhatsApp chat export used for the analysis (provided by PayMe):
  https://drive.google.com/file/d/1vlAn8pbx4Ee5xbtmYNnmD0CQ1C5qF6Hz/view

**Key docs inside the repo:**
- Research & prioritization: [`analyzer/rice_prioritization_matrix.md`](analyzer/rice_prioritization_matrix.md)
- Feasibility study (Shopify API limits, competitor audit): [`analyzer/cartsafe_feasibility_study.md`](analyzer/cartsafe_feasibility_study.md)
- Product Requirements Document: [`cartsafe poc product/docs/PRD.md`](cartsafe%20poc%20product/docs/PRD.md)
- Architecture & data model: [`cartsafe poc product/docs/ARCHITECTURE.md`](cartsafe%20poc%20product/docs/ARCHITECTURE.md)
