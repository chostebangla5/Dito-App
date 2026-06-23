'use client';

import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 p-1.5 bg-surface/80 glass border border-border rounded-full shadow-lg animate-fade-in-up">
      <button
        onClick={() => setTheme('light')}
        className={`p-2.5 rounded-full transition-all duration-300 ${
          theme === 'light' 
            ? 'bg-primary text-white scale-100 shadow-md' 
            : 'text-text-muted hover:text-foreground hover:bg-surface-hover scale-95'
        }`}
        title="Light Mode"
        aria-label="Light Mode"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-2.5 rounded-full transition-all duration-300 ${
          theme === 'dark' 
            ? 'bg-primary text-white scale-100 shadow-md' 
            : 'text-text-muted hover:text-foreground hover:bg-surface-hover scale-95'
        }`}
        title="Dark Mode"
        aria-label="Dark Mode"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
      </button>
      <button
        onClick={() => setTheme('transparent')}
        className={`p-2.5 rounded-full transition-all duration-300 ${
          theme === 'transparent' 
            ? 'bg-gradient-to-br from-rose-500 to-violet-500 text-white scale-100 shadow-md' 
            : 'text-text-muted hover:text-foreground hover:bg-surface-hover scale-95'
        }`}
        title="Transparent Mode"
        aria-label="Transparent Mode"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m2 22 1-1h3l9-9"/><path d="M3 21v-3l9-9"/><path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z"/></svg>
      </button>
    </div>
  );
}
