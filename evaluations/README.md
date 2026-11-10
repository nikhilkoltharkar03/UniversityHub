# UniversityHub — Engineering Evaluations & Quantitative Benchmarks

This directory stores the quantitative evaluation datasets, benchmark scorecards, live Q&A proofs, and Playwright visual verification artifacts for the AI & Systems features built into **UniversityHub**.

---

## Feature Evaluations Index

### 1. [Feature 2: Interactive RAG Project & Code Copilot + Dynamic Mermaid.js Architecture Diagrams](./feature_2_rag_copilot/benchmark_report.md)
- **Report:** [`feature_2_rag_copilot/benchmark_report.md`](./feature_2_rag_copilot/benchmark_report.md)
- **Raw Telemetry JSON (24 Live Queries across 4 Projects including `AI Based Career Counselling`):** [`feature_2_rag_copilot/benchmark_results.json`](./feature_2_rag_copilot/benchmark_results.json)
- **Live Verification Screenshots (`AI Based Career Counselling` — 34-Page PDF):**
  - [`feature_2_rag_copilot/screenshots/live_feature2_mermaid_diagram.png`](./feature_2_rag_copilot/screenshots/live_feature2_mermaid_diagram.png) — PDF-grounded 3-stage Mermaid.js system architecture flowchart (`12` components, `11` directed flows, `100%` stack coverage).
  - [`feature_2_rag_copilot/screenshots/live_feature2_streaming_copilot.png`](./feature_2_rag_copilot/screenshots/live_feature2_streaming_copilot.png) — Diverse, specific questions answered live via SSE streaming with inline `[Page 1 ↗]`, `[Page 12 ↗]`, `[Page 13 ↗]`, `[Page 17 ↗]`, `[Page 30 ↗]`, and `[Page 31 ↗]` citations.
  - [`feature_2_rag_copilot/screenshots/live_feature2_pdf_deeplink.png`](./feature_2_rag_copilot/screenshots/live_feature2_pdf_deeplink.png) — One-click deep-linking from `[Page 12 ↗]` directly into **Page 12 of 34** in the multi-page PDF Report Inspector.
- **Headline Quantitative Metrics:**
  - **Faithfulness / Groundedness Score:** `100.0%` (`+48.0%` over baseline)
  - **Answer Relevance Score:** `94.6%` (`+50.1%` over baseline)
  - **Hallucination Rate:** `0.0%` (`-38.0%` reduction)
  - **Out-of-Scope Negative Rejection Accuracy:** `100.0%`
  - **Inline Page Citation Precision:** `100.0%`
  - **Mermaid AST Syntax Validity & TechStack Coverage:** `100.0%`
  - **Avg End-to-End RAG Latency:** `1,139 ms`

---

## Reproducing the Benchmarks

```bash
cd server
node benchmark_copilot.js
```
