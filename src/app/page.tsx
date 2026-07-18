"use client";

import Link from "next/link";
import * as React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  MessageCircle,
  PieChart,
  Send,
} from "lucide-react";
import { ArcLogo, ArcMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuroraBackground } from "@/components/landing/aurora-background";
import { FloatingParticles } from "@/components/landing/floating-particles";
import { fadeSlideUp, staggerContainer, revealViewport } from "@/components/landing/motion-variants";

const features = [
  {
    icon: Sparkles,
    title: "AI that reads your wallet",
    body: "FinPilot watches every transaction and turns it into plain-English summaries — weekly, monthly, on demand.",
  },
  {
    icon: PieChart,
    title: "Real flow, not guesses",
    body: "Every send and receive is pulled live from Arc Testnet, so what you see is exactly what's on-chain.",
  },
  {
    icon: Send,
    title: "One smart wallet, five actions",
    body: "Deposit, withdraw, send, receive, and review history — nothing else to learn, nothing else to configure.",
  },
  {
    icon: MessageCircle,
    title: "Ask it anything",
    body: "\u201CWhat's my biggest transaction?\u201D Type a question, get an answer grounded in your real activity.",
  },
  {
    icon: ShieldCheck,
    title: "Built for Arc Testnet",
    body: "A single, focused chain connection with real network detection — no switcher to get wrong.",
  },
  {
    icon: Zap,
    title: "Real signed transactions",
    body: "Every action is signed by your own wallet — MetaMask, Rabby, OKX, or WalletConnect — with a real explorer link.",
  },
];

const steps = [
  { label: "Connect", detail: "Link MetaMask, Rabby, OKX, or WalletConnect in one tap." },
  { label: "Activate", detail: "Turn on FinPilot monitoring for your address." },
  { label: "Name it", detail: "Choose a username your contacts will recognize." },
  { label: "Operate", detail: "Let FinPilot AI narrate your finances from real, live data." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-clip">
      <Nav />
      <Hero />
      <TrustStrip />
      <Features />
      <HowItWorks />
      <WalletPreview />
      <CTA />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mt-4 glass rounded-2xl px-4 py-3 flex items-center justify-between shadow-[0_1px_2px_rgba(16,24,64,0.04)]">
          <ArcLogo size={32} priority />
          <nav className="hidden md:flex items-center gap-8 text-sm text-ink-700">
            <a href="#features" className="hover:text-ink-900 transition-colors">
              Features
            </a>
            <a href="#how" className="hover:text-ink-900 transition-colors">
              How it works
            </a>
            <a href="#wallet" className="hover:text-ink-900 transition-colors">
              Smart wallet
            </a>
          </nav>
          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <Link href="/app">
              <Button size="sm">
                Launch App
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative overflow-hidden">
      <AuroraBackground />
      <FloatingParticles />
      <motion.div
        style={{ y, opacity }}
        className="relative mx-auto max-w-4xl px-6 pt-24 pb-16 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex"
        >
          <Badge variant="brand">
            <ArcMark size={14} />
            AI Financial Operating System for ARC
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mt-6 text-5xl md:text-6xl font-semibold tracking-tight text-ink-900 leading-[1.08]"
        >
          Your wallet,
          <br />
          <span className="gradient-text">narrated by AI.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12 }}
          className="mt-5 text-lg text-ink-500 max-w-xl mx-auto"
        >
          ARC Pilot pairs a non-custodial smart wallet with an AI agent that
          reads your real Arc Testnet activity — so you always know where you
          stand.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18 }}
          className="mt-8 flex items-center justify-center gap-3"
        >
          <Link href="/app">
            <Button size="lg">
              Get started — it&apos;s free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a href="#features">
            <Button size="lg" variant="secondary">
              See how it works
            </Button>
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-4 text-xs text-ink-400"
        >
          Real wallet signatures. No seed phrase ever requested. Arc Testnet only.
        </motion.p>
      </motion.div>
    </section>
  );
}

