"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState, useRef } from "react";

function PreviewBoard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mx-auto w-full max-w-4xl rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-2xl shadow-blue-900/20"
    >
      <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
        </div>
        <div className="text-sm text-white/70">Preview</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
        {["Backlog", "In Progress", "Done"].map((col, i) => (
          <div key={col} className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
            <div className="mb-3 text-sm font-medium text-white/90 flex items-center justify-between">
              <span>{col}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10">{i === 2 ? 3 : 4}</span>
            </div>
            <div className="space-y-3">
              {[1, 2, 3, i !== 2 ? 4 : null].filter(Boolean).map((n) => (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  key={`${col}-${n}`}
                  className="rounded-lg border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-3"
                >
                  <div className="text-sm font-semibold text-white/90">Task {n}</div>
                  <div className="text-xs text-white/60 mt-1">Polished interactions and subtle motion.</div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function Home() {
  const [user, setUser] = useState(null);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const scaleParallax = useTransform(scrollYProgress, [0, 1], [1, 1.06]);

  useEffect(() => {
    let mounted = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => { if (!mounted) return; setUser(d?.user ?? null); })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0a0f1a] via-[#0b1320] to-[#0e1726] text-gray-100 overflow-x-clip">
      {/* Animated gradient beams */}
      <motion.div aria-hidden initial={{ opacity: 0, y: -40 }} animate={{ opacity: 0.25, y: 0 }} transition={{ duration: 1 }} className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[40rem] w-[40rem] rounded-full bg-gradient-to-b from-blue-600/30 via-cyan-500/20 to-transparent blur-3xl" />
      <motion.div aria-hidden initial={{ opacity: 0, y: 40 }} animate={{ opacity: 0.2, y: 0 }} transition={{ duration: 1.2, delay: 0.1 }} className="pointer-events-none absolute -bottom-40 right-1/3 h-[30rem] w-[30rem] rounded-full bg-gradient-to-t from-purple-600/20 via-fuchsia-500/20 to-transparent blur-3xl" />

      {/* Glass nav */}
      <div className="sticky top-0 z-30">
        <div className="mx-4 my-4 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl">
          <div className="container mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-block h-8 w-8 rounded-lg bg-blue-500 shadow-lg shadow-blue-500/30" />
              <span className="font-semibold tracking-tight">TaskBoard</span>
            </div>
            <div className="flex items-center gap-3">
              {user ? (
                <div className="hidden sm:flex items-center gap-3 text-sm">
                  <div className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30">Signed in as <span className="font-semibold">{user.username}</span></div>
                  <Link href="/dashboard" className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium shadow shadow-blue-500/20">Dashboard</Link>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/login" className="px-3 py-2 rounded-lg border border-white/10 text-sm hover:bg-white/5">Log in</Link>
                  <Link href="/register" className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium shadow shadow-blue-500/20">Get Started</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section ref={heroRef} className="container mx-auto px-6 pt-14 pb-10 md:pt-24 md:pb-16 relative">
        <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center text-5xl md:text-7xl font-extrabold tracking-tight">
          Think it. Plan it. Ship it.
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }} className="mt-4 text-center max-w-2xl mx-auto text-base md:text-lg text-white/70">
          A premium productivity canvas for boards and tasks—crafted with motion, clarity, and focus.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="mt-8 flex items-center justify-center gap-3">
          <Link href={user ? "/dashboard" : "/register"} className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium shadow shadow-blue-500/20">
            {user ? "Go to Dashboard" : "Get Started Free"}
          </Link>
          {!user && (
            <Link href="/login" className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-white/10 text-sm hover:bg-white/5">
              I already have an account
            </Link>
          )}
        </motion.div>

        {/* Parallax product preview */}
        <motion.div style={{ y: yParallax, scale: scaleParallax }} className="mt-14">
          <PreviewBoard />
        </motion.div>
      </section>

      {/* Feature grid */}
      <section className="container mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Effortless drag", desc: "Reorder tasks naturally—no handles, just move." },
            { title: "Secure by default", desc: "JWT in HTTP-only cookies; your work stays yours." },
            { title: "Responsive & refined", desc: "Pixel-perfect on every device with buttery motion." },
          ].map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.5, delay: i * 0.06 }} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
              <div className="mb-3 h-10 w-10 rounded-lg bg-blue-500/15 text-blue-300 flex items-center justify-center font-bold">
                {i + 1}
              </div>
              <h3 className="text-lg font-semibold text-white/90">{f.title}</h3>
              <p className="mt-2 text-sm text-white/70">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="relative">
        <div className="container mx-auto px-6 pb-20">
          <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.5 }} className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-8 md:p-10 backdrop-blur-xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="text-2xl font-semibold">Work beautifully in dark.</h4>
                <p className="text-white/70 mt-1">Boards, tasks, motion—everything crafted to feel premium.</p>
              </div>
              <div className="flex gap-3">
                <Link href={user ? "/dashboard" : "/register"} className="px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium shadow shadow-blue-500/20">
                  {user ? "Open Dashboard" : "Create free account"}
                </Link>
                {!user && (
                  <Link href="/login" className="px-6 py-3 rounded-xl border border-white/10 text-sm hover:bg-white/5">Log in</Link>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
