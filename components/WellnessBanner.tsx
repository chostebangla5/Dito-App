'use client';

import { useState } from 'react';

export default function WellnessBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="mx-4 my-3 px-5 py-4 rounded-2xl flex items-center justify-between animate-fade-in-up bg-surface border border-border shadow-md glass">
      <p className="text-sm font-medium text-foreground">
        <span className="mr-2">💙</span> Remember to connect with real people today too
      </p>
      <button
        onClick={() => setDismissed(true)}
        className="ml-4 p-2 rounded-full text-text-muted hover:bg-surface-hover hover:text-foreground transition-colors cursor-pointer active:scale-95 flex-shrink-0"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" className="w-4 h-4">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