function TrustStrip() {
  const items = ["Arc Testnet", "AI Agent", "Non-custodial", "Real-time on-chain data"];
  return (
    <div className="mx-auto max-w-4xl px-6 pb-10">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={revealViewport}
        className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs font-medium text-ink-400"
      >
        {items.map((item) => (
          <motion.div key={item} variants={fadeSlideUp} className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--arc-violet)]" />
            {item}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-20">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={revealViewport}
        variants={staggerContainer}
        className="text-center mb-14"
      >
        <motion.p variants={fadeSlideUp} className="text-xs font-semibold uppercase tracking-wider text-[var(--arc-blue)]">
          Everything, minus the clutter
        </motion.p>
        <motion.h2 variants={fadeSlideUp} className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-ink-900">
          One wallet. One agent. Zero noise.
        </motion.h2>
      </motion.div>
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={revealViewport}
        variants={staggerContainer}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {features.map((f) => (
          <motion.div
            key={f.title}
            variants={fadeSlideUp}
            whileHover={{ y: -4 }}
            className="card card-hover p-6"
          >
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center mb-4"
              style={{ backgroundImage: "var(--arc-gradient-soft)" }}
            >
              <f.icon className="h-5 w-5 text-[var(--arc-blue)]" />
            </div>
            <h3 className="text-[15px] font-semibold text-ink-900">{f.title}</h3>
            <p className="mt-1.5 text-sm text-ink-500 leading-relaxed">{f.body}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-5xl px-6 py-20">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={revealViewport}
        variants={staggerContainer}
        className="text-center mb-14"
      >
        <motion.p variants={fadeSlideUp} className="text-xs font-semibold uppercase tracking-wider text-[var(--arc-blue)]">
          Onboarding
        </motion.p>
        <motion.h2 variants={fadeSlideUp} className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-ink-900">
          From zero to funded in under a minute
        </motion.h2>
      </motion.div>
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={revealViewport}
        variants={staggerContainer}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        {steps.map((s, i) => (
          <motion.div key={s.label} variants={fadeSlideUp} className="relative">
            <div className="card p-5 h-full">
              <div className="flex items-center justify-between mb-4">
                <span
                  className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                  style={{ backgroundImage: "var(--arc-gradient)" }}
                >
                  {i + 1}
                </span>
                {i < steps.length - 1 && (
                  <ArrowRight className="hidden lg:block h-4 w-4 text-ink-400" />
                )}
              </div>
              <h3 className="text-sm font-semibold text-ink-900">{s.label}</h3>
              <p className="mt-1 text-xs text-ink-500 leading-relaxed">{s.detail}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

function WalletPreview() {
  return (
    <section id="wallet" className="mx-auto max-w-5xl px-6 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={revealViewport}
          variants={staggerContainer}
        >
          <motion.p variants={fadeSlideUp} className="text-xs font-semibold uppercase tracking-wider text-[var(--arc-blue)]">
            Smart wallet
          </motion.p>
          <motion.h2 variants={fadeSlideUp} className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-ink-900">
            A single card for everything that matters
          </motion.h2>
          <motion.p variants={fadeSlideUp} className="mt-4 text-ink-500 leading-relaxed">
            Balance, live chart, and every core action — deposit, withdraw,
            send, receive, history — live in one glanceable panel, backed by
            your own signed transactions. No swaps, no bridges, no settings
            to dig through.
          </motion.p>
          <motion.div variants={fadeSlideUp} className="mt-6 flex flex-wrap gap-2">
            {["Deposit", "Withdraw", "Send", "Receive", "History"].map((a) => (
              <span
                key={a}
                className="text-xs font-medium px-3 py-1.5 rounded-full bg-surface-3 text-ink-700"
              >
                {a}
              </span>
            ))}
          </motion.div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={revealViewport}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -6 }}
          className="rounded-[26px] p-6 text-white relative overflow-hidden"
          style={{
            backgroundImage:
              "radial-gradient(120% 140% at 0% 0%, var(--wallet-700) 0%, var(--wallet-800) 45%, var(--wallet-900) 100%)",
            boxShadow: "var(--shadow-wallet)",
          }}
        >
          <div className="flex items-center justify-between">
            <ArcMark size={30} />
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-white/10 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Arc Testnet
            </span>
          </div>
          <p className="mt-6 text-xs text-white/50">Total balance</p>
          <p className="text-4xl font-semibold tabular mt-1">
            $4.38 <span className="text-base text-white/50 font-normal">USDC</span>
          </p>
          <div className="mt-5 h-16 flex items-end gap-1">
            {[40, 55, 45, 60, 50, 70, 65, 80, 72, 90, 85, 98].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-full bg-gradient-to-t from-[var(--arc-blue-2)] to-emerald-400 opacity-80"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={revealViewport}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-[28px] px-10 py-16 text-center text-white relative overflow-hidden"
        style={{ backgroundImage: "var(--arc-gradient)" }}
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(60% 90% at 90% 0%, rgba(255,255,255,0.25), transparent)",
          }}
        />
        <div className="relative">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Put an AI agent on your wallet
          </h2>
          <p className="mt-3 text-white/80 max-w-lg mx-auto">
            Connect a real wallet, activate ARC Pilot, and let FinPilot start
            reading your Arc Testnet activity in real time.
          </p>
          <Link href="/app">
            <Button size="lg" variant="secondary" className="mt-7 !text-ink-900">
              Launch ARC Pilot
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mx-auto max-w-6xl px-6 py-10 border-t border-border-subtle">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <ArcLogo size={26} />
        <p className="text-xs text-ink-400 text-center">
          Built with ❤️ by ItzAbhi — Crafting AI × Web3 Experiences
        </p>
        <a
          href="https://x.com/ItzAbhi0"
          target="_blank"
          rel="noreferrer"
          className="text-xs font-medium text-ink-500 hover:text-[var(--arc-blue)] transition-colors"
        >
          𝕏 @ItzAbhi0
        </a>
      </div>
    </footer>
  );
}
