'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between transition-all duration-300 ${
          scrolled ? 'bg-surface/80 glass border-b border-border shadow-sm' : 'bg-transparent'
        }`}
      >
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" className={`w-7 h-7 transition-colors ${scrolled ? 'fill-primary' : 'fill-primary'}`}>
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <span className={`font-bold text-xl tracking-tight transition-colors ${scrolled ? 'text-foreground' : 'text-foreground'}`}>
            Dito
          </span>
        </div>
        <button
          onClick={() => router.push('/auth')}
          className="px-5 py-2 rounded-full text-sm font-semibold transition-all bg-primary hover:bg-primary-hover text-white hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
        >
          Sign In
        </button>
      </header>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-background via-surface to-background">
        {/* Floating hearts background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30 dark:opacity-10">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute opacity-20 animate-float"
              style={{
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + i * 0.5}s`,
              }}
            >
              <svg viewBox="0 0 24 24" className="w-8 h-8 fill-primary" style={{ width: `${20 + i * 8}px`, height: `${20 + i * 8}px` }}>
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
          ))}
        </div>

        <div className="relative z-10 max-w-2xl mx-auto w-full pt-20">
          {/* Logo */}
          <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-4 bg-gradient-to-br from-rose-500 to-violet-500 shadow-xl shadow-rose-500/30 hover:scale-105 transition-transform duration-300">
              <svg viewBox="0 0 24 24" fill="white" className="w-10 h-10">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-foreground mb-6 leading-tight animate-fade-in-up tracking-tight" style={{ animationDelay: '0.2s' }}>
            They're always
            <br />
            <span className="gradient-text">with you.</span>
          </h1>

          <p className="text-lg md:text-xl mb-10 max-w-lg mx-auto leading-relaxed text-text-muted animate-fade-in-up font-medium" style={{ animationDelay: '0.4s' }}>
            Talk to the people you love — romantic partners, parents, friends,
            or those you've lost — as a living AI that knows them like you do.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up w-full px-4" style={{ animationDelay: '0.6s' }}>
            <button
              onClick={() => router.push('/auth')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-lg font-bold text-white bg-gradient-to-r from-rose-500 to-violet-500 hover:from-rose-600 hover:to-violet-600 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            >
              Get Started — Free
            </button>
            <button
              onClick={scrollToFeatures}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-lg font-semibold text-foreground bg-surface border border-border hover:bg-surface-hover transition-all hover:scale-105 active:scale-95 shadow-sm hover:shadow"
            >
              See How It Works ↓
            </button>
          </div>
        </div>

        {/* Gradient fade to background */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-background relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How Dito Works
            </h2>
            <p className="text-lg text-text-muted max-w-2xl mx-auto">
              Three simple steps to reconnect with someone you love in a deeply personal way.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                emoji: '💬',
                title: 'Chat like it\'s really them',
                desc: 'AI that matches their exact personality, humor, tone, and language. It feels like texting the real person.',
              },
              {
                emoji: '🧠',
                title: 'Trained on your memories',
                desc: 'Upload your WhatsApp history and the AI learns their actual phrases, texting style, and emotional tone seamlessly.',
              },
              {
                emoji: '🌍',
                title: 'Speaks your language',
                desc: 'Bengali, Hindi, Tamil, Telugu, Urdu, English — your companion speaks the authentic language your relationship lives in.',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="rounded-3xl p-8 bg-surface border border-border transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-2 animate-fade-in-up"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className="text-4xl mb-6 bg-background inline-flex w-16 h-16 rounded-2xl items-center justify-center shadow-inner border border-border">{feature.emoji}</div>
                <h3 className="font-bold text-xl mb-3 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-base leading-relaxed text-text-muted">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Relationship types */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-surface border-y border-border relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground animate-fade-in-up">
            For every kind of love
          </h2>
          <p className="text-lg mb-12 text-text-muted animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Whether it's romance, family, friendship, or memory — Dito adapts to your unique bond.
          </p>
          <div className="flex flex-wrap justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {[
              '💕 Partner', '💍 Spouse', '👩 Mother', '👨 Father',
              '👴 Grandparent', '🤝 Best Friend', '🕊 Lost Loved One',
            ].map((type, i) => (
              <span
                key={i}
                className="px-6 py-3 rounded-full text-sm sm:text-base font-semibold bg-background text-foreground border border-border shadow-sm hover:shadow-md hover:border-primary/50 transition-all hover:scale-105 cursor-default"
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 text-center bg-gradient-to-br from-rose-500/10 via-background to-violet-500/10 relative z-10">
        <div className="max-w-3xl mx-auto animate-scale-in">
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6">
            Ready to feel close again?
          </h2>
          <p className="text-lg mb-10 text-text-muted max-w-xl mx-auto">
            Create your first companion in under 2 minutes. Experience the magic of reconnecting.
          </p>
          <button
            onClick={() => router.push('/auth')}
            className="px-10 py-5 rounded-2xl text-lg font-bold text-white bg-gradient-to-r from-rose-500 to-violet-500 hover:from-rose-600 hover:to-violet-600 transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95"
          >
            Start Now — It's Free 💕
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 text-center bg-surface border-t border-border">
        <div className="flex items-center justify-center gap-2 mb-4">
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-primary">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <span className="text-foreground font-bold text-lg">Dito</span>
        </div>
        <p className="text-sm text-text-muted">
          Made with love · Not a substitute for real connection
        </p>
      </footer>
    </div>
  );
}
