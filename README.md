# E-commerce Market Research & CartSafe Project

This repository encompasses a complete product lifecycle—from initial market research and opportunity identification to the technical Proof-of-Concept (POC) of a chosen solution.

The project is structured into three main phases/components:

## 1. Market Research & Problem Analysis (`/analyzer`)
This phase involved analyzing a large dataset of WhatsApp chats from Israeli e-commerce merchants to identify their most pressing pain points. 

Key documents in this phase:
- `analyzer/rice_prioritization_matrix.md`: The RICE (Reach, Impact, Confidence, Effort) matrix used to prioritize the identified pain points and choose the most viable product opportunity.
- `analyzer/cartsafe_research_prompt.md`: The research prompt utilized to investigate the "Double Discounting" problem on Shopify.
- `analyzer/cartsafe_feasibility_study.md`: Technical and commercial feasibility study confirming the viability of the CartSafe solution.
- `analyzer/israel_privacy_law_poc_research.md`: Research into a secondary opportunity (Privacy Law compliance).

*(Note: Outdated or irrelevant analysis files have been moved to `analyzer/archive` for historical reference).*

## 2. Product Development: CartSafe (`/cartsafe poc product`)
Based on the RICE matrix, the decision was made to build **CartSafe**, an app that protects Shopify Basic/Standard merchants from margin leakage caused by "Double Discounting" (stacking promotional coupons with gift cards).

This directory contains the actual product documentation and the foundation for the codebase.

Key documents in this phase:
- `cartsafe poc product/README.md`: The main entry point for developers working on the CartSafe application.
- `cartsafe poc product/docs/PRD.md`: The Product Requirements Document outlining the scope of the POC.
- `cartsafe poc product/docs/PR_FAQ.md`: Amazon-style PR/FAQ detailing the product positioning and user experience.
- `cartsafe poc product/docs/ARCHITECTURE.md`: The technical architecture and system design.
- `cartsafe poc product/docs/API_FLOWS.md`, `DATA_MODEL.md`, `SECURITY.md`, etc.: Further technical documentation.

## 3. Product Simulator (`/cartsafe poc simulator`)
A separate Next.js application simulating the e-commerce storefront checkout environment to test and demonstrate the functionality of CartSafe without needing a live, full Shopify store setup.

---

### How to Navigate
- If you are interested in the **"Why"** and **"What to build next"**, explore the `analyzer/` folder.
- If you are interested in the **"How"** and want to see the core product details and documentation, explore the `cartsafe poc product/` folder.
- If you want to run or test the checkout simulation environment, explore the `cartsafe poc simulator/` folder.
