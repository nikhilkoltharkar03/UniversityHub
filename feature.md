# 🚀 University Hub — Product & Engineering Roadmap

> **Target:** Transform *University Hub* from a standard college repository into an industry-grade, production-ready platform that stands out in top-tier on-campus & off-campus hiring.

---

## 🏗️ Architectural Overview & Product Pillars

```
+-----------------------------------------------------------------------------------+
|                                UNIVERSITY HUB 2.0                                 |
+-----------------------------------------------------------------------------------+
        │
        ├── 1. On-Demand Live Sandbox ("Run & Stop" Session Runner)  [⚠️ PENDING / UI MOCK ONLY]
        │       ├── Ephemeral container / WebContainer in-browser runner
        │       ├── Real project code execution from uploaded ZIP
        │       ├── Live preview iframe + real terminal stream
        │       └── Auto-cleanup / TTL Heartbeat (5 min inactivity timeout)
        │
        ├── 2. Interactive Document & Code Copilot (RAG Pipeline)  [✅ COMPLETED]
        │       ├── Vector chunking & page-level citation tracking ([Page X ↗])
        │       ├── Live SSE Token Streaming with TTFT metrics (<900ms)
        │       └── Dynamic Mermaid.js System Architecture diagrams (AST-validated)
        │
        ├── 3. Code Authenticity & AST Plagiarism Detection  [🔥 IN QUEUE]
        │       ├── Token-level AST structural comparison (MOSS-like algorithm)
        │       ├── Variable-renaming & formatting-invariant detection
        │       └── Visual plagiarism heatmaps & side-by-side diff in Admin panel
        │
        ├── 4. Asynchronous High-Throughput Processing Pipeline
        │       ├── Redis + BullMQ background job worker
        │       ├── Decoupled media ingestion (PDF/Video/ZIP)
        │       └── Real-time WebSocket / SSE upload progress (0% -> 100%)
        │
        ├── 5. Academic Collaboration & Project Lineage
        │       ├── Interactive Project Forking & Tree Visualization
        │       └── Attribution tracking ensuring original creators retain credit
        │
        ├── 6. Multimodal Video Intelligence & Automated Demo Timestamps  [⭐ NEW]
        │       ├── Gemini Flash video processing via @google/genai
        │       ├── Automated timestamped chapter segmentation ([01:20] Live Demo)
        │       └── Interactive chapter-seek overlay on video player
        │
        └── 7. In-Browser Code Repository Inspector & Dependency Graph  [⭐ NEW]
                ├── In-memory ZIP archive exploration without downloading
                ├── Virtualized file tree & syntax-highlighted code viewer
                └── Automated package dependency graph visualization
```

---

## 🎯 Detailed Feature Specifications

### 🌟 Feature 1: On-Demand Live Sandbox Runner ("Run / Stop" System) [⚠️ PENDING - UI MOCK ONLY]
* **Problem Solved:** Recruiters & evaluators will never download a 50MB `.zip`, configure dependencies, and run code locally.
* **Current Status:** The frontend currently only has a simulated static UI tab with hardcoded log strings (`npm test`, `status`). **No actual execution backend, container lifecycle, or in-browser runner exists yet.**
* **Actual Required Implementation:**
  * **Backend / Runtime Engine:** An actual runner service (`sandboxService.js`) to unpack the uploaded project `.zip` from Cloudflare R2 into an ephemeral execution environment (Docker container or WebContainer/sandboxed worker) on an assigned port with a 5-minute inactivity watchdog.
  * **Frontend:** Replace the simulated mock terminal with a real WebSocket terminal stream and an active live preview `<iframe>` rendering the running web app.
  * **Resume Impact:** Demonstrates understanding of container lifecycles, sandbox security, ephemeral environments, and resource management.

---

### 🌟 Feature 2: Interactive RAG Project & Code Copilot [✅ COMPLETED]
* **Problem Solved:** Static text summaries are generic and easy to fake.
* **Solution:** An interactive AI assistant directly attached to every project card.
* **Technical Implementation:**
  * Chunk uploaded PDF documentation into vector embeddings using `@google/genai` and `pdfjs-dist/build/pdf.js`.
  * Page-level citation tracking (`[Page 12 ↗]`) with one-click deep-linking directly into multi-page PDF viewers.
  * Live Server-Sent Events (SSE) streaming with time-to-first-token (TTFT) metrics (~600-800ms) powered by `gemini-3.5-flash-lite`.
  * Automated **Mermaid.js System Architecture Diagram** generation with AST validation, strict entity coverage (>85%), and fallback repair.
  * **Benchmark Results:** Tested across 24 empirical test cases; achieved **100% Groundedness**, **0% Hallucination Rate**, and **100% Out-of-Scope Negative Rejection**.
  * **Resume Impact:** Demonstrates modern GenAI production engineering (RAG, chunking strategies, prompt engineering, vector search, streaming SSE).

---

### 🌟 Feature 3: AST-Based Code Authenticity & Structural Plagiarism [🔥 NEXT UP]
* **Problem Solved:** Cosine similarity on abstracts only catches copy-pasted text, not stolen code with renamed variables, altered comments, or shuffled function order.
* **Solution:** Deep structural code plagiarism analysis for the Admin panel.
* **Technical Implementation:**
  * Unzip student submissions and parse code into **Abstract Syntax Trees (AST)** using Babel/Espree (JavaScript) and Tree-sitter (Python/Java).
  * Generate normalized token streams (variable-name and comment-agnostic) using the Winnowing fingerprinting algorithm (similar to Stanford MOSS).
  * Compute structural similarity matrices across all historical submissions in the repository.
  * Visual diff viewer in `/admin` highlighting exact plagiarized blocks side-by-side with similarity percentages.
  * **Resume Impact:** Demonstrates compiler/AST fundamentals, data structures, and advanced backend algorithms.

