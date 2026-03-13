"use client";

import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { ArrowRight, CheckCheck, Layers, Users, Zap } from "lucide-react";
import Link from "next/link";

function TrelloIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M21.147 0H2.853A2.86 2.86 0 000 2.853v18.294A2.86 2.86 0 002.853 24h18.294A2.86 2.86 0 0024 21.147V2.853A2.86 2.86 0 0021.147 0zM10.34 17.287a.953.953 0 01-.953.953h-4a.954.954 0 01-.954-.953V5.38a.953.953 0 01.954-.953h4a.954.954 0 01.953.953zm9.233-5.467a.944.944 0 01-.953.947h-4a.947.947 0 01-.953-.947V5.38a.953.953 0 01.953-.953h4a.954.954 0 01.953.953z" />
    </svg>
  );
}

// Mini board preview card
function MiniCard({ title, color, delay }: { title: string; color: string; delay: string }) {
  return (
    <div
      className="bg-white rounded-lg px-3 py-2 shadow-md text-xs text-gray-700 font-medium flex items-center gap-2 animate-[float_3s_ease-in-out_infinite]"
      style={{ animationDelay: delay }}
    >
      <span className={`w-2 h-2 rounded-full ${color} flex-shrink-0`} />
      {title}
    </div>
  );
}

function MiniColumn({ title, cards }: { title: string; cards: { title: string; color: string }[] }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 w-48 flex-shrink-0">
      <p className="text-xs font-semibold text-white/90 mb-2 uppercase tracking-wider">{title}</p>
      <div className="space-y-2">
        {cards.map((c, i) => (
          <MiniCard key={i} title={c.title} color={c.color} delay={`${i * 0.4}s`} />
        ))}
      </div>
    </div>
  );
}

const FEATURES = [
  {
    icon: Layers,
    title: "Visual Boards",
    desc: "Organize anything with beautiful kanban boards. See your work at a glance.",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    icon: CheckCheck,
    title: "Task Tracking",
    desc: "Create cards, set due dates, assign people — never lose track of what matters.",
    gradient: "from-violet-500 to-violet-600",
  },
  {
    icon: Zap,
    title: "Drag & Drop",
    desc: "Move cards and lists effortlessly. Reorganize your workflow in seconds.",
    gradient: "from-orange-500 to-orange-600",
  },
  {
    icon: Users,
    title: "Made for Teams",
    desc: "Built to keep everyone in sync. No more chasing updates across apps.",
    gradient: "from-green-500 to-green-600",
  },
];

export default function HomePage() {
  const { isSignedIn } = useUser();

  return (
    <div className="min-h-screen bg-[#0d1117] text-white overflow-hidden">
      {/* ── Navbar ─────────────────────────────────────────────── */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2">
          <TrelloIcon className="h-6 w-6 text-blue-500" />
          <span className="font-bold text-lg">Trello</span>
        </div>
        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Go to Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <SignInButton>
                <button className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2">
                  Log in
                </button>
              </SignInButton>
              <SignUpButton>
                <button className="text-sm font-medium bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
                  Get Trello free
                </button>
              </SignUpButton>
            </>
          )}
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative pt-24 pb-20 px-6 text-center overflow-hidden">
        {/* Glowing blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            Boards · Lists · Cards
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold leading-tight mb-6">
            Organize work and life,{" "}
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              finally.
            </span>
          </h1>

          <p className="text-lg text-gray-400 max-w-xl mx-auto mb-10">
            Trello helps teams move work forward. Collaborate, manage projects,
            and reach new productivity peaks together.
          </p>

          {!isSignedIn ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <SignUpButton>
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-7 py-3.5 rounded-xl text-base transition-all hover:scale-105 shadow-lg shadow-blue-900/40">
                  Start for free <ArrowRight className="h-4 w-4" />
                </button>
              </SignUpButton>
              <SignInButton>
                <button className="border border-white/20 hover:border-white/40 text-gray-300 hover:text-white font-medium px-7 py-3.5 rounded-xl text-base transition-colors">
                  Sign in
                </button>
              </SignInButton>
            </div>
          ) : (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-7 py-3.5 rounded-xl transition-all hover:scale-105"
            >
              Open your boards <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {/* Mini board preview */}
        <div className="relative mt-20 max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl p-5 shadow-2xl shadow-blue-900/50">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-white/30" />
              <div className="w-3 h-3 rounded-full bg-white/30" />
              <div className="w-3 h-3 rounded-full bg-white/30" />
              <span className="ml-2 text-xs text-white/70 font-medium">Product Launch 🚀</span>
            </div>
            <div className="flex gap-3 overflow-hidden">
              <MiniColumn
                title="To Do"
                cards={[
                  { title: "Design landing page", color: "bg-blue-400" },
                  { title: "Set up CI/CD", color: "bg-yellow-400" },
                ]}
              />
              <MiniColumn
                title="In Progress"
                cards={[
                  { title: "Build auth flow", color: "bg-violet-400" },
                  { title: "Write unit tests", color: "bg-orange-400" },
                ]}
              />
              <MiniColumn
                title="Done"
                cards={[
                  { title: "DB schema design", color: "bg-green-400" },
                ]}
              />
            </div>
          </div>
          {/* Reflection */}
          <div className="absolute inset-x-8 -bottom-6 h-6 bg-blue-600/30 blur-xl rounded-full" />
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────── */}
      <section className="px-6 py-24 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Everything you need to ship faster
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Simple, flexible workflow tools that adapt to the way your team actually works.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/8 transition-colors"
            >
              <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${f.gradient} mb-4`}>
                <f.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section className="px-6 pb-24">
        <div className="max-w-2xl mx-auto text-center bg-gradient-to-br from-blue-600/20 to-violet-600/20 border border-white/10 rounded-3xl p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to get organized?</h2>
          <p className="text-gray-400 mb-8">
            Free forever. No credit card required.
          </p>
          {!isSignedIn ? (
            <SignUpButton>
              <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 font-semibold px-8 py-3.5 rounded-xl text-base transition-all hover:scale-105 shadow-lg shadow-blue-900/40">
                Create free account <ArrowRight className="h-4 w-4" />
              </button>
            </SignUpButton>
          ) : (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 font-semibold px-8 py-3.5 rounded-xl transition-all hover:scale-105"
            >
              View your boards <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-white/10 px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <TrelloIcon className="h-5 w-5 text-blue-500" />
          <span className="font-semibold text-gray-400">Trello Clone</span>
        </div>
        <span>Built with Next.js · Supabase · Clerk — by krishang</span>
        <span>© 2026</span>
      </footer>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}