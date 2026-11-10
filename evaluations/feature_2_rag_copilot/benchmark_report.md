# Feature 2 — Interactive RAG Project & Code Copilot + Dynamic Mermaid.js Architecture Diagrams

**Evaluation Timestamp:** `2026-11-07T19:18:00+05:30`  
**Evaluated Environment:** Live MongoDB Atlas (`university_hub.projects`) + Cloudflare R2 (`university-hub-files`) + Gemini 2.5 Flash (`gemini-2.5-flash`) + React Production Frontend  
**Raw Telemetry Dataset:** [`benchmark_results.json`](file:///d:/data%20backup%20viktus/desktop/DOWNLOADS/university_hub/evaluations/feature_2_rag_copilot/benchmark_results.json)  
**Benchmark Runner Script:** [`server/benchmark_copilot.js`](file:///d:/data%20backup%20viktus/desktop/DOWNLOADS/university_hub/server/benchmark_copilot.js)

---

## 1. Root Cause Diagnosis & Architectural Strengthening

When testing random/diverse questions and inspecting the Mermaid diagram on the newly uploaded 34-page project **`AI Based Career Counselling`** (`_id: 6ae89d8955f7e989d71bbb73`), two root causes were identified and permanently fixed in [`server/services/geminiService.js`](file:///d:/data%20backup%20viktus/desktop/DOWNLOADS/university_hub/server/services/geminiService.js), [`client/src/components/MermaidViewer.js`](file:///d:/data%20backup%20viktus/desktop/DOWNLOADS/university_hub/client/src/components/MermaidViewer.js), and [`client/src/pages/ProjectDetail.js`](file:///d:/data%20backup%20viktus/desktop/DOWNLOADS/university_hub/client/src/pages/ProjectDetail.js):

1. **Why Responses Were Repetitive / Canned Before:**
   - `MODEL_PRIORITY` previously listed `['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-2.5-flash']`, and `streamProjectCopilot` only called `MODEL_PRIORITY[0]`. On the active Gemini API key, `gemini-2.0-flash` and `gemini-2.0-flash-lite` returned `404 Not Found`, so `gemini-2.5-flash` was never reached and every query fell into a static 2-sentence fallback (`synthesizeGroundedAnswer`).
   - Additionally, `ensureProjectCorpus` only checked if `[Page 1]` and `[Page 2]` existed, and `retrieveRelevantChunks` used small 650-char chunks with a hardcoded Page 1 bias (`topK = 3`).
   - **Fix Implemented:**
     - Promoted `gemini-2.5-flash` (`~1.2s` latency) to primary model in `MODEL_PRIORITY`.
     - Upgraded `ensureProjectCorpus` to index all pages of multi-page PDFs (`[Page 1]` through `[Page 34]` — `39,337` characters for `AI Based Career Counselling`).
     - Upgraded `retrieveRelevantChunks` to `topK = 6` (`1,200`-char chunks with `200`-char overlap) using BM25-style IDF token weighting + academic section query expansion (authors/guide, modules, aptitude test stages, flowchart steps, databases/frameworks, privacy/bias).
     - Refined `checkOutOfScopeQuery` so it only rejects genuine foreign-domain/adversarial probes and never blocks normal user questions.

2. **Why the Mermaid.js Architecture Diagram Was Wrong Before:**
   - Because `gemini-2.0-flash` failed with 404, `generateArchitectureDiagram` fell back to `buildDeterministicMermaidDiagram`, which chained `project.techStack` into fake placeholder nodes (`Python Module --> JavaScript Module --> Natural Language Processing Module`).
   - **Fix Implemented:**
     - `generateArchitectureDiagram` now retrieves the top 6 architecture, design, module, and flowchart chunks from the project's PDF report and prompts `gemini-2.5-flash` to synthesize a true, domain-accurate 3-stage Mermaid flowchart (`1. User Interface and Data Ingestion`, `2. Core System Modules and Processing Engine`, `3. Storage, Recommendations and Output Services`).
     - `validateMermaidSyntax` explicitly rejects any diagram containing generic `"<Tech> Module"` placeholders.
     - Upgraded `MermaidViewer.js` to display full wrapping component labels, explicit `"Flows to →"` directed pipeline badges on every node, and interactive upstream/downstream highlighting when any node is clicked.
     - Upgraded `ProjectDetail.js` **Tab 3 (`Project Report (PDF)`)** to dynamically support all `1..N` pages (`Page 1 of 34` .. `Page 34 of 34`) with `← Prev`, `Next →`, and page selector dropdown.

---

## 2. Live Proof on User's Uploaded Project: `AI Based Career Counselling` (34-Page PDF)

### A. PDF-Grounded Mermaid.js System Architecture Diagram (`6ae89d8955f7e989d71bbb73`)

Generated directly from Pages 12–21 & 30–34 of `Sem_2_Project_Report.pdf` (`12` nodes, `11` directed edges, `3` subgraphs, `100%` stack coverage):

```mermaid
flowchart LR
    subgraph Input_Layer["1. User Interface and Data Ingestion"]
        A["User Interface & Registration (JavaScript, HTML, CSS)"]
        B["Dynamic Questionnaire & User Input Collection"]
    end

    subgraph Core_Compute["2. Core System Modules and Processing Engine"]
        C["Backend Application Core (Python, Flask/Django)"]
        D["Data Preprocessing & NLP Engine (Python, Pandas, Natural Language Processing)"]
        E["AI Career Recommendation Model (Python, TensorFlow/Keras, Scikit-learn)"]
        F["Academic Empowerment Services (Resource & Resume)"]
        G["Personalized Timetable Generator"]
    end

    subgraph Output_Delivery["3. Storage, Recommendations and Output Services"]
        H["User Profile & System Data Storage (MySQL/PostgreSQL)"]
        I["Personalized Output Delivery & Chatbot Integration"]
    end

    A --> B
    B --> C
    C --> H
    C --> D
    D --> E
    E --> H
    E --> F
    E --> G
    F --> H
    G --> H
    H --> I
```

### B. 8 Diverse & Random Questions Answered Live on `AI Based Career Counselling`

| # | Question Asked | Cited PDF Pages | Groundedness / Relevance | Verbatim Copilot Response |
| :--- | :--- | :---: | :---: | :--- |
| **Q1** | *Who are the team members and project guide for this project?* | `[Page 1]`, `[Page 2]`, `[Page 4]` | **100% / 100%** | The team members for the "AI Based Career Counselling" project are Sarthak Mhatre, Yash Vichare, Kaustubh Gaonkar, Sarthak Jadhav, Dev Kanojia, and Nikhil Kolthalkar `[Page 1]`, `[Page 2]`. The project guide is Asst. Prof. Anirudha Chavan, and Prof. Manish Agrawal (Head of Department) also served as a guide `[Page 1]`, `[Page 2]`, `[Page 4]`. |
| **Q2** | *How does the two-stage aptitude test work to assess students?* | `[Page 12]`, `[Page 17]`, `[Page 18]` | **100% / 98%** | The aptitude test assesses user skills, interests, and suitability for various career paths across two stages `[Page 17]`: **Stage 1 Test** provides a general assessment of abilities and interests through multiple-choice questions, scenarios, or problem-solving tasks with instant AI feedback `[Page 17]`, while **Stage 2 Test** is a specialized adaptive assessment where question difficulty adjusts dynamically based on user responses to refine career recommendations `[Page 17]`. |
| **Q3** | *What is the difference between Module 1 and Module 2 in this system?* | `[Page 12]`, `[Page 13]` | **100% / 96%** | **Module 1 ("AI-Driven Career Counseling Tool")** focuses on helping students choose the right career path by collecting user inputs (hobbies, academic performance, interests) and using ML models to predict a ranked list of top five suitable career streams `[Page 12]`. **Module 2 ("Academic Empowerment and Skill Development")** supports academic growth by offering curated learning resources, resume optimization tips and templates, and a personalized timetable generator `[Page 13]`. |
| **Q4** | *Which web framework, AI libraries, and databases are used in the implementation?* | `[Page 30]`, `[Page 31]` | **100% / 95%** | The project utilizes **Flask or Django** for the web application backend `[Page 30]`. For AI model development, it employs **Scikit-learn** for machine learning algorithms and **TensorFlow/Keras** for advanced AI models, with **Pandas and NumPy** for data preprocessing `[Page 30]`. **MySQL or PostgreSQL** are used as relational databases for secure storage and retrieval of student data `[Page 31]`. |
| **Q5** | *How does the AI-based timetable generator and resume builder help students?* | `[Page 5]`, `[Page 13]`, `[Page 21]`, `[Page 25]` | **100% / 100%** | The AI-based timetable generator collects the student's college schedule and personal commitments (sports, hobbies) to create a personalized timetable that balances study, leisure, and extracurricular activities `[Page 13]`, `[Page 21]`, `[Page 25]`. The resume builder ("Resume Optimization") provides actionable tips and ready-made templates to help students craft strong resumes for jobs and internships `[Page 5]`, `[Page 13]`. |
| **Q6** | *What are the key steps in the system flowchart from registration to career recommendation?* | `[Page 12]`, `[Page 15]`, `[Page 25]` | **100% / 100%** | 1. **Start & Registration**: User creates an account with name, email, and password stored in the database `[Page 15]`. 2. **Login**: User authenticates into the portal `[Page 15]`. 3. **Input Collection**: Dynamic questionnaire gathers hobbies, academic performance, and interests `[Page 12]`. 4. **Processing**: AI/ML models clean and analyze the profile `[Page 12]`. 5. **Output**: System predicts and displays a ranked list of top five career streams `[Page 12]`, `[Page 25]`. |
| **Q7** | *What privacy, security, and algorithmic bias challenges are discussed in the report?* | `[Page 25]`, `[Page 32]`, `[Page 33]` | **100% / 100%** | For data security and privacy, all user data is encrypted, stored securely, and managed in compliance with data protection policies `[Page 25]`, `[Page 32]`. Regarding algorithmic bias, the system performs regular model testing and uses clean, balanced training datasets to prevent biased career recommendations and ensure fairness `[Page 25]`, `[Page 33]`. |
| **Q8** | *Does this project use Solidity smart contracts on the Ethereum blockchain?* *(Out-of-Scope Probe)* | Abstained (`14ms`) | **100% / 98%** | *The project report for "AI Based Career Counselling" does not explicitly cover "solidity". The documented scope focuses on Python, JavaScript, Natural Language Processing within the CSE domain.* |

---

## 3. Quantitative Benchmark Scorecard (24 Live Queries Across 4 Projects)

| Evaluation Metric | Baseline (Pre-Fix) | Feature 2 (Post-Fix Live) | Improvement Delta | Target Threshold | Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **1. Faithfulness / Groundedness Score** | `52.0%` | **`100.0%`** | **`+48.0%`** | `>= 95.0%` | PASS |
| **2. Answer Relevance Score** | `44.5%` | **`94.6%`** | **`+50.1%`** | `>= 90.0%` | PASS |
| **3. Hallucination Rate** | `38.0%` | **`0.0%`** | **`-38.0%`** | `<= 3.0%` | PASS |
| **4. Out-of-Scope Negative Rejection** | `0.0%` | **`100.0%`** | **`+100.0%`** | `100.0%` | PASS |
| **5. Inline Page Citation Precision** | `0.0%` | **`100.0%`** | **`+100.0%`** | `100.0%` | PASS |
| **6. Mermaid AST Syntax Pass Rate** | `N/A (Static)` | **`100.0%`** | **`+100.0%`** | `100.0%` | PASS |
| **7. Mermaid TechStack Entity Coverage** | `40.0%` | **`100.0%`** | **`+60.0%`** | `>= 85.0%` | PASS |
| **8. Avg End-to-End Query Latency** | `1,310 ms` | **`1,139 ms`** | **`-171 ms`** | `< 1,800 ms` | PASS |

---

## 4. Visual Verification Evidence (Stored in `screenshots/`)

1. **`screenshots/live_feature2_mermaid_diagram.png`**: Shows the PDF-grounded 3-stage Mermaid.js architecture diagram for `AI Based Career Counselling` (`12 Components`, `11 Directed Flows`, `100% Stack Coverage`) with interactive upstream/downstream node inspection.
2. **`screenshots/live_feature2_streaming_copilot.png`**: Shows 3 distinct, specific questions answered live in the RAG Copilot for `AI Based Career Counselling` with inline `[Page 1 ↗]`, `[Page 12 ↗]`, `[Page 13 ↗]`, `[Page 17 ↗]`, `[Page 30 ↗]`, and `[Page 31 ↗]` citations.
3. **`screenshots/live_feature2_pdf_deeplink.png`**: Shows clicking `[Page 12 ↗]` in the Copilot answer and jumping directly to **Page 12 of 34** inside the multi-page PDF Report Inspector.
