# 🤖 Cloud-Deployed Self-Refining Agentic AI

> An autonomous multi-agent AI system that accepts high-level abstract goals, decomposes them into structured sub-tasks, executes them, critiques its own output, and refines results iteratively — without human supervision.

**Mini Project 2 · B.Tech CSE-AIML & IoT (III Year – VI Sem) · 2025–2026**
**Department of Computer Science & Engineering · GLA University, Mathura**
**Mentor: Dr. Sachin Kumar Yadav**

---

## 👥 Team T-78

| Member | Name | Roll No. | Role |
|--------|------|----------|------|
| 1 | Ishu Agrawal | 2315510088 | Team Leader — System design, integration, documentation |
| 2 | Aryan Pratap | 2315510041 | Backend Developer — APIs, pipeline, cloud deployment |
| 3 | Priyanshu Nayak | 2315510154 | Frontend Developer — UI, visualization, UX |

---

## 🏗️ How It Works

```
User Goal
    │
    ▼
┌─────────┐    ┌──────────┐     ┌────────┐     ┌────────┐    ┌─────────┐
│ Planner │---▶│ Executor │───▶│ Critic │───▶│ Memory │───▶│ Output  │
│  Agent  │    │  Agent   │     │  Agent │     │  Agent │    │  Panel  │
└─────────┘    └──────────┘     └────────┘     └────────┘    └─────────┘
     ▲                              │
     └──── Refinement loop ─────────┘
           (if quality score < 90)
```

1. **Planner** — Decomposes the goal into ordered, actionable sub-tasks
2. **Executor** — Faithfully executes each step from the plan
3. **Critic** — Scores the output (0-100) and identifies issues
4. **Refinement** — If score < 90, the system re-plans and re-executes automatically
5. **Memory** — Extracts reusable context and persists it across sessions

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| LLM Backend | [Groq](https://console.groq.com) — `llama-3.3-70b-versatile` (free tier) |
| Backend Framework | Node.js + TypeScript + Express 5 |
| Frontend | React 18 + Tailwind CSS + ReactFlow |
| State Management | Zustand |
| Cloud (Backend) | Render.com |
| Cloud (Frontend) | Vercel |

---

## 🚀 Running Locally

### Prerequisites
- Node.js ≥ 18
- Free [Groq API key](https://console.groq.com) (takes 30 seconds to get)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env          # then open .env and paste your GROQ_API_KEY
npm run dev
```

Server starts at **http://localhost:5000**

### 2. Frontend

```bash
cd Frontend
npm install
cp .env.example .env          # default values work for local dev
npm start
```

App opens at **http://localhost:3000**

### 3. Use the System

1. Open `http://localhost:3000`
2. The **Workflow Builder** loads with the default pipeline (Input → Planner → Executor → Critic → Memory → Output)
3. Click the **Input Goal** node and type your goal (e.g. `"Write a research plan for studying transformer models"`)
4. Click **Execute** in the top header
5. Watch each node animate as it runs
6. See the result in the right panel that slides open
7. Check **Dashboard**, **Execution History**, and **Memory Store** pages for full details

---

## 📡 REST API Reference

Base URL (local): `http://localhost:5000`
Base URL (cloud): `https://agentic-ai-backend-t78.onrender.com`

| Endpoint | Method | Body | Description |
|----------|--------|------|-------------|
| `/` | GET | — | Health check |
| `/agent/goal` | POST | `{ "goal": "string" }` | Run full pipeline |
| `/agent/status` | GET | — | System stats |
| `/agent/history` | GET | — | All past executions |
| `/agent/memory` | GET | — | Memory store entries |

**Example:**
```bash
curl -X POST http://localhost:5000/agent/goal \
  -H "Content-Type: application/json" \
  -d '{"goal": "Create a study plan for learning machine learning"}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "exec-1744000000000",
    "goal": "Create a study plan for learning machine learning",
    "plan": "# Plan\n## Goal\n...",
    "executionResult": "# Execution Result\n...",
    "critique": { "qualityScore": 85, "isSatisfactory": true, ... },
    "qualityScore": 85,
    "iterationsRan": 1,
    "status": "success",
    "timestamp": "2026-04-12T10:00:00.000Z"
  }
}
```

---

## ☁️ Cloud Deployment

### Backend → Render.com (Aryan Pratap)
1. Push code to GitHub
2. Go to [render.com](https://render.com) → New → Web Service → connect repo
3. Render reads `render.yaml` automatically
4. In dashboard → Environment → add `GROQ_API_KEY`

### Frontend → Vercel (Priyanshu Nayak)
1. Go to [vercel.com](https://vercel.com) → New Project → import repo
2. Set `Root Directory` to `Frontend`
3. Add environment variable: `REACT_APP_API_URL` = your Render backend URL
4. Deploy

---

## 📂 Project Structure

```
├── backend/
│   ├── app.ts                          # Express server entry point
│   ├── src/
│   │   ├── agent/
│   │   │   ├── base.agent.ts           # Groq LLM wrapper
│   │   │   ├── planner.agent.ts        # Goal decomposition
│   │   │   ├── executor.agent.ts       # Task execution
│   │   │   ├── critic.agent.ts         # Quality evaluation
│   │   │   └── memory.agent.ts         # Context extraction
│   │   ├── orchestrator/
│   │   │   └── pipeline.ts             # Full agent chain + in-memory store
│   │   └── routes/
│   │       └── agent.routes.ts         # REST API endpoints
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── WorkflowCanvas/
│   │   │   │   ├── WorkflowCanvas.js   # ReactFlow canvas + result panel
│   │   │   │   └── CustomNode.js       # Node UI + inline goal input
│   │   │   ├── ExecutionLog/           # Live log panel
│   │   │   ├── Header/                 # Execute / Save buttons
│   │   │   ├── Sidebar/                # Navigation
│   │   │   └── NodePalette/            # Drag-and-drop node list
│   │   ├── pages/
│   │   │   ├── WorkflowBuilder/        # Main canvas page
│   │   │   ├── Dashboard/              # Live stats
│   │   │   ├── MemoryViewer/           # Memory store page
│   │   │   ├── ExecutionHistory/       # Past runs with full detail
│   │   │   └── Settings/               # API config + backend test
│   │   └── store/
│   │       └── workflowStore.js        # Zustand store + real API calls
│   ├── .env.example
│   ├── vercel.json
│   └── package.json
│
├── render.yaml                         # Render.com deployment config
└── README.md
```

---

## ✅ Implementation Status

| Feature | Status |
|---------|--------|
| Planner Agent | ✅ Complete |
| Executor Agent | ✅ Complete |
| Critic Agent | ✅ Complete |
| Memory Agent | ✅ Complete |
| REST API (goal, status, history, memory) | ✅ Complete |
| Planner→Executor→Critic→Memory Pipeline | ✅ Complete |
| Self-Refinement Loop | ✅ Complete |
| Workflow Builder UI (drag & drop) | ✅ Complete |
| Goal input on canvas node | ✅ Complete |
| Live execution log | ✅ Complete |
| Result side panel | ✅ Complete |
| Dashboard (live stats) | ✅ Complete |
| Execution History (expandable) | ✅ Complete |
| Memory Viewer (live) | ✅ Complete |
| Cloud deployment config | ✅ Complete |
| Unit tests | ⏳ Week 8 |
| Persistent DB (SQLite/PostgreSQL) | ⏳ Future work |
| Auth / API keys | ⏳ Future work |

---

*Team 78 · GLA University · CSE-AIML&IoT · 2025-26*
