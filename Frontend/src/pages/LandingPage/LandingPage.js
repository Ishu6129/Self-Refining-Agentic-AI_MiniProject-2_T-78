import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedBackground from './AnimatedBackground';
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
    description: "This is where you type what you want. Tell the AI your goal.",
  },
  {
    name: 'Planner',
    icon: Target,
    color: 'text-ivory-300',
    bgColor: 'bg-ivory-300/10',
    borderColor: 'border-ivory-300/20',
    description: "The Planner breaks your big goal into small, easy steps.",
  },
  {
    name: 'Executor',
    icon: Zap,
    color: 'text-sage-400',
    bgColor: 'bg-sage-400/10',
    borderColor: 'border-sage-400/20',
    description: "The Executor does the actual work following the Planner's steps.",
  },
  {
    name: 'Critic',
    icon: Search,
    color: 'text-rose-400',
    bgColor: 'bg-rose-400/10',
    borderColor: 'border-rose-400/20',
    description: "The Critic checks the work and gives a quality score.",
  },
  {
    name: 'Memory',
    icon: Database,
    color: 'text-gold-400',
    bgColor: 'bg-gold-400/10',
    borderColor: 'border-gold-400/20',
    description: 'The Memory remembers everything important for future interactions.',
  },
];

const examples = [
  { emoji: '📝', title: 'Write a Poem', goal: 'Write a short, fun poem about a dog who loves pizza' },
  { emoji: '🔬', title: 'Explain Science', goal: 'Explain why the sky is blue in simple words' },
  { emoji: '🎉', title: 'Plan a Party', goal: 'Help me plan a birthday party for 10 friends' },
  { emoji: '🐱', title: 'Tell a Story', goal: 'Create a short adventure story about a brave cat' },
  { emoji: '🚀', title: 'Fun Facts', goal: 'Give me 5 amazing facts about outer space' },
];

