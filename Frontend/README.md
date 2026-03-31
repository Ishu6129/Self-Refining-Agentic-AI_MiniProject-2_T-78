# 🚀 Agentic AI Frontend — T-78 Project

<img width="1913" height="957" alt="{8A6D5CE5-5845-48DA-8AA6-53DCE85F46C2}" src="https://github.com/user-attachments/assets/a988bf66-9d78-428a-93dc-63d4333465cb" />


A **Cloud-Deployed Self-Refining Agentic AI Frontend** built using **React.js**, **React Flow**, and **TailwindCSS**.

This project provides a visual workflow builder where users can design, execute, and monitor Agentic AI pipelines using drag-and-drop nodes.

**Developer:** Priyanshu Nayak  
**Program:** B.Tech CSE (AI & ML)

---

## 📌 Overview

Agentic AI Frontend is a modern web interface that allows users to:

- Build AI workflows visually
- Connect agent nodes dynamically
- Execute workflows step-by-step
- Monitor execution logs in real time
- Store workflow configurations locally
- View execution history and memory data

The system simulates an **agentic reasoning pipeline** consisting of planner, executor, critic, memory, and output agents.

---

## 🧠 Features

### ✅ Workflow Builder
- Drag & drop node system
- Interactive canvas using React Flow
- Dynamic node connections
- Configurable agent nodes

### ✅ Agent Nodes
- **Input Node** — Accept goals
- **Planner Node** — Task decomposition
- **Executor Node** — Execute tasks
- **Critic Node** — Evaluate output
- **Memory Node** — Store context
- **Output Node** — Generate results

### ✅ Execution Engine
- Sequential workflow execution
- Node status tracking
- Real-time execution logs
- Simulated AI pipeline behavior

### ✅ Dashboard
- Execution statistics
- Recent activity overview

### ✅ Memory Viewer
- Persistent context visualization
- Searchable memory entries

### ✅ Settings Panel
- API endpoint configuration
- Timeout & retry controls

---

## 🏗️ Tech Stack

| Technology | Purpose |
|------------|---------|
| React 18 | Frontend framework |
| React Router | Routing |
| React Flow | Workflow canvas |
| Zustand | State management |
| TailwindCSS | Styling |
| React Query | Data fetching |
| Axios | API communication |
| Lucide React | Icons |
| UUID | Unique identifiers |
| Date-Fns | Date formatting |

---

## 📁 Project Structure
│
├── public/
│
├── src/
│ ├── components/
│ │ ├── Layout/
│ │ ├── Sidebar/
│ │ ├── Header/
│ │ ├── NodePalette/
│ │ ├── WorkflowCanvas/
│ │ └── ExecutionLog/
│ │
│ ├── pages/
│ │ ├── WorkflowBuilder/
│ │ ├── Dashboard/
│ │ ├── MemoryViewer/
│ │ ├── ExecutionHistory/
│ │ └── Settings/
│ │
│ ├── store/
│ │ └── workflowStore.js
│ │
│ ├── App.js
│ └── index.js
│
├── package.json
├── tailwind.config.js
└── postcss.config.js


---

## ⚙️ Installation

### 1️⃣ Clone Repository

```bash
git clone <your-repo-url>
cd agentic-ai-frontend
2️⃣ Install Dependencies
npm install
3️⃣ Start Development Server
npm start

Application runs at:

http://localhost:3000
🧪 Workflow Execution

Drag nodes from Node Palette

Drop nodes onto canvas

Connect nodes

Click Execute

View execution logs

Execution flow:

Input → Planner → Executor → Critic → Memory → Output
💾 Local Storage

The application stores:

Workflow state

User settings

inside browser localStorage.

🔧 Configuration

Settings page allows configuration of:

API Endpoint

Execution timeout

Retry attempts

Logging preferences

🚀 Future Improvements

Backend AI integration

Real LLM execution

WebSocket streaming responses

Cloud workflow persistence

Authentication system

Multi-user collaboration

🧑‍💻 Developer

Priyanshu Nayak
B.Tech Computer Science (AI & ML)

📄 License

This project is intended for academic and educational purposes.

🤝 Contributing

Pull requests are welcome.
For major changes, please open an issue first.

⭐ Acknowledgements

React Flow

TailwindCSS

Open Source Community

Agentic AI Research Concepts
