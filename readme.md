# Cloud-Deployed Self-Refining Agentic AI

> An autonomous multi-agent AI system that accepts high-level abstract goals, decomposes them into structured sub-tasks, executes them, critiques its own output, and refines results iteratively — without human supervision.

**Mini Project 2 · B.Tech CSE-AIML & IoT (III Year – VI Sem) · 2025–2026**  
**Department of Computer Science & Engineering and Applications**  
**GLA University, Mathura**  
**Mentor: Dr. Sachin Kumar Yadav**

---

## Team T-78

| Member | Name | Roll No. | Role | Responsibilities |
|---|---|---|---|---|
| 1 | Ishu Agrawal | 2315510088 | Team Leader | System design, agent logic, integration, documentation |
| 2 | Aryan Pratap | 2315510041 | Backend Developer | APIs, memory storage, cloud deployment |
| 3 | Priyanshu Nayak | 2315510154 | Frontend Developer | UI dashboard, visualization, user interaction |

---

## Table of Contents

- [What This Project Does](#what-this-project-does)
- [Why We Built This](#why-we-built-this)
- [How It Works — The Agent Pipeline](#how-it-works--the-agent-pipeline)
- [Agent Roles Explained](#agent-roles-explained)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Frontend Pages](#frontend-pages)
- [Data Design](#data-design)
- [Security](#security)
- [Testing Strategy](#testing-strategy)
- [Risks and Mitigations](#risks-and-mitigations)
- [Scope and Limitations](#scope-and-limitations)

---

## What This Project Does

Most AI systems today are **reactive** — they wait for a user to ask something, respond once, and forget everything. They cannot plan ahead, judge the quality of their own answers, or improve across sessions.

This project builds something different: a **self-refining agentic AI** that can:

1. Accept a high-level abstract goal from the user (e.g., *"Write a research summary on climate change"*)
2. Automatically **break it into ordered sub-tasks** using a Planner agent
3. **Execute** those sub-tasks one by one using an Executor agent
4. **Score and critique** its own output using a Critic agent
5. **Re-run and improve** if the quality score is below threshold
6. **Remember** what it learned across sessions using a Memory agent

The system is visualized through a **drag-and-drop workflow builder** on the frontend, so users can see exactly which agent is running, what it produced, and whether it passed the quality check.

---

## Why We Built This

### The Problem

Current LLM-based tools like chatbots or prompt-based assistants have these core limitations:

- They **cannot plan** — they respond to one prompt at a time
- They **cannot evaluate themselves** — there is no built-in quality check
- They **forget everything** — no memory across sessions
- They **need constant human guidance** — every refinement requires a new prompt

This restricts their use in complex real-world tasks: research synthesis, strategic planning, software architecture design, and analytical reporting.

### Our Solution

A **Planner → Executor → Critic → Memory** pipeline where each agent has a strict role boundary and the system loops and improves on its own until the output meets a quality threshold — just like a professional reviewing and revising their own work before submitting.

### Who Benefits

| User Type | How They Use It |
|---|---|
| Students | Submit assignment topics, get structured breakdowns and refined drafts |
| Researchers | Automate literature synthesis and structured analysis |
| Developers | Use as a reasoning backend for complex multi-step automation |
| Analysts | Generate refined reports from abstract problem statements |

---

## How It Works — The Agent Pipeline

```
            User submits abstract goal
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│                 PLANNER AGENT                   │
│                                                 │
│  Reads the goal. Produces a structured plan:    │
│  - One primary objective                        │
│  - Up to 10 ordered action steps (≤20 words ea) │
│  - Dependencies between steps                   │
│  - Flags missing inputs as [MISSING]            │
│  - Lists risks and success criteria             │
│                                                 │
│  Does NOT execute or answer the task.           │
└───────────────────┬─────────────────────────────┘
                    │ structured plan
                    ▼
┌─────────────────────────────────────────────────┐
│                EXECUTOR AGENT                   │
│                                                 │
│  Receives the plan. Executes step by step:      │
│  - Follows exact order                          │
│  - Tags [BLOCKED: reason] if input is missing   │
│  - Tags [FAILED: reason] if a step errors       │
│  - Produces a final consolidated output         │
│                                                 │
│  Does NOT re-plan or modify the goal.           │
└───────────────────┬─────────────────────────────┘
                    │ execution result
                    ▼
┌─────────────────────────────────────────────────┐
│                 CRITIC AGENT                    │
│                                                 │
│  Evaluates the output on 5 dimensions:          │
│  1. Goal Alignment                              │
│  2. Completeness                                │
│  3. Factual Accuracy                            │
│  4. Logical Consistency                         │
│  5. Output Clarity                              │
│                                                 │
│  Returns a JSON score (0–100):                  │
│  ≥ 90  → Pass. Send to Memory.                  │
│  70–89 → Minor issues. Refine.                  │
│  50–69 → Significant issues. Re-execute.        │
│  < 50  → Major rework needed. Re-execute.       │
└───────┬───────────────────────┬─────────────────┘
        │ score ≥ 90            │ score < 90
        ▼                       ▼
┌──────────────────┐   Back to Executor
│   MEMORY AGENT   │   (with refinementFocus
│                  │    from Critic)
│  Extracts what   │
│  is worth saving │
│  for future runs │
│  (goals, prefs,  │
│  project context)│
│                  │
│  Returns:        │
│  Keep / Update   │
│  / Remove        │
└──────────────────┘
        │
        ▼
 Refined Output delivered to user
```

---

## Agent Roles Explained

### Planner Agent
**Job:** Convert a user's abstract goal into a precise, ordered execution plan.

- Produces exactly **one primary objective** — never a list of goals
- Every step starts with an action verb: *Fetch, Validate, Parse, Compute, Store, Send*
- Maximum 10 steps, each ≤ 20 words
- Flags impossible or circular tasks with a hard stop message
- Never executes, never answers — only plans

**Output format:**
```
# Plan
## Goal            → one sentence, ≤15 words
## Assumptions     → explicit assumptions made
## Steps           → numbered, verb-first, dependency-ordered
## Dependencies    → which step depends on which
## Required Inputs → what data is needed; [MISSING] if absent
## Risks & Blockers → known failure points
## Success Criteria → one measurable outcome
```

---

### Executor Agent
**Job:** Run the plan step by step and produce a consolidated final output.

- Executes in **exact plan order**, no skipping
- If a step cannot run → tags it `[BLOCKED: reason]`, continues with the rest
- If a step errors → tags it `[FAILED: reason]`, continues with the rest
- Matches output format to task type: code → fenced block, data → JSON/table, writing → prose
- Never invents data or credentials not provided in the plan

**Output format:**
```
# Execution Result
## Task             → goal restated exactly
## Step Log         → status of every step
## Final Output     → clean, consolidated result only
## Execution Summary → Completed / Blocked / Failed counts
## Assumptions      → anything assumed during execution
```

---

### Critic Agent
**Job:** Objectively score the execution output and decide if refinement is needed.

Scoring starts at **100** and deductions are applied:

| Issue Found | Deduction |
|---|---|
| Each BLOCKED step | −8 |
| Each FAILED step | −12 |
| Goal not addressed | −25 (floor: score ≤ 49) |
| Hallucinated data detected | −20 (floor: score ≤ 49) |
| Logical contradiction | −15 |
| Output unusable or unclear | −10 |

| Score Range | Verdict |
|---|---|
| 90 – 100 | Satisfactory. No refinement needed. |
| 70 – 89 | Satisfactory. Minor refinement recommended. |
| 50 – 69 | Not satisfactory. Significant refinement required. |
| 0 – 49 | Not satisfactory. Major rework required. |

Returns structured JSON — not prose — so the system can programmatically decide whether to loop back.

---

### Memory Agent
**Job:** Extract what is worth remembering from the session for future use.

**Stores:**
- User preferences and long-term goals
- Technical stack choices made by the user
- Project context and named entities
- Recurring constraints

**Never stores:**
- Temporary or one-time requests
- Sensitive personal data
- Draft content or random examples

**Output format:**
```
# Memory Update
## Keep   → atomic items to add
## Update → old → new replacements
## Remove → outdated or conflicting entries
```

If nothing is worth saving, returns exactly: `"No memory update."`

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **LLM Provider** | Groq API (`llama-3.3-70b-versatile`) | Powers all four agents |
| **Backend Runtime** | Node.js 20+, TypeScript 5.9 | Agent logic and API server |
| **Backend Framework** | Express 5 | REST API routing |
| **Frontend Framework** | React 18, React Router 6 | SPA with 5 pages |
| **Workflow Canvas** | React Flow 11 | Drag-and-drop pipeline builder |
| **State Management** | Zustand 4 | Global workflow and log state |
| **Data Fetching** | TanStack React Query 5, Axios | API communication |
| **Styling** | Tailwind CSS 3 | Dark-themed responsive UI |
| **Charts** | Recharts | Dashboard metrics |
| **Icons** | Lucide React | UI icons |

---

## Project Structure

```
Self-Refining-Agentic-AI/
│
├── backend/                            # Node.js + TypeScript server
│   ├── src/
│   │   └── agent/
│   │       ├── base.agent.ts           # Groq client: chatText() and chatJSON<T>()
│   │       ├── planner.agent.ts        # Goal → structured execution plan
│   │       ├── executor.agent.ts       # Plan → step-by-step execution output
│   │       ├── critic.agent.ts         # Output → JSON quality score (0–100)
│   │       └── memory.agent.ts         # Conversation → persistent memory entries
│   ├── app.ts                          # Express server entry (port 5000)
│   ├── package.json
│   └── tsconfig.json
│
└── Frontend/                           # React 18 SPA
    ├── src/
    │   ├── App.js                      # Router — 5 page routes
    │   ├── store/
    │   │   └── workflowStore.js        # Zustand global store
    │   │                               # Holds: nodes, edges, logs, execution state
    │   ├── components/
    │   │   ├── WorkflowCanvas/
    │   │   │   ├── WorkflowCanvas.js   # React Flow canvas — drag, drop, connect
    │   │   │   └── CustomNode.js       # Colour-coded agent node component
    │   │   ├── NodePalette/            # Left sidebar — draggable node types
    │   │   ├── ExecutionLog/           # Real-time log panel per node
    │   │   ├── Header/                 # Top navigation
    │   │   ├── Sidebar/                # Left navigation links
    │   │   └── Layout/                 # Page shell wrapper
    │   └── pages/
    │       ├── WorkflowBuilder/        # Main canvas page (default route "/")
    │       ├── Dashboard/              # Execution metrics and overview
    │       ├── MemoryViewer/           # Browse persisted memory entries
    │       ├── ExecutionHistory/       # Log of past workflow runs
    │       └── Settings/              # API key and config settings
    ├── public/index.html
    ├── package.json
    ├── tailwind.config.js
    └── postcss.config.js
```

---

## Getting Started

### Prerequisites

- Node.js 20 or higher
- A free Groq API key → [console.groq.com](https://console.groq.com)

### 1. Clone the repository

```bash
git clone <repository-url>
cd Self-Refining-Agentic-AI
```

### 2. Backend setup

```bash
cd backend
npm install

# Create your environment file
cp .env.example .env
# Open .env and add your GROQ_API_KEY

# Start the development server
npx ts-node-dev app.ts
# Server runs on http://localhost:5000
```

### 3. Frontend setup

```bash
cd Frontend
npm install
npm start
# App runs on http://localhost:3000
```

Open `http://localhost:3000` in your browser. You will see the Workflow Builder canvas where you can drag agents, connect them, and run the pipeline.

---

## Environment Variables

Create a `.env` file inside the `backend/` folder:

```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile    # optional — this is the default
```

---

## API Reference

### Base URL
```
http://localhost:5000
```

| Endpoint | Method | Purpose |
|---|---|---|
| `/` | GET | Health check — returns `"Server is running"` |
| `/agent/goal` | POST | Submit a high-level goal to the pipeline |
| `/agent/status` | GET | Get current execution status |
| `/agent/memory` | GET | Retrieve persisted memory entries |

> These endpoints are currently under development and subject to refinement during implementation.

---

## Frontend Pages

| Route | Page | What It Does |
|---|---|---|
| `/` | Workflow Builder | Drag-and-drop canvas to build and run agent pipelines |
| `/dashboard` | Dashboard | Execution metrics, success rates, performance overview |
| `/memory` | Memory Viewer | Browse and inspect what the Memory agent has stored |
| `/history` | Execution History | View logs from past workflow runs |
| `/settings` | Settings | Configure API keys and system preferences |

### Workflow Node Types

Each node on the canvas represents one agent, colour-coded for quick identification:

| Node | Colour | Agent It Represents |
|---|---|---|
| Input | Blue `#3b82f6` | User goal entry point |
| Planner | Amber `#f59e0b` | Task decomposition |
| Executor | Green `#10b981` | Step-by-step execution |
| Critic | Red `#ef4444` | Quality evaluation and scoring |
| Memory | Purple `#8b5cf6` | Context persistence |
| Output | Gray | Final refined result |

---

## Data Design

The system stores the following types of data persistently:

| Data Type | Purpose |
|---|---|
| Goals | The original user input for each session |
| Sub-task plans | The structured plan generated by the Planner |
| Execution results | Output produced by the Executor per run |
| Critique logs | Scores and feedback from the Critic |
| Refinement history | Track record of improvement cycles |

### Privacy
- No personal user data is collected or stored
- All persistent data is encrypted
- Access is controlled — no open data exposure

---

## Security

- REST APIs enforce secure access controls
- Role-based access is implemented
- Data storage follows encrypted persistence practices
- Project complies with GLA University's academic ethical guidelines

---

## Testing Strategy

### Quality Attributes

| Attribute | Description |
|---|---|
| Correctness | Agents produce outputs that address the stated goal |
| Reliability | Pipeline handles blocked and failed steps gracefully |
| Scalability | Architecture supports adding new agent types |
| Maintainability | Each agent is an isolated, independently testable module |

### Testing Levels

- **Unit Testing** — Individual agent functions (`plannerAgent`, `executorAgent`, `criticAgent`, `memoryAgent`) tested in isolation
- **Integration Testing** — Full Planner → Executor → Critic → Memory pipeline tested end-to-end with sample goals
- **Scenario-Based Evaluation** — Real-world goal scenarios tested against expected refinement cycles and quality score thresholds

---

## Risks and Mitigations

| Risk | Impact | Mitigation Strategy |
|---|---|---|
| Incomplete or ambiguous planning output | High | Iterative refinement loop driven by Critic feedback |
| Executor producing incorrect or hallucinated output | Medium | Critic penalizes hallucinations (−20) and triggers re-run |
| Cloud latency affecting response time | Medium | Caching, optimized API calls, retry logic |
| Academic timeline constraints | High | Week-wise delivery plan with defined module milestones |

---

## Scope and Limitations

### In Scope
- Autonomous task decomposition via Planner agent
- Planner–Executor–Critic–Memory architecture
- Persistent memory across sessions *(planned)*
- Cloud deployment with REST APIs *(implementation phase)*
- Visual drag-and-drop workflow builder

### Out of Scope
- Multi-agent coordination between parallel agents
- Hardware, IoT, or robotics integration
- Domain-specific expert systems
- Human-in-the-loop supervision during execution
- AGI development or emotional intelligence modeling
- Supervised or reinforcement learning model training

---

## Research Foundation

This project draws on peer-reviewed research in:

- Agentic AI and autonomous reasoning systems
- Self-refining architectures and planning–execution–reflection loops
- Critic-driven feedback mechanisms
- Persistent memory architectures for long-term context retention across sessions

The Planner–Executor–Critic–Memory framework is grounded in established theoretical foundations from contemporary literature on autonomous agents, adapted for practical cloud deployment within academic constraints.

---

*B.Tech CSE-AIML & IoT · VI Semester · Mini Project 2 · GLA University Mathura · 2025–2026*  
*Team T-78 — Ishu Agrawal · Aryan Pratap · Priyanshu Nayak*  
*Mentor: Dr. Sachin Kumar Yadav*