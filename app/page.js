"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";

// Enhanced Preview Board Component
function PreviewBoard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="w-full max-w-5xl mx-auto bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-4 md:p-6 shadow-2xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-3 h-3 rounded-full bg-red-500"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
        <span className="ml-4 text-sm text-gray-400">Project Dashboard</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pending Column */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-200">Pending</h3>
            <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">3</span>
          </div>
          <div className="space-y-3">
            {[
              { title: "Design System Setup", priority: "high" },
              { title: "User Authentication", priority: "medium" },
              { title: "Database Migration", priority: "low" }
            ].map((task, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="bg-gray-800 border border-gray-700 rounded-lg p-3 group hover:border-blue-500/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <h4 className="text-sm font-medium text-gray-100">{task.title}</h4>
                  <span className={`text-xs px-2 py-1 rounded ${
                    task.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                    task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-green-500/20 text-green-300'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Completed Column */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-200">Completed</h3>
            <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">2</span>
          </div>
          <div className="space-y-3">
            {[
              { title: "Project Kickoff", completed: true },
              { title: "Requirements Gathering", completed: true }
            ].map((task, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="bg-gray-800 border border-gray-700 rounded-lg p-3 opacity-75"
              >
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-medium text-gray-300 line-through">{task.title}</h4>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Stats Component
function StatsSection() {
  const stats = [
    { number: "10K+", label: "Active Users" },
    { number: "50K+", label: "Tasks Completed" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Support" }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 py-12 md:py-16"
      >
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="text-center"
          >
            <div className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              {stat.number}
            </div>
            <div className="text-gray-400 text-sm">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

// Testimonials Component
function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Manager",
      company: "TechCorp",
      content: "TaskBoard has transformed how our team collaborates. The intuitive drag-and-drop interface makes project management effortless.",
      avatar: "SC"
    },
    {
      name: "Marcus Johnson",
      role: "Team Lead",
      company: "StartupXYZ",
      content: "Simple, powerful, and elegant. Everything we needed for task management without the complexity of other tools.",
      avatar: "MJ"
    },
    {
      name: "Emily Rodriguez",
      role: "Designer",
      company: "Creative Studio",
      content: "The clean interface and smooth animations make task management actually enjoyable. Highly recommended!",
      avatar: "ER"
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-16 md:py-20"
      >
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6"
          >
            Loved by teams worldwide
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base md:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
          >
            See what our users say about their experience with TaskBoard
          </motion.p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-colors"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-gray-100">{testimonial.name}</div>
                  <div className="text-sm text-gray-400">{testimonial.role} at {testimonial.company}</div>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed">{testimonial.content}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}

export default function Home() {
  const [user, setUser] = useState(null);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const scaleParallax = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const opacityParallax = useTransform(scrollYProgress, [0, 1], [1, 0.3]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user || null))
      .catch(() => setUser(null));
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0a0f1a] via-[#0b1320] to-[#0e1726] text-gray-100 overflow-x-hidden">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-600/20 to-cyan-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-l from-purple-600/20 to-fuchsia-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, -50, 0],
            x: [0, 30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/3 left-1/2 w-64 h-64 bg-gradient-to-br from-emerald-600/15 to-teal-500/15 rounded-full blur-2xl"
        />
      </div>

      {/* Enhanced Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="sticky top-0 z-50"
      >
        <div className="mx-4 my-4 rounded-2xl border border-white/10 bg-black/20 backdrop-blur-xl shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3"
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/30" />
                <div className="absolute inset-0 w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 blur-sm opacity-50" />
              </div>
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                TaskBoard
              </span>
            </motion.div>
            
            <div className="flex items-center gap-3 md:gap-4">
              {user ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="hidden sm:flex items-center gap-3 md:gap-4 text-sm"
                >
                  <div className="px-3 md:px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border border-blue-500/30 backdrop-blur-sm">
                    Welcome back, <span className="font-semibold">{user.username}</span>
                  </div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/dashboard"
                      className="px-4 md:px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium shadow-lg shadow-blue-500/25 transition-all duration-200"
                    >
                      Dashboard
                    </Link>
                  </motion.div>
                </motion.div>
              ) : (
                <div className="flex items-center gap-3">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/login"
                      className="px-3 md:px-4 py-2 rounded-lg border border-white/20 text-sm hover:bg-white/10 transition-colors backdrop-blur-sm"
                    >
                      Sign In
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/register"
                      className="px-4 md:px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium shadow-lg shadow-blue-500/25 transition-all duration-200"
                    >
                      Get Started
                    </Link>
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Enhanced Hero Section */}
      <motion.section
        ref={heroRef}
        className="relative pt-12 md:pt-20 pb-24 md:pb-32 !w-full"
      >
        <motion.div
          style={{ y: yParallax, scale: scaleParallax, opacity: opacityParallax }}
          className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8 md:mb-12"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-sm mb-8 backdrop-blur-sm mx-auto"
            >
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              The future of task management is here
            </motion.div>
            
            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 md:mb-8 leading-tight">
              <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
                Organize
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                Everything
              </span>
            </h1>
            
            {/* Hero Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="w-full max-w-4xl mx-auto mb-8 md:mb-12"
            >
              <p className="text-lg sm:text-xl md:text-2xl text-gray-300 leading-relaxed px-4 sm:px-6 md:px-8">
                Transform your workflow with our intuitive task management platform.
                <br className="hidden sm:block" />
                Drag, drop, and conquer your projects with effortless precision.
              </p>
            </motion.div>
            
            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 md:mb-16 px-4"
            >
              {user ? (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/dashboard"
                    className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold text-base md:text-lg shadow-2xl shadow-blue-500/25 transition-all duration-300 text-center"
                  >
                    Go to Dashboard →
                  </Link>
                </motion.div>
              ) : (
                <>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/register"
                      className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold text-base md:text-lg shadow-2xl shadow-blue-500/25 transition-all duration-300 text-center"
                    >
                      Start Free Trial
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/login"
                      className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 rounded-xl border border-white/20 text-white font-semibold text-base md:text-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-sm text-center"
                    >
                      Watch Demo
                    </Link>
                  </motion.div>
                </>
              )}
            </motion.div>
          </motion.div>
          
          {/* Preview Board */}
          <div className="px-4 sm:px-6 lg:px-8">
            <PreviewBoard />
          </div>
        </motion.div>
      </motion.section>

      {/* Stats Section */}
      <section className="py-12 md:py-16">
        <StatsSection />
      </section>

      {/* Enhanced Features Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-16 md:py-24 lg:py-32"
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-16 lg:mb-20">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6"
            >
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Everything you need to
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                stay organized
              </span>
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="w-full max-w-4xl mx-auto"
            >
              <p className="text-lg md:text-xl text-gray-400 leading-relaxed px-4 sm:px-6">
                Powerful features designed to streamline your workflow
                <br className="hidden sm:block" />
                and boost productivity
              </p>
            </motion.div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: "🎯",
                title: "Drag & Drop",
                description: "Intuitive task organization with smooth drag-and-drop functionality across columns"
              },
              {
                icon: "🔐",
                title: "Secure Authentication",
                description: "Enterprise-grade security with JWT authentication and encrypted user data"
              },
              {
                icon: "📱",
                title: "Responsive Design",
                description: "Perfect experience on any device - desktop, tablet, or mobile"
              },
              {
                icon: "⚡",
                title: "Real-time Updates",
                description: "Instant synchronization across all your devices and team members"
              },
              {
                icon: "🎨",
                title: "Beautiful Interface",
                description: "Clean, modern design that makes task management a pleasure"
              },
              {
                icon: "🚀",
                title: "Lightning Fast",
                description: "Optimized performance for seamless user experience"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group relative p-6 md:p-8 rounded-2xl bg-gradient-to-b from-gray-900/50 to-gray-900/20 border border-white/10 backdrop-blur-sm hover:border-blue-500/30 transition-all duration-300"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="text-3xl md:text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-lg md:text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed text-sm md:text-base">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Testimonials */}
      <section className="py-12 md:py-16">
        <TestimonialsSection />
      </section>

      {/* Enhanced CTA Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-16 md:py-24 lg:py-32"
      >
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="relative p-8 md:p-12 rounded-3xl bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-teal-500/10 border border-white/10 backdrop-blur-sm overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-3xl" />
              <div className="relative">
                {/* CTA Heading */}
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
                  <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Ready to transform
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    your workflow?
                  </span>
                </h2>
                
                {/* CTA Description */}
                <div className="w-full max-w-3xl mx-auto mb-8 md:mb-10">
                  <p className="text-lg md:text-xl text-gray-300 leading-relaxed px-4 sm:px-6">
                    Join thousands of teams already using TaskBoard
                    <br className="hidden sm:block" />
                    to streamline their projects and boost productivity.
                  </p>
                </div>
                
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
                  {user ? (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        href="/dashboard"
                        className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold text-base md:text-lg shadow-2xl shadow-blue-500/25 transition-all duration-300 text-center"
                      >
                        Go to Dashboard →
                      </Link>
                    </motion.div>
                  ) : (
                    <>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link
                          href="/register"
                          className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold text-base md:text-lg shadow-2xl shadow-blue-500/25 transition-all duration-300 text-center"
                        >
                          Get Started Free
                        </Link>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link
                          href="/login"
                          className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 rounded-xl border border-white/20 text-white font-semibold text-base md:text-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-sm text-center"
                        >
                          Sign In
                        </Link>
                      </motion.div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Enhanced Footer */}
      <footer className="border-t border-white/10 py-8 md:py-12">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between text-center md:text-left">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500" />
              <span className="font-semibold text-lg">TaskBoard</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2025 TaskBoard. Developed by Khaliq Ansari.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
