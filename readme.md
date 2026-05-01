# 🤖 Cloud-Deployed Self-Refining Agentic AI

> A professional, cloud-deployed multi-agent system that bridges the gap between static LLM knowledge and real-world action. It accepts high-level abstract goals, autonomously decomposes them into live-researched sub-tasks, executes them using real-time data tools, and iteratively refines results through a self-correction loop.

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

1. **Planner** — Decomposes the goal into ordered, actionable sub-tasks.
2. **Executor** — The "hands" of the system. It bridges the gap to the physical world using **Real-Time Action Tools** (Web Search, Knowledge Retrieval, and Live Data APIs).
3. **Critic** — Scores the output (0-100) and identifies logical gaps or hallucinations.
4. **Refinement** — If score < 90, the system automatically re-plans and re-executes.
5. **Memory** — Extracts key insights and persists them for long-term learning.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| LLM Backend | [Groq](https://console.groq.com) — `llama-3.3-70b-versatile` (free tier) |
| Backend Framework | Node.js + TypeScript + Express 5 |
| Database | MongoDB (Atlas) |
| Frontend | React 18 + Tailwind CSS + ReactFlow |
| State Management | Zustand |
| Primary Cloud | **AWS (Amazon Web Services)** — EC2 / Load Balanced deployment |
| Backup Cloud | Render.com (Backend) + Vercel (Frontend) |

---

## 🚀 Running Locally

### Prerequisites
- Node.js ≥ 18
- Free [Groq API key](https://console.groq.com) (takes 30 seconds to get)
- Local MongoDB or MongoDB Atlas URI
- [Serper.dev API Key](https://serper.dev) (for real-time web search)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and fill in **all required values**:

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB Atlas connection string |
| `GROQ_API_KEY` | Your Groq API key (free at [console.groq.com](https://console.groq.com)) |
| `JWT_SECRET` | A long random string — generate with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `SERPER_API_KEY` | Your [Serper.dev](https://serper.dev) key (free tier available) |
| `FRONTEND_URL` | Your Vercel URL (optional, for strict CORS) |

```bash
npm run build
npm start
```

Server starts at **http://localhost:5000**

### 2. Frontend

```bash
cd Frontend
npm install
cp .env.example .env
```

Open `.env` and set:

| Variable | Description |
|----------|-------------|
| `REACT_APP_API_URL` | Your backend URL (e.g. `http://localhost:5000` for local, or your Render URL in production) |

```bash
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
7. Use the **Settings** page to manage your **Groq** and **Serper** API credentials securely.
8. Check **Dashboard**, **Execution History**, and **Memory Store** pages for full details.

---

## 📡 REST API Reference

Base URL (local): `http://localhost:5000`
Base URL (AWS Primary): `http://<aws-ec2-instance-ip>:5000`
Base URL (Render Backup): `https://<your-backend-id>.onrender.com`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/` | GET | — | Health check |
| `/auth/register` | POST | — | User registration |
| `/auth/login` | POST | — | User login & token generation |
| `/auth/promote` | POST | Master | Promote user to Admin via `masterKey` |
| `/agent/goal` | POST | User | Run full agentic pipeline (Streamed) |
| `/agent/status/:id`| GET | User | User-specific statistics |
| `/agent/history/:id`| GET | User | Past execution history |
| `/agent/memory/:id` | GET | User | Memory store entries |
| `/admin/logs` | GET | Admin | Global audit trail & IP telemetry |
| `/agent/export/pdf/:id` | GET | — | Download PDF Report |
| `/agent/export/docx/:id` | GET | — | Download DOCX Report |

---

## 🔒 Security & Administration

The system implements **Role-Based Access Control (RBAC)** to ensure data privacy and system integrity.

### 1. Admin Access
Admin privileges are granted by directly editing the user's `role` field in MongoDB:
```
Collection: users → find your user document → set role: "admin"
```
Once set, the user will see the **Admin Logs** menu item on next login.

### 2. Audit Trail & Monitoring
Admins have access to a dedicated **Admin Logs** dashboard.
- **Origin IP Tracking**: Identify user locations and potential security threats.
- **Latency Monitoring**: Track response times (ms) across all agentic nodes.
- **HTTP Intelligence**: Click any status code (e.g., 403, 429, 500) to see its technical meaning.

### 3. Data Isolation
- **Tenant Privacy**: User goals, plans, and memory facts are strictly isolated by `userId`.
- **JWT Protection**: All agentic routes are protected via JSON Web Tokens with a 7-day expiration.

---

## ☁️ Cloud Deployment

### 🌟 Primary Deployment → AWS (Amazon Web Services)
For high availability, scalability, and performance, the system is primarily deployed on AWS.
1. **Compute**: Hosted on AWS EC2 instances running PM2 for process management.
2. **Database**: MongoDB Atlas cluster mapped to the AWS environment.
3. **Frontend**: Can be served statically via AWS S3 + CloudFront or bundled with the EC2 instance.

### 🛡️ Backup Deployment → Render & Vercel
As a failover and secondary environment, we utilize Render and Vercel.

**Backup Backend → Render.com**
1. Push code to GitHub
2. Go to [render.com](https://render.com) → New → Web Service → connect repo
3. Render reads `render.yaml` automatically
4. In dashboard → Environment → add `GROQ_API_KEY` and `MONGO_URI`

**Backup Frontend → Vercel**
1. Go to [vercel.com](https://vercel.com) → New Project → import repo
2. Set `Root Directory` to `Frontend`
3. Add environment variable: `REACT_APP_API_URL` = your Render/AWS backend URL
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
│   │   │   ├── executor.agent.ts       # Task execution with tool-loop
│   │   │   ├── critic.agent.ts         # Quality evaluation
│   │   │   └── memory.agent.ts         # Context extraction
│   │   ├── controllers/
│   │   │   ├── toolHandle.ts           # External tool logic (Search, Currency)
│   │   │   └── tools.ts                # API request utility
│   │   ├── orchestrator/
│   │   │   └── pipeline.ts             # Full agent chain + in-memory store
│   │   └── routes/
│   │       ├── agent.routes.ts         # REST API endpoints
│   │       └── export.routes.ts        # PDF/DOCX generation
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

## ✅ Implementation Status (Aligned with Project Statement)

| Core Objective / Requirement | Implementation Details | Status |
|------------------------------|------------------------|--------|
| **Autonomous Task Decomposition** | `Planner Agent` converts abstract goals into ordered sub-tasks. | ✅ Complete |
| **Action-Based Execution** | `Executor Agent` interacts with the live web via **Native Tool Integration** to solve non-static problems. | ✅ Complete |
| **Self-Critique Mechanism** | `Critic Agent` evaluates output quality without human supervision. | ✅ Complete |
| **Planning-Execution-Reflection Loop** | Automated self-refinement loop triggers if quality score < 90. | ✅ Complete |
| **Long-Term Memory Persistence** | `Memory Agent` stores past plans and critiques in MongoDB. | ✅ Complete |
| **Cloud Deployment & Observability** | Deployed on AWS/Render with REST API & React Flow visualization. | ✅ Complete |
| **Document Exporting** | Generates formatted PDF/DOCX Reports with **Memory Persistence**. | ✅ Complete |

---

*Team 78 · GLA University · CSE-AIML&IoT · 2025-26*
