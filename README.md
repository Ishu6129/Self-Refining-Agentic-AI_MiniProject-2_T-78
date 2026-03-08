```markdown
## 📁 Backend (Node.js)
```
```
backend-node/
├── src/
│   ├── agents/
│   │   ├── planner.agent.ts        # 🎯 Task decomposition
│   │   ├── executor.agent.ts       # ⚡ Task execution
│   │   ├── critic.agent.ts         # 🔍 Output evaluation
│   │   ├── memory.agent.ts         # 💾 Data persistence
│   │   └── base.agent.ts           # Abstract base class
│   │
│   ├── workflows/
│   │   ├── workflow.engine.ts      # Node orchestrator
│   │   ├── node.executor.ts        # Individual node runner
│   │   └── node.types.ts           # Type definitions
│   │
│   ├── models/
│   │   ├── workflow.model.ts       # Workflow graphs
│   │   ├── execution.model.ts      # Execution instances
│   │   └── memory.model.ts         # Memory storage
│   │
│   ├── controllers/                # API Controllers
│   ├── routes/                     # Express Routes
│   ├── services/                   # Business Logic
│   ├── utils/
│   │   └── groq.client.ts          # Groq API client
│   └── app.ts                      # Express entry point
│
├── package.json
├── tsconfig.json
└── .env
```
```

## 📁 Frontend (React)
```
```
frontend/
├── src/
│   ├── components/
│   │   ├── nodes/
│   │   │   ├── PlannerNode.tsx     # 🎯 Amber node
│   │   │   ├── ExecutorNode.tsx    # ⚡ Blue node
│   │   │   ├── CriticNode.tsx      # 🔍 Red node
│   │   │   └── MemoryNode.tsx      # 💾 Purple node
│   │   │
│   │   ├── workflow/
│   │   │   ├── FlowEditor.tsx      # Main canvas
│   │   │   ├── NodePalette.tsx     # Left sidebar
│   │   │   ├── PropertyPanel.tsx   # Right sidebar
│   │   │   └── ExecutionPanel.tsx  # Bottom panel
│   │   │
│   │   └── ui/                     # shadcn/ui components
│   │
│   ├── hooks/                      # Custom React hooks
│   ├── stores/                      # Zustand state management
│   ├── services/                    # API services (Axios)
│   ├── types/                        # TypeScript types
│   └── App.tsx
│
├── package.json
├── tailwind.config.js
└── vite.config.ts
```
```
## 📁 Shared
```
```
shared/
└── types/
    ├── workflow.types.ts
    └── node.types.ts
```

