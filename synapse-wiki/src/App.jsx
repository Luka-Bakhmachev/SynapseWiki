import { useEffect, useState } from "react";
import { isTauri } from "@tauri-apps/api/core";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Database,
  Download,
  Edit3,
  FileText,
  Globe,
  Layers,
  Link2,
  Lock,
  Network,
  Plus,
  Search,
  Shield,
  Sparkles,
  Split,
  X,
} from "lucide-react";
import KnowledgeManagementApp from "./synapsewiki_knowledge_management_app.js";

const features = [
  {
    icon: Network,
    title: "See the connections",
    description:
      "Explore your notes as an interactive graph. Follow ideas, spot isolated notes, and connect concepts visually.",
    accent: "indigo",
  },
  {
    icon: FileText,
    title: "Write in Markdown",
    description:
      "Keep notes in a quick editor with live preview, wikilinks, backlinks, and tags built in.",
    accent: "violet",
  },
  {
    icon: Globe,
    title: "Bring research in",
    description:
      "Search Wikipedia, preview related articles, and bring useful discoveries into your knowledge graph.",
    accent: "cyan",
  },
  {
    icon: Database,
    title: "Keep your vault close",
    description:
      "Use browser storage on the web or a folder of Markdown files on desktop. Export a JSON backup whenever you want a portable copy.",
    accent: "emerald",
  },
];

const sampleNotes = [
  { title: "Quantum Computing", folder: "Physics", active: true },
  { title: "Qubit", folder: "Physics" },
  { title: "Superposition", folder: "Physics" },
  { title: "Graph Theory", folder: "Math" },
];

