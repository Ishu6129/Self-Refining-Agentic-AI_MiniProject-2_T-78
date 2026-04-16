import React from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  Target,
  Zap,
  Search,
  Database,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const agents = [
  {
    name: 'Input',
    icon: MessageSquare,
    color: 'text-gold-500',
    bgColor: 'bg-gold-500/10',
    borderColor: 'border-gold-500/20',
    description:
      "This is where you type what you want. Tell the AI your goal, like asking a teacher for help with a project. Be as clear as you can!",
  },
  {
    name: 'Planner',
    icon: Target,
    color: 'text-ivory-300',
    bgColor: 'bg-ivory-300/10',
    borderColor: 'border-ivory-300/20',
    description:
      "The Planner is like a smart study buddy who breaks your big goal into small, easy steps. It figures out the best order to do things.",
  },
  {
    name: 'Executor',
    icon: Zap,
    color: 'text-sage-400',
    bgColor: 'bg-sage-400/10',
    borderColor: 'border-sage-400/20',
    description:
      "The Executor does the actual work! It follows the Planner's steps one by one, like a student completing homework assignments.",
  },
  {
    name: 'Critic',
    icon: Search,
    color: 'text-rose-400',
    bgColor: 'bg-rose-400/10',
    borderColor: 'border-rose-400/20',
    description:
      "The Critic is like a helpful teacher who checks your work. It gives a score and tells you what's great and what could be better.",
  },
  {
    name: 'Memory',
    icon: Database,
    color: 'text-gold-400',
    bgColor: 'bg-gold-400/10',
    borderColor: 'border-gold-400/20',
    description:
      'The Memory is like a notebook that remembers everything important. Next time you ask something similar, the AI already knows your preferences!',
  },
];

const floatClasses = [
  'animate-float',
  'animate-float-delayed',
  'animate-float-slow',
  'animate-float',
  'animate-float-delayed',
];

