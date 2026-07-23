"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import {
  Lock,
  Unlock,
  ShieldAlert,
  Terminal,
  KeyRound,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Eye,
  Code2,
  Globe,
  Briefcase,
  Star,
  ArrowRight,
} from "lucide-react"

/* ─────────────── constants ─────────────── */
const ACCESS_CODES = ["2707", "1907", "1919", "0707", "7777"]
const COUNTDOWN_START = 60

/* ─────────────── LOCKED SCREEN ─────────────── */
function LockedScreen({ onGetAccess }: { onGetAccess: () => void }) {
  return (
    <motion.div
      key="locked"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center text-center gap-8"
    >
      {/* Glowing lock */}
      <motion.div
        animate={{ boxShadow: ["0 0 20px #3b82f650", "0 0 60px #3b82f690", "0 0 20px #3b82f650"] }}
        transition={{ duration: 2.5, repeat: Infinity }}
        className="relative w-32 h-32 rounded-full bg-gradient-to-br from-blue-950 to-slate-900 border border-blue-500/40 flex items-center justify-center"
      >
        <motion.div
          animate={{ rotate: [0, -8, 8, 0] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
        >
          <Lock className="w-14 h-14 text-blue-400" />
        </motion.div>

        {/* orbiting dot */}
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border border-dashed border-blue-500/30"
        />
        <motion.span
          style={{ top: 0, left: "50%", translateX: "-50%", translateY: "-50%" }}
          className="absolute w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"
        />
      </motion.div>

      <div className="space-y-3 max-w-md">
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent"
        >
          Restricted Access
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-slate-400 text-lg"
        >
          This portfolio is protected. Request a time&#8209;limited access token to proceed.
        </motion.p>
      </div>

      {/* grid lines decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="absolute w-full h-px bg-blue-400" style={{ top: `${12.5 * (i + 1)}%` }} />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="absolute h-full w-px bg-blue-400" style={{ left: `${12.5 * (i + 1)}%` }} />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          onClick={onGetAccess}
          size="lg"
          className="relative gap-2 px-8 py-6 text-base font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_30px_#3b82f640] hover:shadow-[0_0_40px_#3b82f670] transition-shadow"
        >
          <KeyRound className="w-5 h-5" />
          Get Access
          <motion.span
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            <ArrowRight className="w-4 h-4" />
          </motion.span>
        </Button>
      </motion.div>
    </motion.div>
  )
}

/* ─────────────── CHALLENGE SCREEN ─────────────── */
function ChallengeScreen({
  onSuccess,
  onExpire,
}: {
  onSuccess: () => void
  onExpire: () => void
}) {
  const [seconds, setSeconds] = useState(COUNTDOWN_START)
  const [code, setCode] = useState("")
  const [shake, setShake] = useState(false)
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const expiredRef = useRef(false)

  /* countdown */
  useEffect(() => {
    const id = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(id)
          if (!expiredRef.current) {
            expiredRef.current = true
            onExpire()
          }
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [onExpire])

  /* auto-focus */
  useEffect(() => { inputRef.current?.focus() }, [])

  const handleSubmit = useCallback((value: string) => {
    if (ACCESS_CODES.includes(value)) {
      expiredRef.current = true          // prevent expire callback
      onSuccess()
    } else {
      setShake(true)
      setWrongAttempts((n) => n + 1)
      setTimeout(() => { setShake(false); setCode("") }, 600)
    }
  }, [onSuccess])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 4)
    setCode(val)
    if (val.length === 4) handleSubmit(val)
  }

  const pct = seconds / COUNTDOWN_START            // 0 → 1
  const radius = 54
  const circ = 2 * Math.PI * radius
  const dashOffset = circ * (1 - pct)
  const timerColor = seconds > 20 ? "#22d3ee" : seconds > 10 ? "#f59e0b" : "#ef4444"

  return (
    <motion.div
      key="challenge"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center gap-10 w-full max-w-sm"
    >
      {/* terminal header */}
      <div className="w-full rounded-xl border border-slate-700 bg-slate-900/80 backdrop-blur overflow-hidden shadow-2xl">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-700 bg-slate-800/60">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <span className="w-3 h-3 rounded-full bg-yellow-400" />
          <span className="w-3 h-3 rounded-full bg-green-500" />
          <Terminal className="w-3.5 h-3.5 text-slate-500 ml-2" />
          <span className="text-xs text-slate-500 font-mono">access-token.sh</span>
        </div>

        <div className="p-6 font-mono text-sm space-y-1">
          <p className="text-green-400">$ generating token<span className="animate-pulse">...</span></p>
          <p className="text-slate-400">{">"} session_id: <span className="text-cyan-400">0x4F2A</span></p>
          <p className="text-slate-400">{">"} expires_in: <span style={{ color: timerColor }}>{seconds}s</span></p>
          <p className="text-slate-400">{">"} attempts: <span className="text-yellow-400">{wrongAttempts}</span></p>
          <p className="text-slate-400">{">"} status: <span className="text-blue-400">AWAITING INPUT</span></p>
        </div>
      </div>

      {/* circular timer */}
      <div className="relative flex items-center justify-center">
        <svg width="130" height="130" className="-rotate-90">
          <circle cx="65" cy="65" r={radius} fill="none" stroke="#1e293b" strokeWidth="8" />
          <motion.circle
            cx="65"
            cy="65"
            r={radius}
            fill="none"
            stroke={timerColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 1s linear, stroke 0.5s ease" }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="font-mono text-4xl font-bold" style={{ color: timerColor }}>
            {String(seconds).padStart(2, "0")}
          </span>
          <span className="text-slate-500 text-xs mt-0.5">seconds</span>
        </div>
      </div>

      {/* code input */}
      <div className="w-full space-y-3">
        <p className="text-center text-slate-400 text-sm">Enter your 4-digit access code</p>

        <motion.div
          animate={shake ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          {/* digit boxes */}
          <div className="flex justify-center gap-3 mb-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-14 h-16 rounded-lg border-2 flex items-center justify-center text-2xl font-mono font-bold transition-colors ${
                  code[i]
                    ? "border-blue-500 bg-blue-950/60 text-blue-200"
                    : "border-slate-700 bg-slate-900/50 text-slate-700"
                }`}
              >
                {code[i] || "·"}
              </div>
            ))}
          </div>

          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={code}
            onChange={handleChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
            maxLength={4}
          />
        </motion.div>

        {wrongAttempts > 0 && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-red-400 text-xs font-mono"
          >
            <XCircle className="inline w-3.5 h-3.5 mr-1" />
            Invalid code — {wrongAttempts} failed attempt{wrongAttempts > 1 ? "s" : ""}
          </motion.p>
        )}

        <p className="text-center text-slate-600 text-xs font-mono">
          click anywhere above ↑ to type
        </p>
      </div>
    </motion.div>
  )
}

/* ─────────────── EXPIRED SCREEN ─────────────── */
function ExpiredScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <motion.div
      key="expired"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center gap-6 text-center max-w-sm"
    >
      <motion.div
        animate={{ rotate: [0, -5, 5, 0] }}
        transition={{ duration: 0.5, repeat: 2 }}
        className="w-20 h-20 rounded-full bg-red-950/60 border border-red-500/40 flex items-center justify-center"
      >
        <ShieldAlert className="w-10 h-10 text-red-400" />
      </motion.div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-red-400">Session Expired</h2>
        <p className="text-slate-500 text-sm font-mono">TOKEN_TIMEOUT — request a new token to continue</p>
      </div>

      <Button
        onClick={onRetry}
        variant="outline"
        className="gap-2 border-red-500/40 text-red-400 hover:bg-red-950/40"
      >
        <RefreshCw className="w-4 h-4" />
        Request New Token
      </Button>
    </motion.div>
  )
}

/* ─────────────── PORTFOLIO CONTENT ─────────────── */
const projects = [
  {
    title: "AI Analytics Platform",
    desc: "Real-time queue & crowd analytics powered by computer vision.",
    tags: ["Next.js", "Python", "OpenCV"],
    icon: <Eye className="w-5 h-5" />,
    color: "from-blue-600 to-cyan-500",
  },
  {
    title: "Event Management Suite",
    desc: "End-to-end conference & exhibition booking system at scale.",
    tags: ["React", "Node.js", "PostgreSQL"],
    icon: <Briefcase className="w-5 h-5" />,
    color: "from-violet-600 to-purple-500",
  },
  {
    title: "Multilingual SaaS",
    desc: "RTL-first web app with full Arabic & English localisation.",
    tags: ["TypeScript", "Tailwind", "i18n"],
    icon: <Globe className="w-5 h-5" />,
    color: "from-emerald-600 to-teal-500",
  },
  {
    title: "Design System Library",
    desc: "Component library with dark / light theme and motion system.",
    tags: ["Radix UI", "Framer Motion", "Storybook"],
    icon: <Code2 className="w-5 h-5" />,
    color: "from-orange-500 to-yellow-400",
  },
]

function PortfolioContent() {
  return (
    <motion.div
      key="portfolio"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-4xl space-y-12"
    >
      {/* unlocked badge */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="flex justify-center"
      >
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-green-500/40 bg-green-950/50 text-green-400 text-sm font-mono">
          <CheckCircle2 className="w-4 h-4" />
          Access Granted
        </span>
      </motion.div>

      {/* hero */}
      <div className="text-center space-y-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-5xl font-bold bg-gradient-to-r from-white via-blue-200 to-cyan-300 bg-clip-text text-transparent"
        >
          My Portfolio
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="text-slate-400 text-lg max-w-xl mx-auto"
        >
          A curated selection of projects — from AI dashboards to large-scale event platforms.
        </motion.p>
      </div>

      {/* project cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {projects.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="relative group rounded-2xl border border-slate-800 bg-slate-900/70 p-6 hover:border-slate-600 transition-colors overflow-hidden"
          >
            {/* gradient shimmer on hover */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-br ${p.color} transition-opacity`} />

            <div className={`mb-4 inline-flex p-2.5 rounded-xl bg-gradient-to-br ${p.color} text-white`}>
              {p.icon}
            </div>

            <h3 className="text-lg font-semibold text-white mb-1">{p.title}</h3>
            <p className="text-slate-400 text-sm mb-4">{p.desc}</p>

            <div className="flex flex-wrap gap-2">
              {p.tags.map((tag) => (
                <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="grid grid-cols-3 gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-6"
      >
        {[
          { label: "Projects", value: "24+" },
          { label: "Clients", value: "12" },
          { label: "Years Exp.", value: "5" },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-3xl font-bold text-white">{s.value}</p>
            <p className="text-slate-500 text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* review stars */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.85 }}
        className="flex justify-center gap-1"
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
        ))}
      </motion.div>
    </motion.div>
  )
}

/* ─────────────── PAGE ─────────────── */
type Phase = "locked" | "challenge" | "expired" | "unlocked"

export default function PortfolioPage() {
  const [phase, setPhase] = useState<Phase>("locked")
  const pathname = usePathname()

  // Always clear any persisted unlock on first mount so direct visits require a new token
  useEffect(() => {
    try { sessionStorage.removeItem("portfolio-unlocked") } catch (e) {}
  }, [])

  // When the user navigates away (client-side route change) lock the page again
  useEffect(() => {
    if (pathname && pathname !== "/portfolio") setPhase("locked")
  }, [pathname])

  // When the page is hidden/unloaded (tab switch, close, back) require new access
  useEffect(() => {
    const handleHide = () => {
      try { setPhase("locked") } catch (e) {}
    }

    const handlePageShow = () => {
      try { setPhase("locked") } catch (e) {}
    }

    const onVisibility = () => { if (document.hidden) handleHide() }

    document.addEventListener("visibilitychange", onVisibility)
    window.addEventListener("pagehide", handleHide)
    window.addEventListener("pageshow", handlePageShow)
    window.addEventListener("beforeunload", handleHide)

    return () => {
      document.removeEventListener("visibilitychange", onVisibility)
      window.removeEventListener("pagehide", handleHide)
      window.removeEventListener("pageshow", handlePageShow)
      window.removeEventListener("beforeunload", handleHide)
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Navbar />

      {/* subtle animated grid background */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(#3b82f6 1px,transparent 1px),linear-gradient(90deg,#3b82f6 1px,transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.15),transparent)]" />
      </div>

      <main className="relative flex-1 flex items-center justify-center px-4 py-24">
        <AnimatePresence mode="wait">
          {phase === "locked" && (
            <LockedScreen key="locked" onGetAccess={() => setPhase("challenge")} />
          )}
          {phase === "challenge" && (
            <ChallengeScreen
              key="challenge"
              onSuccess={() => setPhase("unlocked")}
              onExpire={() => setPhase("expired")}
            />
          )}
          {phase === "expired" && (
            <ExpiredScreen key="expired" onRetry={() => setPhase("challenge")} />
          )}
          {phase === "unlocked" && (
            <PortfolioContent key="unlocked" />
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  )
}