function ProductPreview() {
  return (
    <div className="landing-preview relative mx-auto w-full max-w-[620px] overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-950 shadow-2xl shadow-indigo-950/50">
      <div className="flex h-11 items-center gap-2 border-b border-slate-800 bg-slate-900/90 px-4">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
        <div className="ml-3 flex items-center gap-2 text-[11px] font-medium text-slate-400">
          <Network className="h-3.5 w-3.5 text-indigo-400" />
          SynapseWiki
        </div>
        <span className="ml-auto rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-300">
          Local vault
        </span>
      </div>

      <div className="grid min-h-[310px] grid-cols-[150px_minmax(0,1fr)] sm:grid-cols-[180px_minmax(0,1fr)]">
        <aside className="border-r border-slate-800 bg-slate-900/50 p-3">
          <div className="mb-3 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            <span>Notes</span>
            <Plus className="h-3.5 w-3.5 text-indigo-400" />
          </div>
          <div className="space-y-1">
            {sampleNotes.map((note) => (
              <div
                key={note.title}
                className={`flex items-center gap-2 rounded-lg px-2 py-2 text-[10px] ${
                  note.active
                    ? "border border-indigo-500/20 bg-indigo-500/10 text-indigo-200"
                    : "text-slate-400"
                }`}
              >
                <FileText className="h-3 w-3 shrink-0" />
                <span className="min-w-0 flex-1 truncate">{note.title}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-slate-800 pt-3">
            <span className="mb-2 block text-[9px] font-semibold uppercase tracking-wider text-slate-500">
              Tags
            </span>
            <div className="flex flex-wrap gap-1">
              {["physics", "quantum", "math"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-slate-700 bg-slate-800/80 px-2 py-1 text-[9px] text-slate-400"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </aside>

        <div className="relative min-w-0 overflow-hidden bg-[#090d16]">
          <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/90 p-1.5 text-slate-400 shadow-lg">
            <span className="rounded-md bg-indigo-600 p-1.5 text-white">
              <Network className="h-3.5 w-3.5" />
            </span>
            <span className="p-1.5">
              <Split className="h-3.5 w-3.5" />
            </span>
            <span className="p-1.5">
              <Search className="h-3.5 w-3.5" />
            </span>
          </div>
          <svg
            className="h-full min-h-[310px] w-full"
            viewBox="0 0 430 310"
            role="img"
            aria-label="A sample knowledge graph connecting research notes"
          >
            <defs>
              <pattern
                id="landing-grid"
                width="28"
                height="28"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 28 0 L 0 0 0 28"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="1"
                  opacity="0.5"
                />
              </pattern>
              <filter id="landing-glow">
                <feGaussianBlur stdDeviation="7" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <rect width="100%" height="100%" fill="url(#landing-grid)" />
            <g stroke="#4f46e5" strokeOpacity="0.5" strokeWidth="1.5">
              <line x1="210" y1="153" x2="105" y2="91" />
              <line x1="210" y1="153" x2="322" y2="83" />
              <line x1="210" y1="153" x2="307" y2="235" />
              <line x1="210" y1="153" x2="103" y2="235" />
              <line x1="105" y1="91" x2="322" y2="83" />
              <line x1="105" y1="91" x2="103" y2="235" />
            </g>
            <g fill="#1e1b4b" stroke="#6366f1" strokeWidth="2">
              <circle cx="105" cy="91" r="22" />
              <circle cx="322" cy="83" r="19" />
              <circle cx="307" cy="235" r="20" />
              <circle cx="103" cy="235" r="17" />
            </g>
            <circle
              cx="210"
              cy="153"
              r="31"
              fill="#3730a3"
              stroke="#a5b4fc"
              strokeWidth="2"
              filter="url(#landing-glow)"
            />
            <g
              fill="#cbd5e1"
              fontFamily="Inter, sans-serif"
              fontSize="10"
              textAnchor="middle"
            >
              <text x="105" y="126">Qubit</text>
              <text x="322" y="116">Superposition</text>
              <text x="307" y="269">Entanglement</text>
              <text x="103" y="269">Graph Theory</text>
              <text x="210" y="198" fill="#fff" fontWeight="700">
                Quantum Computing
              </text>
            </g>
            <g fill="#818cf8">
              <circle cx="210" cy="122" r="2" />
              <circle cx="180" cy="162" r="2" />
              <circle cx="240" cy="162" r="2" />
            </g>
          </svg>
          <div className="absolute bottom-3 right-3 rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2 text-[10px] text-slate-400 shadow-lg">
            <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
            6 notes <span className="mx-1.5 text-slate-600">/</span> 16 links
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute -bottom-16 -right-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />
    </div>
  );
}

export default function App() {
  const isDesktopApp = isTauri();
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);

  useEffect(() => {
    if (!isSignInOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsSignInOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSignInOpen]);

  const enterWorkspace = () => {
    setIsSignInOpen(false);
    setShowWorkspace(true);
  };

  const handleDemoSignIn = (event) => {
    event.preventDefault();
    enterWorkspace();
  };

  if (showWorkspace) {
    return (
      <KnowledgeManagementApp onExit={() => setShowWorkspace(false)} />
    );
  }

  return (
    <main className="landing-page text-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-800/70 bg-slate-950/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a
            href="#home"
            className="flex items-center gap-2.5"
            aria-label="SynapseWiki home"
          >
            <span className="rounded-xl bg-gradient-to-br from-indigo-500 via-violet-600 to-cyan-400 p-2 shadow-lg shadow-indigo-500/20">
              <Network className="h-5 w-5 text-white" />
            </span>
            <span className="font-bold tracking-wide text-white">
              Synapse<span className="text-indigo-300">Wiki</span>
            </span>
          </a>

          <nav className="hidden items-center gap-8 text-sm text-slate-400 md:flex">
            <a className="transition hover:text-white" href="#features">
              Features
            </a>
            <a className="transition hover:text-white" href="#how-it-works">
              How it works
            </a>
            <a className="transition hover:text-white" href="#privacy">
              Your data
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSignInOpen(true)}
              className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white sm:px-4"
            >
              Sign in
            </button>
            <button
              onClick={enterWorkspace}
              className="inline-flex whitespace-nowrap items-center gap-2 rounded-lg bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-950/50 transition hover:bg-indigo-400 sm:px-4"
            >
              <span className="hidden sm:inline">Try the demo</span>
              <span className="sm:hidden">Demo</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <section
        id="home"
        className="landing-hero relative isolate overflow-hidden px-4 pb-20 pt-14 sm:px-6 sm:pt-20 lg:px-8 lg:pb-28 lg:pt-24"
      >
        <div className="landing-grid pointer-events-none absolute inset-0 -z-10 opacity-40" />
        <div className="landing-glow pointer-events-none absolute -right-32 top-0 -z-10 h-[520px] w-[520px] rounded-full blur-3xl" />

        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.92fr_1.08fr] lg:gap-10">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/5 px-3 py-1.5 text-xs font-medium text-indigo-200">
              <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
              A calmer way to connect what you know
            </div>
            <h1 className="text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Your notes are
              <span className="block bg-gradient-to-r from-indigo-300 via-violet-300 to-cyan-300 bg-clip-text text-transparent">
                better connected.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
              SynapseWiki turns Markdown notes into a living knowledge graph.
              Capture an idea, link it to what you already know, and see the
              bigger picture take shape.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={enterWorkspace}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-indigo-950/50 transition hover:-translate-y-0.5 hover:bg-indigo-400"
              >
                Explore the interactive demo
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsSignInOpen(true)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
              >
                Sign in
                <ArrowUpRight className="h-4 w-4 text-slate-400" />
              </button>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                Markdown-first
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                {isDesktopApp ? "Local Markdown files" : "Local browser storage"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                No setup to explore
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-8 -z-10 rounded-full bg-indigo-500/10 blur-3xl" />
            <ProductPreview />
            <div className="absolute -bottom-5 left-5 hidden items-center gap-3 rounded-xl border border-slate-700/80 bg-slate-900/95 p-3 shadow-xl sm:flex">
              <span className="rounded-lg bg-cyan-500/10 p-2 text-cyan-300">
                <Link2 className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-200">
                  Ideas, not folders
                </p>
                <p className="mt-0.5 text-[10px] text-slate-500">
                  Follow meaningful connections
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="border-y border-slate-800/70 bg-slate-900/30 px-4 py-20 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">
              Made for curious minds
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              A workspace that thinks in connections
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-400 sm:text-base">
              Everything you need to build a personal wiki, with the graph and
              research tools right alongside your notes.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, description, accent }) => (
              <article
                key={title}
                className="group rounded-2xl border border-slate-800 bg-slate-950/70 p-5 transition hover:-translate-y-1 hover:border-slate-700 hover:bg-slate-900"
              >
                <span
                  className={`mb-5 inline-flex rounded-xl p-3 ${
                    accent === "indigo"
                      ? "bg-indigo-500/10 text-indigo-300"
                      : accent === "violet"
                        ? "bg-violet-500/10 text-violet-300"
                        : accent === "cyan"
                          ? "bg-cyan-500/10 text-cyan-300"
                          : "bg-emerald-500/10 text-emerald-300"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="px-4 py-20 sm:px-6 lg:px-8"
      >
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
              Start with one idea
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Small notes.
              <br />
              <span className="text-slate-500">Unexpected connections.</span>
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-slate-400 sm:text-base">
              Write naturally, connect a few concepts with wikilinks, and let
              your graph help you find the threads worth following.
            </p>
            <button
              onClick={enterWorkspace}
              className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-indigo-300 transition hover:text-indigo-200"
            >
              Open the demo vault <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                number: "01",
                icon: Edit3,
                title: "Capture",
                text: "Write a quick Markdown note.",
              },
              {
                number: "02",
                icon: Link2,
                title: "Connect",
                text: "Link it to related ideas.",
              },
              {
                number: "03",
                icon: Layers,
                title: "Discover",
                text: "Explore your growing graph.",
              },
            ].map(({ number, icon: Icon, title, text }) => (
              <article
                key={number}
                className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold tracking-widest text-slate-600">
                    {number}
                  </span>
                  <Icon className="h-4 w-4 text-indigo-300" />
                </div>
                <h3 className="mt-8 font-semibold text-slate-100">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="privacy"
        className="px-4 pb-20 sm:px-6 lg:px-8"
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-8 rounded-3xl border border-indigo-400/15 bg-gradient-to-br from-indigo-950/50 via-slate-900/80 to-cyan-950/30 p-6 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-300">
              <Shield className="h-4 w-4" /> Your vault stays yours
            </span>
            <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
              Local-first by design.
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-400 sm:text-base">
              {isDesktopApp
                ? "Desktop notes are saved as Markdown files in your chosen folder. Web notes use browser storage."
                : "Notes are saved in your browser."}{" "}
              Export a backup whenever you need one. The demo doesn&apos;t
              require an account.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs text-slate-300">
              <Lock className="h-3.5 w-3.5 text-emerald-300" />
              {isDesktopApp ? "Markdown files" : "Browser storage"}
            </span>
            <span className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs text-slate-300">
              <Download className="h-3.5 w-3.5 text-cyan-300" />
              JSON backup
            </span>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800/70 px-4 py-7 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-xs text-slate-500 sm:flex-row">
          <span className="inline-flex items-center gap-2">
            <Network className="h-4 w-4 text-indigo-400" />
            SynapseWiki
          </span>
          <span>Make knowledge easier to navigate.</span>
        </div>
      </footer>

      {isSignInOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsSignInOpen(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="sign-in-title"
            className="my-auto w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl shadow-black/50 sm:p-8"
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <span className="mb-3 inline-flex rounded-xl bg-indigo-500/10 p-2.5 text-indigo-300">
                  <Network className="h-5 w-5" />
                </span>
                <h2 id="sign-in-title" className="text-xl font-bold text-white">
                  Welcome to SynapseWiki
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Sign in to explore the demo workspace.
                </p>
              </div>
              <button
                onClick={() => setIsSignInOpen(false)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                aria-label="Close sign in"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs leading-5 text-amber-100/80">
              Demo access only. Accounts aren&apos;t connected yet; these
              fields are not sent or saved.
            </div>

            <form onSubmit={handleDemoSignIn} className="space-y-4">
              <label className="block space-y-1.5 text-sm font-medium text-slate-300">
                Email
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  autoFocus
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400"
                />
              </label>
              <label className="block space-y-1.5 text-sm font-medium text-slate-300">
                Password
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  required
                  placeholder="Enter any demo password"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400"
                />
              </label>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-400"
              >
                Continue to demo <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-5 text-center">
              <button
                onClick={enterWorkspace}
                className="text-xs font-medium text-slate-400 underline decoration-slate-600 underline-offset-4 transition hover:text-white"
              >
                Skip sign in and open the demo
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