---

### 🌟 Feature 4: Asynchronous Background Ingestion (Redis + BullMQ)
* **Problem Solved:** Uploading heavy PDFs, videos, and source ZIPs synchronously freezes the Express HTTP thread and causes timeouts on large submissions.
* **Solution:** Decoupled background task queue with optimistic response.
* **Technical Implementation:**
  * User submits form ➡️ Instant `202 Accepted` response with a unique `jobId`.
  * BullMQ worker process handles Cloudflare R2 uploads, Gemini embeddings, text chunking, and auto-tagging in parallel background queues.
  * Real-time progress updates sent to frontend via WebSockets or Server-Sent Events (SSE) showing granular progress (`Uploading 45%` ➡️ `Generating Embeddings 75%` ➡️ `Complete 100%`).
  * **Resume Impact:** Core system design topic for backend engineering interviews (Swiggy, Uber, Amazon style async pipelines).

---

### 🌟 Feature 5: Academic Lineage & Forking Graph
* **Problem Solved:** Academic projects currently sit as dead archives once semester ends, leading to duplicated effort every year.
* **Solution:** "GitHub for University Capstones" — junior students can officially fork an approved project and extend it.
* **Technical Implementation:**
  * Interactive tree visualization of project versions (`v1.0 Basic Web` ➡️ `v2.0 IoT Extension`).
  * Attribution tracking ensuring original creators retain permanent credit and citation counters.
  * Semantic project diffing highlighting what new features the forked project introduced.
  * **Resume Impact:** Shows strong Product Sense, user retention mechanics, and graph data structures.

---

### 🌟 Feature 6: Multimodal Video Intelligence & Automated Demo Timestamps [⭐ NEW]
* **Problem Solved:** Evaluators, recruiters, and students rarely watch a full 10-15 minute screen recording. They scrub randomly and miss core architectural proofs and live demos.
* **Solution:** Native Gemini multimodal video analysis via `@google/genai` to automatically watch student demo videos and extract interactive timestamped chapters.
* **Technical Implementation:**
  * Stream video from Cloudflare R2 into Gemini 3.5 Flash multimodal endpoint.
  * Automatically generate structured video metadata:
    * **Timestamped Chapters:** e.g., `[00:15] Problem Statement`, `[02:30] Live Auth Flow`, `[05:45] API Telemetry`, `[09:10] Database Benchmark`.
    * **Live Feature Highlights:** Bulleted timeline of core moments demonstrated on screen.
  * Interactive video player UI in `ProjectDetail.jsx` with clickable chapter markers that jump directly to that timestamp in the video player.
* **Resume Impact:** Demonstrates cutting-edge Multimodal AI engineering (video understanding, temporal media chunking, and rich interactive media controls).

---

### 🌟 Feature 7: In-Browser Code Repository Inspector & Dependency Graph [⭐ NEW]
* **Problem Solved:** Uploaded source code ZIPs are currently download-only black boxes. Reviewers cannot inspect code structure, routes, or component hierarchy without downloading and extracting locally.
* **Solution:** A GitHub-style in-browser file tree explorer with automated dependency graph visualization.
* **Technical Implementation:**
  * In-memory ZIP archive streaming from Cloudflare R2 (using `unzipper` / `jszip`) without writing full uncompressed archives to disk.
  * Virtualized file directory tree with file-type icons and syntax-highlighted read-only code viewer.
  * Automated package dependency analyzer that parses `package.json` / `requirements.txt` / `pom.xml` to generate an interactive visual dependency graph.
* **Resume Impact:** Demonstrates complex frontend state virtualization, in-memory archive extraction, and IDE-like DevEx (Developer Experience) design.

---

## 🛠️ Step-by-Step Implementation Roadmap

| Phase | Milestone | Priority | Status | Tech Stack |
| :---: | :--- | :---: | :---: | :--- |
| **Phase 1** | **On-Demand Live Sandbox Runner** (Real execution & preview) | 🔥 High | ⚠️ **UI MOCK ONLY** | WebContainer / Docker runner, WebSocket stream |
| **Phase 2** | **Project RAG Copilot + Dynamic Architecture Diagrams** | 🔥 High | ✅ **COMPLETED** | `@google/genai`, PDF.js, SSE, Mermaid.js |
| **Phase 2.5** | **Frontend Modernization & AI SDK Upgrade** | ⚡ Medium | ✅ **COMPLETED** | Vite 8, React 19, `@google/genai` v3 |
| **Phase 3** | **AST-Based Code Authenticity & Structural Plagiarism** | 🔥 High | 📋 Backlog | Babel/Tree-sitter AST, Winnowing Fingerprints |
| **Phase 4** | **Redis + BullMQ Worker Pipeline** (Async Uploads) | ⚡ Medium | 📋 Backlog | Redis, BullMQ, WebSockets/SSE |
| **Phase 5** | **Academic Project Lineage & Forking Graph** | ⚡ Medium | 📋 Backlog | React Flow / D3.js, Graph Schemas |
| **Phase 6** | **Multimodal Video Intelligence & Timestamps** | 🌟 New | 📋 Backlog | Gemini 3.5 Flash Video, Custom Video Player |
| **Phase 7** | **In-Browser Code Repository Inspector** | 🌟 New | 📋 Backlog | In-memory ZIP stream, Virtualized Tree, Monaco |
| **Phase 8** | **Production Polish & Dockerization** | 🚀 Final | 📋 Backlog | Docker Compose, Nginx, Healthchecks |

---