const examples = [
  {
    emoji: '\uD83D\uDCDD',
    title: 'Write a Poem',
    goal: 'Write a short, fun poem about a dog who loves pizza',
  },
  {
    emoji: '\uD83D\uDD2C',
    title: 'Explain Science',
    goal: 'Explain why the sky is blue in simple words',
  },
  {
    emoji: '\uD83C\uDF89',
    title: 'Plan a Party',
    goal: 'Help me plan a birthday party for 10 friends',
  },
  {
    emoji: '\uD83D\uDC31',
    title: 'Tell a Story',
    goal: 'Create a short adventure story about a brave cat',
  },
  {
    emoji: '\uD83D\uDE80',
    title: 'Fun Facts',
    goal: 'Give me 5 amazing facts about outer space',
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-obsidian-950 text-ivory-50 overflow-x-hidden">
      {/* ---- Hero ---- */}
      <section className="relative min-h-screen flex flex-col">
        {/* Subtle radial glow behind hero */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gold-500/[0.03] blur-[120px]" />
        </div>

        {/* Nav */}
        <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 border-b border-obsidian-700/40">
          <Link to="/" className="flex items-center gap-1 text-ivory-100 text-lg font-semibold tracking-wide">
            Agentic AI
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold-400 mb-2" />
          </Link>

          <div className="flex items-center gap-6 md:gap-8 text-sm">
            <Link
              to="/how-it-works"
              className="hidden sm:inline-block text-ivory-400 hover:text-ivory-100 transition-colors"
            >
              How it Works
            </Link>
            <Link
              to="/workspace"
              className="hidden sm:inline-block text-ivory-400 hover:text-ivory-100 transition-colors"
            >
              Workspace
            </Link>
            <Link
              to="/workspace"
              className="px-5 py-2 rounded-lg bg-gold-500 text-obsidian-950 font-semibold hover:bg-gold-400 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </nav>

        {/* Hero content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 gap-8 pb-24">
          {/* Label */}
          <span className="animate-fade-in text-gold-500 text-xs font-semibold uppercase tracking-[0.3em]">
            Self-Refining AI System
          </span>

          {/* Headline */}
          <h1 className="animate-slide-up text-5xl md:text-7xl font-extrabold leading-tight">
            <span className="text-ivory-50">Think. Plan.</span>
            <br />
            <span className="text-ivory-50">Execute. </span>
            <span className="text-gold-400">Refine.</span>
          </h1>

          {/* Subtitle */}
          <p className="animate-slide-up text-lg text-ivory-400 max-w-2xl">
            A multi-agent AI system that decomposes your goals into plans, executes
            them, self-critiques the results, and learns from every interaction.
          </p>

          {/* CTA buttons */}
          <div className="animate-slide-up flex flex-wrap items-center justify-center gap-4">
            <Link to="/workspace" className="btn-primary inline-flex items-center gap-2">
              Try it Now <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/how-it-works" className="btn-secondary inline-flex items-center gap-2">
              See How it Works
            </Link>
          </div>

          {/* Agent pipeline diagram */}
          <div className="animate-fade-in mt-12 w-full max-w-3xl mx-auto">
            <div className="flex items-start justify-between relative px-4">
              {/* Dashed connecting line */}
              <div className="absolute top-8 left-[10%] right-[10%] h-px border-t border-dashed border-gold-500/30" />

              {agents.map((agent, i) => {
                const Icon = agent.icon;
                return (
                  <div
                    key={agent.name}
                    className={`group relative z-10 flex flex-col items-center gap-2 ${floatClasses[i]}`}
                  >
                    <div
                      className={`w-14 h-14 md:w-16 md:h-16 rounded-full ${agent.bgColor} border ${agent.borderColor} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}
                    >
                      <Icon className={`w-6 h-6 md:w-7 md:h-7 ${agent.color}`} />
                    </div>
                    <span className="text-xs text-ivory-300 font-medium">{agent.name}</span>
                    {/* Tooltip */}
                    <div className="pointer-events-none absolute top-full mt-6 w-48 rounded-xl bg-obsidian-800 border border-obsidian-600/40 p-3 text-xs text-ivory-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center shadow-lg">
                      {agent.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
      {/* ---- Meet Your AI Team ---- */}
      <section className="relative py-24 md:py-32 px-6 md:px-12 bg-obsidian-900/50">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-ivory-100 mb-4">
              Meet Your AI Team
            </h2>
            <p className="text-ivory-400 text-lg max-w-xl mx-auto">
              Five specialized agents work together so you don&rsquo;t have to.
            </p>
          </div>

          {/* Card grid: first 4 in 2x2 (md) / 1-col (sm), last card full width */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.slice(0, 4).map((agent) => {
              const Icon = agent.icon;
              return (
                <div
                  key={agent.name}
                  className="card card-hover bg-obsidian-800/80 border border-obsidian-600/30 rounded-2xl p-8 flex flex-col gap-4"
                >
                  <div
                    className={`w-12 h-12 rounded-xl ${agent.bgColor} border ${agent.borderColor} flex items-center justify-center`}
                  >
                    <Icon className={`w-6 h-6 ${agent.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-ivory-100">{agent.name} Agent</h3>
                  <p className="text-ivory-400 text-sm leading-relaxed">{agent.description}</p>
                </div>
              );
            })}

            {/* Memory card - spans full width on larger screens */}
            {(() => {
              const memoryAgent = agents[4];
              const Icon = memoryAgent.icon;
              return (
                <div className="md:col-span-2 lg:col-span-3 card card-hover bg-obsidian-800/80 border border-obsidian-600/30 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-6">
                  <div
                    className={`w-12 h-12 shrink-0 rounded-xl ${memoryAgent.bgColor} border ${memoryAgent.borderColor} flex items-center justify-center`}
                  >
                    <Icon className={`w-6 h-6 ${memoryAgent.color}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-ivory-100 mb-2">{memoryAgent.name} Agent</h3>
                    <p className="text-ivory-400 text-sm leading-relaxed max-w-2xl">
                      {memoryAgent.description}
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </section>
      {/* ---- Try These Examples ---- */}
      <section className="relative py-24 md:py-32 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-ivory-100 mb-4">
              Try These Examples
            </h2>
            <p className="text-ivory-400 text-lg max-w-xl mx-auto">
              Click any example to jump to the workspace with it pre-loaded.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {examples.map((ex, i) => (
              <Link
                key={i}
                to="/workspace"
                state={{ goal: ex.goal }}
                className="card card-hover bg-obsidian-800/80 border border-obsidian-600/30 rounded-2xl p-8 flex flex-col gap-3 group transition-colors hover:border-gold-500/30"
              >
                <span className="text-3xl">{ex.emoji}</span>
                <h3 className="text-lg font-bold text-ivory-100 group-hover:text-gold-400 transition-colors">
                  {ex.title}
                </h3>
                <p className="text-ivory-400 text-sm leading-relaxed">{ex.goal}</p>
                <span className="mt-auto pt-2 inline-flex items-center gap-1 text-xs text-gold-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  Launch in workspace <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      {/* ---- Footer ---- */}
      <footer className="border-t border-obsidian-700/40 py-12 px-6 md:px-12">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-6">
          <div className="flex items-center gap-2 text-obsidian-400 text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Built with Multi-Agent Architecture</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link to="/workspace" className="text-obsidian-400 hover:text-ivory-200 transition-colors">
              Workspace
            </Link>
            <Link to="/dashboard" className="text-obsidian-400 hover:text-ivory-200 transition-colors">
              Dashboard
            </Link>
            <Link to="/how-it-works" className="text-obsidian-400 hover:text-ivory-200 transition-colors">
              How it Works
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