/* ------------------------------------------------------------------ */
/*  Animation Variants                                                 */
/* ------------------------------------------------------------------ */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100, damping: 10 },
  },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-obsidian-950 text-ivory-50 overflow-x-hidden" style={{ perspective: '1000px' }}>
      {/* ---- Hero ---- */}
      <section className="relative min-h-screen flex flex-col overflow-hidden">
        {/* Animated cosmic background */}
        <AnimatedBackground />

        {/* Animated background glow */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gold-500/[0.05] blur-[150px] pointer-events-none"
        />

        {/* Nav */}
        <motion.nav 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 border-b border-obsidian-700/40 backdrop-blur-md bg-obsidian-950/50"
        >
          <Link to="/" className="flex items-center gap-1 text-ivory-100 text-lg font-semibold tracking-wide">
            Agentic AI
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold-400 mb-2" />
          </Link>

          <div className="flex items-center gap-6 md:gap-8 text-sm">
            <Link to="/how-it-works" className="hidden sm:inline-block text-ivory-400 hover:text-ivory-100 transition-colors">
              How it Works
            </Link>
            <Link to="/workspace" className="hidden sm:inline-block text-ivory-400 hover:text-ivory-100 transition-colors">
              Workspace
            </Link>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/workspace" className="px-5 py-2 rounded-lg bg-gold-500 text-obsidian-950 font-semibold hover:bg-gold-400 transition-colors shadow-[0_0_15px_rgba(252,211,77,0.3)]">
                Get Started
              </Link>
            </motion.div>
          </div>
        </motion.nav>

        {/* Hero content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 gap-8 pb-24 mt-12">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center gap-6 max-w-4xl"
          >
            <motion.span variants={itemVariants} className="text-gold-500 text-xs font-semibold uppercase tracking-[0.3em] bg-gold-500/10 px-4 py-1.5 rounded-full border border-gold-500/20">
              Cloud-Deployed Self-Refining System
            </motion.span>

            <motion.h1 variants={itemVariants} className="text-5xl md:text-8xl font-black leading-[1.1] tracking-tight drop-shadow-2xl">
              <span className="text-ivory-50 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">Autonomous.</span>
              <br />
              <span className="text-gold-400 drop-shadow-[0_0_20px_rgba(252,211,77,0.4)]">Intelligent. </span>
              <span className="text-ivory-50 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">Agentic.</span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-lg md:text-xl text-ivory-300 max-w-2xl font-light drop-shadow-md">
              Experience the future of AI. A multi-agent system that autonomously decomposes abstract goals, executes tasks, and self-refines its own logic.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-4 mt-4">
              <motion.div whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}>
                <Link to="/workspace" className="px-8 py-4 rounded-xl bg-gold-500 text-obsidian-950 font-bold hover:bg-gold-400 transition-colors shadow-[0_10px_30px_rgba(252,211,77,0.3)] flex items-center gap-2">
                  Launch Workspace <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}>
                <Link to="/how-it-works" className="px-8 py-4 rounded-xl bg-obsidian-800 text-ivory-100 font-semibold border border-obsidian-600 hover:bg-obsidian-700 transition-colors backdrop-blur-md">
                  View Architecture
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* 3D Pipeline Visualizer */}
          <motion.div 
            initial={{ opacity: 0, y: 50, rotateX: 20 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1, delay: 0.8, type: "spring" }}
            style={{ transformStyle: "preserve-3d" }}
            className="mt-20 w-full max-w-4xl mx-auto relative perspective-[1000px]"
          >
            <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 relative z-10">
              {agents.map((agent, i) => {
                const Icon = agent.icon;
                return (
                  <motion.div
                    key={agent.name}
                    whileHover={{ scale: 1.15, rotateY: 15, rotateX: -10, z: 50 }}
                    className="relative group cursor-pointer"
                  >
                    <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl ${agent.bgColor} border ${agent.borderColor} flex flex-col items-center justify-center shadow-xl backdrop-blur-md transition-colors group-hover:bg-opacity-30`}>
                      <Icon className={`w-8 h-8 ${agent.color} mb-1`} />
                      <span className="text-[10px] uppercase tracking-wider font-bold text-ivory-300">{agent.name}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            
            {/* Animated Connection line / Chain */}
            <div className="absolute top-1/2 left-10 right-10 h-[2px] bg-obsidian-800 -translate-y-1/2 -z-10 rounded-full overflow-hidden">
              {/* Moving light pulse representing data flow */}
              <motion.div
                className="h-full w-32 bg-gradient-to-r from-transparent via-gold-400 to-transparent shadow-[0_0_10px_rgba(252,211,77,0.8)]"
                animate={{ x: ['-200%', '1000%'] }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ---- Interactive 3D Features ---- */}
      <section className="relative py-32 px-6 md:px-12 bg-obsidian-950 relative overflow-hidden">
        {/* Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-ivory-50 to-ivory-400 mb-6">
              Modular AI Architecture
            </h2>
            <p className="text-ivory-400 text-xl max-w-2xl mx-auto font-light">
              Experience true autonomy. Five specialized agents working in harmony with long-term memory and self-reflection loops.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 perspective-[1000px]">
            {agents.map((agent, i) => {
              const Icon = agent.icon;
              return (
                <motion.div
                  key={agent.name}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ 
                    scale: 1.05, 
                    rotateY: 5, 
                    rotateX: -5,
                    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)"
                  }}
                  className="bg-gradient-to-br from-obsidian-800 to-obsidian-900 border border-obsidian-700/50 rounded-3xl p-8 transform-gpu transition-all duration-300"
                >
                  <div className={`w-14 h-14 rounded-2xl ${agent.bgColor} border ${agent.borderColor} flex items-center justify-center mb-6 shadow-inner`}>
                    <Icon className={`w-7 h-7 ${agent.color}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-ivory-50 mb-3">{agent.name} Node</h3>
                  <p className="text-ivory-300/80 leading-relaxed font-light">{agent.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---- 3D Example Cards ---- */}
      <section className="relative py-32 px-6 md:px-12 bg-gradient-to-b from-obsidian-950 to-obsidian-900">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-black text-ivory-100 mb-4">
              Deploy Instantly
            </h2>
            <p className="text-ivory-400 text-lg max-w-xl mx-auto">
              Select an abstract goal below to see the multi-agent system break it down in real-time.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 perspective-[1000px]">
            {examples.map((ex, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.05, y: -10, rotateX: 5 }}
              >
                <Link
                  to="/workspace"
                  state={{ goal: ex.goal }}
                  className="block h-full bg-obsidian-800/40 backdrop-blur-md border border-obsidian-600/50 rounded-3xl p-8 group transition-all duration-300 hover:border-gold-500/50 hover:bg-obsidian-800/80 hover:shadow-[0_0_30px_rgba(252,211,77,0.15)]"
                >
                  <div className="bg-obsidian-900/80 w-14 h-14 rounded-full flex items-center justify-center text-2xl border border-obsidian-700 mb-4 shadow-inner group-hover:scale-110 transition-transform">
                    {ex.emoji}
                  </div>
                  <h3 className="text-xl font-bold text-ivory-100 mb-2 group-hover:text-gold-400 transition-colors">
                    {ex.title}
                  </h3>
                  <p className="text-ivory-400/80 text-sm leading-relaxed mb-6">{ex.goal}</p>
                  <span className="inline-flex items-center gap-2 text-xs font-bold text-gold-500 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                    Execute Goal <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Footer ---- */}
      <footer className="border-t border-obsidian-800 py-12 px-6 md:px-12 bg-obsidian-950">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-6">
          <div className="flex items-center gap-2 text-gold-500/80 text-sm font-semibold tracking-wider uppercase">
            <Sparkles className="w-4 h-4" />
            <span>T-78 Agentic Architecture</span>
          </div>
          <div className="flex items-center gap-8 text-sm font-medium">
            <Link to="/workspace" className="text-ivory-400 hover:text-gold-400 transition-colors">Workspace</Link>
            <Link to="/dashboard" className="text-ivory-400 hover:text-gold-400 transition-colors">Dashboard</Link>
            <Link to="/how-it-works" className="text-ivory-400 hover:text-gold-400 transition-colors">System Internals</Link>
          </div>
          <p className="text-obsidian-500 text-xs mt-4">
            Cloud-Deployed Self-Refining Agentic AI © 2026
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
