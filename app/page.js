"use client";

import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (!mounted) return;
        setUser(d?.user ?? null);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 overflow-hidden">
      {/* Decorative gradient blobs */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 0.35, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full blur-3xl bg-gradient-to-br from-blue-500 to-cyan-400 dark:from-blue-600 dark:to-indigo-500"
      />
      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 0.25, scale: 1 }}
        transition={{ duration: 1.1 }}
        className="pointer-events-none absolute -bottom-24 -left-24 h-[28rem] w-[28rem] rounded-full blur-3xl bg-gradient-to-tr from-sky-400 to-purple-500 dark:from-fuchsia-600 dark:to-purple-700"
      />

      <header className="relative z-10">
        <div className="container mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-block h-8 w-8 rounded-lg bg-blue-500" />
            <span className="font-bold tracking-tight">TaskBoard</span>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Link href="/dashboard" className="px-3 py-1 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-sm">Dashboard</Link>
            ) : (
              <>
                <Link href="/login" className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-sm hover:bg-gray-50 dark:hover:bg-gray-700">Log in</Link>
                <Link href="/register" className="px-3 py-1 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-sm">Get Started</Link>
              </>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="container mx-auto px-6 pt-16 pb-10 md:pt-24 md:pb-16">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight"
          >
            Organize work with
            <span className="mx-2 inline-block bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-400 bg-clip-text text-transparent">
              clarity
            </span>
            and speed.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mt-4 max-w-2xl text-base md:text-lg text-gray-600 dark:text-gray-300"
          >
            Create boards, manage tasks, and reorder with effortless drag-and-drop. Light & dark themes, responsive design, and a delightful experience.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-8 flex flex-col sm:flex-row gap-3"
          >
            {user ? (
              <>
                <Link href="/dashboard" className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium shadow">
                  Go to Dashboard
                </Link>
                <a href="#features" className="inline-flex items-center justify-center px-5 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
                  Learn more
                </a>
              </>
            ) : (
              <>
                <Link href="/register" className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium shadow">
                  Get Started Free
                </Link>
                <Link href="/login" className="inline-flex items-center justify-center px-5 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
                  I already have an account
                </Link>
              </>
            )}
          </motion.div>
        </section>

        <section id="features" className="container mx-auto px-6 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Drag-and-drop",
                desc: "Reorder tasks smoothly with delightful motion.",
              },
              {
                title: "Protected & simple",
                desc: "JWT auth with secure cookies keeps your data yours.",
              },
              {
                title: "Responsive & themed",
                desc: "Looks great on any device with light/dark modes.",
              },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, delay: i * 0.05 }}
                className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm"
              >
                <div className="mb-3 h-10 w-10 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  {i + 1}
                </div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-6 py-6 text-sm text-gray-600 dark:text-gray-300 flex items-center justify-between">
          <p>© {new Date().getFullYear()} TaskBoard</p>
          <div className="flex gap-3">
            <a href="/login" className="hover:underline">Login</a>
            <a href="/register" className="hover:underline">Register</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
