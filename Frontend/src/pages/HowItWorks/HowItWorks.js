import React, { useState } from 'react';
import {
  BookOpen, Target, Zap, Search, Database, ArrowRight,
  RefreshCw, ChevronDown, ChevronUp, Lightbulb, GitCompare,
  MessageSquare, CheckCircle, XCircle
} from 'lucide-react';

// ── Collapsible section component ────────────────────────────────────────────
const Section = ({ title, icon: Icon, color, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-700 rounded-xl overflow-hidden bg-slate-800/20">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-slate-700/50 transition-colors"
      >
        <div className={`w-9 h-9 ${color} rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span className="flex-1 font-semibold text-white">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && <div className="px-5 pb-5 pt-1 space-y-3 border-t border-slate-700/50">{children}</div>}
    </div>
  );
};

// ── Comparison card ──────────────────────────────────────────────────────────
const ComparisonRow = ({ label, ours, theirs }) => (
  <div className="grid grid-cols-[2fr_1.5fr_1.5fr] gap-4 text-xs py-3 border-b border-slate-700/50 last:border-0">
    <div className="font-medium text-slate-300 pr-2">{label}</div>
    <div className="flex items-start gap-1.5">
      <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
      <span className="text-emerald-300/90 leading-relaxed">{ours}</span>
    </div>
    <div className="flex items-start gap-1.5">
      <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
      <span className="text-red-300/90 leading-relaxed">{theirs}</span>
    </div>
  </div>
);

// ── Example card ─────────────────────────────────────────────────────────────
const ExampleCard = ({ number, title, goal, steps, result }) => (
  <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 space-y-4 shadow-sm">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-sm font-bold text-white shadow-md">
        {number}
      </div>
      <h4 className="font-semibold text-white">{title}</h4>
    </div>

    <div className="bg-slate-900/80 rounded-lg p-3.5 border border-slate-700/50">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">You type:</p>
      <p className="text-sm text-blue-300 font-mono">"{goal}"</p>
    </div>

    <div className="space-y-2">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">What happens inside:</p>
      {steps.map((step, i) => (
        <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
          <span className="text-blue-400 font-mono font-bold flex-shrink-0">{i + 1}.</span>
          <span>{step}</span>
        </div>
      ))}
    </div>

    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3.5 mt-2">
      <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-1.5">Result:</p>
      <p className="text-xs text-emerald-300/90 leading-relaxed">{result}</p>
    </div>
  </div>
);

// ── Main Description Page ────────────────────────────────────────────────────
const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-slate-950 font-sans selection:bg-blue-500/30">
      <div className="h-full overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">

          {/* ── Hero section ──────────────────────────────────────────── */}
          <div className="text-center space-y-4 pb-6 border-b border-slate-800">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-semibold tracking-wide uppercase">
              <BookOpen className="w-3.5 h-3.5" />
              How It Works
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Self-Refining Agentic AI System
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto leading-relaxed text-sm sm:text-base">
              Think of this like a team of smart helpers working together.
              You give them one big task, and they <strong className="text-slate-200">plan it</strong>,{' '}
              <strong className="text-slate-200">do it</strong>,{' '}
              <strong className="text-slate-200">check their own work</strong>, and{' '}
              <strong className="text-slate-200">fix mistakes automatically</strong> — all without you
              having to step in. That is what makes this different from a regular chatbot.
            </p>
          </div>

          {/* ── Simple analogy ───────────────────────────────────────── */}
          <div className="bg-gradient-to-r from-amber-500/10 to-purple-500/10 border border-slate-700/50 rounded-xl p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-amber-500/20 rounded-lg flex-shrink-0 mt-0.5">
                <Lightbulb className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-amber-300 mb-3">Imagine it like a school project</h3>
                <p className="text-sm text-slate-300 leading-relaxed space-y-4">
                  <span>Suppose your teacher says: <em className="text-slate-100">"Write a report about the solar system."</em></span>
                  <br /><br />
                  <span><strong className="text-white">A regular chatbot</strong> is like one student who writes the whole thing in one shot — they might make mistakes, forget planets, or get facts wrong, and they hand it in without checking.</span>
                  <br /><br />
                  <span><strong className="text-white">This system</strong> is like a team of 5 students:</span><br />
                  <span className="block mt-2 space-y-1">
                    <span className="block"><span className="text-amber-400 font-medium">Student 1 (Planner)</span> makes an outline — "First cover the Sun, then each planet..."</span>
                    <span className="block"><span className="text-emerald-400 font-medium">Student 2 (Executor)</span> writes each section following the outline.</span>
                    <span className="block"><span className="text-red-400 font-medium">Student 3 (Critic)</span> reads the report and says, "You forgot Neptune!"</span>
                    <span className="block"><span className="text-amber-400 font-medium">Student 1</span> and <span className="text-emerald-400 font-medium">Student 2</span> fix the mistakes.</span>
                    <span className="block"><span className="text-purple-400 font-medium">Student 4 (Memory)</span> remembers what they learned for next time.</span>
                    <span className="block"><span className="text-slate-300 font-medium">Student 5 (Output)</span> hands you the final, polished report.</span>
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* ── The 5 Agents ─────────────────────────────────────────── */}
          <Section title="The 5 Agents — What Each One Does" icon={Target} color="bg-blue-600" defaultOpen={true}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 mt-2">
              {[
                { name: 'Planner Agent', color: 'bg-amber-500', icon: Target, desc: 'Breaks your big goal into small, numbered steps. Like making a recipe before you cook.' },
                { name: 'Executor Agent', color: 'bg-emerald-500', icon: Zap, desc: 'Follows the plan step-by-step. It can also use tools — a calculator, web search, or fetch data from the internet.' },
                { name: 'Critic Agent', color: 'bg-red-500', icon: Search, desc: 'Reads the work and gives it a score out of 100. If the score is too low, it tells the Planner and Executor exactly what to fix.' },
                { name: 'Memory Agent', color: 'bg-purple-500', icon: Database, desc: 'Saves important facts so the system gets smarter over time. If you ask something similar later, it already knows useful details.' },
                { name: 'Output Agent', color: 'bg-slate-500', icon: ArrowRight, desc: 'Delivers the final, cleaned-up answer to you after everything is checked and refined.' },
              ].map((agent) => (
                <div key={agent.name} className="flex items-start gap-3.5 p-3.5 bg-slate-900/50 hover:bg-slate-800/80 transition-colors rounded-lg border border-slate-700/30">
                  <div className={`w-9 h-9 ${agent.color} rounded-lg flex items-center justify-center flex-shrink-0 shadow-md`}>
                    <agent.icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-100 text-sm">{agent.name}</p>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{agent.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* ── Self-Refinement Loop ─────────────────────────────────── */}
          <Section title="The Self-Refinement Loop — Why It's Special" icon={RefreshCw} color="bg-amber-500" defaultOpen={true}>
            <p className="text-sm text-slate-300 leading-relaxed mt-1">
              The most powerful feature is the <strong className="text-white">automatic feedback loop</strong>.
              After the Executor finishes, the Critic checks the work. If it scores below the threshold
              (default: 70 out of 100), the system automatically goes back and tries again — up to 3 times.
            </p>
            <div className="flex items-center justify-center gap-2 sm:gap-3 py-6 flex-wrap">
              {['Plan', 'Execute', 'Critique', 'Score < 70?'].map((step, i) => (
                <React.Fragment key={step}>
                  <div className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold border shadow-sm ${
                    i === 3 ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-slate-800 border-slate-600 text-slate-100'
                  }`}>
                    {step}
                  </div>
                  {i < 3 && <ArrowRight className="w-4 h-4 text-slate-500" />}
                </React.Fragment>
              ))}
              <div className="flex items-center gap-1.5 text-amber-400 text-xs sm:text-sm font-medium ml-2 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
                <RefreshCw className="w-3.5 h-3.5" /> Go back & fix
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed bg-slate-900/50 p-3 rounded-lg border border-slate-700/30">
              Normal chatbots give you one answer and that is it. This system checks its own answer, finds problems,
              and fixes them — like a student who proofreads their essay before submitting.
            </p>
          </Section>

          {/* ── Comparison with competitors ──────────────────────────── */}
          <Section title="How Is This Different from Regular Chatbots?" icon={GitCompare} color="bg-indigo-500" defaultOpen={true}>
            <div className="overflow-x-auto mt-2">
              <div className="min-w-[600px]">
                <div className="grid grid-cols-[2fr_1.5fr_1.5fr] gap-4 text-xs py-3 border-b border-slate-700 font-bold uppercase tracking-wider">
                  <div className="text-slate-500">Feature</div>
                  <div className="text-emerald-400">This Agentic AI System</div>
                  <div className="text-red-400">Regular ChatBot (e.g., Free Tier)</div>
                </div>
                <div className="flex flex-col">
                  <ComparisonRow
                    label="Breaks task into steps?"
                    ours="Yes — Planner creates numbered steps automatically"
                    theirs="No — tries to answer everything in one message"
                  />
                  <ComparisonRow
                    label="Checks its own work?"
                    ours="Yes — Critic scores quality 0-100 and lists problems"
                    theirs="No — gives one answer, might be wrong"
                  />
                  <ComparisonRow
                    label="Fixes mistakes on its own?"
                    ours="Yes — loops back and improves until score is high enough"
                    theirs="No — you have to ask again yourself"
                  />
                  <ComparisonRow
                    label="Remembers across sessions?"
                    ours="Yes — Memory Agent stores useful facts in a database"
                    theirs="Limited — forgets after the chat window closes"
                  />
                  <ComparisonRow
                    label="Uses tools (search, math)?"
                    ours="Yes — calculator, web search, and URL fetcher built in"
                    theirs="Some paid plans only, not built into the reasoning"
                  />
                  <ComparisonRow
                    label="Shows you the plan?"
                    ours="Yes — you see every step, score, and refinement round"
                    theirs="No — you just see the final text"
                  />
                </div>
              </div>
            </div>
          </Section>

          {/* ── Real examples ────────────────────────────────────────── */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Real Examples — See It in Action</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Here are 5 examples showing exactly what happens when you type a goal.
                </p>
              </div>
            </div>

            <div className="grid gap-5">
              <ExampleCard
                number={1}
                title="Write a Short Story"
                goal="Write a 200-word story about a dog who learns to fly"
                steps={[
                  'Planner: Makes outline — intro (dog dreams of flying), middle (finds magic feather), end (flies over town).',
                  'Executor: Writes the story following each outline section.',
                  'Critic: Scores 55/100 — "Story is only 120 words, ending feels rushed."',
                  'Refinement Round: Planner adds more detail steps. Executor rewrites.',
                  'Critic re-scores: 82/100 — "Good length, nice ending." Done!',
                ]}
                result="You get a polished 200-word story that was checked and improved automatically. A regular chatbot would give you whatever it wrote first, even if it was too short."
              />

              <ExampleCard
                number={2}
                title="Math Word Problem"
                goal="A shop sells 45 apples on Monday, 32 on Tuesday, and 58 on Wednesday. What is the average per day?"
                steps={[
                  'Planner: Step 1 — Add all apples. Step 2 — Divide by 3. Step 3 — Write the answer clearly.',
                  'Executor: Uses the calculator tool → [TOOL_CALL: calculator | (45 + 32 + 58) / 3] → gets 45.',
                  'Critic: Scores 95/100 — "Correct answer, clear steps." No refinement needed.',
                  'Memory: Saves "User asks math word problems, prefers step-by-step solutions."',
                ]}
                result="Answer: 45 apples per day, with tool-verified math. A regular chatbot might calculate in its head and sometimes get it wrong — this system uses a real calculator."
              />

              <ExampleCard
                number={3}
                title="Research a Topic"
                goal="Explain what causes earthquakes in simple words"
                steps={[
                  'Planner: Step 1 — Define tectonic plates. Step 2 — Explain how they move. Step 3 — Describe what happens when they collide. Step 4 — Give a real example.',
                  'Executor: Uses web_search tool to get latest info, then writes each section.',
                  'Critic: Scores 60/100 — "Too much jargon for simple explanation. Missing a real-world example."',
                  'Refinement: Executor rewrites using simpler words and adds the 2011 Japan earthquake as example.',
                  'Critic re-scores: 88/100 — "Simple language, good example." Done!',
                ]}
                result="You get a kid-friendly explanation that was improved because the Critic caught that the first version was too complicated."
              />

              <ExampleCard
                number={4}
                title="Compare Two Things"
                goal="Compare cats and dogs as pets — which is easier for a busy family?"
                steps={[
                  'Planner: Step 1 — List cat pros/cons. Step 2 — List dog pros/cons. Step 3 — Compare time needed. Step 4 — Give a recommendation.',
                  'Executor: Writes each section with facts (dogs need walks, cats use litter boxes, etc.).',
                  'Critic: Scores 72/100 — "Good comparison but missing feeding time and vet visit frequency."',
                  'Refinement: Adds feeding schedules and annual vet visits to the comparison.',
                  'Critic re-scores: 91/100 — "Thorough and balanced." Done!',
                ]}
                result="A complete, balanced comparison that was improved with missing details the Critic found."
              />

              <ExampleCard
                number={5}
                title="Plan a Birthday Party"
                goal="Plan a birthday party for 10 kids with a $100 budget"
                steps={[
                  'Planner: Step 1 — Pick a theme. Step 2 — List food items with prices. Step 3 — List decorations with prices. Step 4 — Plan 3 games. Step 5 — Add up total cost.',
                  'Executor: Uses calculator for budget math → [TOOL_CALL: calculator | 25 + 15 + 30 + 20 + 10] → $100.',
                  'Critic: Scores 65/100 — "Budget adds up but no backup plan if something costs more. Missing a timeline."',
                  'Refinement: Adds a simple timeline (2pm-5pm) and a $10 buffer by reducing decoration cost.',
                  'Critic re-scores: 85/100 — "Realistic plan with buffer." Done!',
                ]}
                result="A detailed, budget-verified party plan with timeline. The system caught that the first plan had no backup budget and fixed it."
              />
            </div>
          </div>

          {/* ── What if similar tasks come up? ───────────────────────── */}
          <Section title="What Happens When You Ask Similar Things Again?" icon={Database} color="bg-purple-600" defaultOpen={true}>
            <p className="text-sm text-slate-300 leading-relaxed mt-1">
              The <strong className="text-white">Memory Agent</strong> remembers useful information from past tasks.
              So when you ask something similar, the system already has a head start.
            </p>
            <div className="space-y-4 mt-4">
              <div className="bg-slate-900/50 rounded-xl p-4 sm:p-5 border border-slate-700/50 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                <p className="text-xs font-bold text-purple-400 mb-2.5 tracking-wide uppercase">Scenario: You asked about earthquakes yesterday</p>
                <div className="space-y-3">
                  <p className="text-sm text-slate-300">
                    <span className="text-slate-500 font-medium text-xs uppercase tracking-wider block mb-1">Memory saved:</span>
                    <em className="text-purple-300 bg-purple-500/10 px-2 py-1 rounded">"User prefers simple language explanations of science topics. Include real-world examples."</em>
                  </p>
                  <p className="text-sm text-slate-300">
                    <span className="text-slate-500 font-medium text-xs uppercase tracking-wider block mb-1">Today you ask:</span>
                    <em className="text-blue-300 bg-blue-500/10 px-2 py-1 rounded">"Explain how volcanoes work"</em>
                  </p>
                  <p className="text-sm text-slate-400 leading-relaxed pt-2 border-t border-slate-700/50">
                    The Planner sees the saved memory and automatically plans to use simple words and include a real volcano example — without you having to ask for that style again.
                  </p>
                </div>
              </div>
              
              <div className="bg-slate-900/50 rounded-xl p-4 sm:p-5 border border-slate-700/50 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                <p className="text-xs font-bold text-purple-400 mb-2.5 tracking-wide uppercase">Scenario: You planned a party last month</p>
                <div className="space-y-3">
                  <p className="text-sm text-slate-300">
                    <span className="text-slate-500 font-medium text-xs uppercase tracking-wider block mb-1">Memory saved:</span>
                    <em className="text-purple-300 bg-purple-500/10 px-2 py-1 rounded">"Budget planning tasks need a backup buffer. User likes timeline-based plans."</em>
                  </p>
                  <p className="text-sm text-slate-300">
                    <span className="text-slate-500 font-medium text-xs uppercase tracking-wider block mb-1">This month you ask:</span>
                    <em className="text-blue-300 bg-blue-500/10 px-2 py-1 rounded">"Plan a school bake sale with $50 budget"</em>
                  </p>
                  <p className="text-sm text-slate-400 leading-relaxed pt-2 border-t border-slate-700/50">
                    The system already includes a backup buffer and a timeline in the first draft — so the Critic gives a higher score on the first try, and fewer refinement rounds are needed.
                  </p>
                </div>
              </div>
            </div>
          </Section>

          {/* ── Quick summary ────────────────────────────────────────── */}
          <div className="bg-gradient-to-r from-blue-600/10 to-emerald-500/10 border border-slate-700/50 rounded-xl p-5 sm:p-6 shadow-sm">
            <h3 className="text-lg font-bold text-white mb-4">Quick Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {[
                'You type one goal, and 5 agents work together to complete it.',
                'The Critic checks the work and the system fixes mistakes on its own.',
                'Tools like calculator and web search make answers more accurate.',
                'Memory makes the system smarter with every task you give it.',
                'You see every step — the plan, the score, and what was improved.',
                'Regular chatbots just give one answer. This gives you a verified answer.',
              ].map((point, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="leading-relaxed">{point}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="h-8" />
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;