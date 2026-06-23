'use client';

import { useState } from 'react';
import Avatar from './Avatar';
import { getRelationshipLabel } from '@/lib/languageMap';

interface ProfileCardProps {
  id: string;
  name: string;
  relationshipType: string;
  language: string;
  photoUrl?: string | null;
  onChat: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ProfileCard({
  id, name, relationshipType, language, photoUrl, onChat, onDelete,
}: ProfileCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative rounded-3xl p-6 transition-all bg-surface border border-border shadow-md hover:shadow-xl hover:-translate-y-1 glass group">
      {/* Three-dot menu */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 rounded-full transition-colors cursor-pointer text-text-muted hover:bg-surface-hover hover:text-foreground active:scale-95"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
          </svg>
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-10 rounded-2xl py-1 z-10 min-w-[140px] shadow-lg animate-fade-in bg-surface border border-border glass">
            <button
              onClick={() => { onDelete(id); setMenuOpen(false); }}
              className="w-full text-left px-5 py-3 text-sm font-semibold transition-colors cursor-pointer text-rose-500 hover:bg-rose-500/10 active:bg-rose-500/20"
            >
              🗑 Delete Profile
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 mb-5">
        <div className="group-hover:scale-105 transition-transform duration-300">
          <Avatar name={name} photoUrl={photoUrl} size="lg" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-foreground mb-0.5">{name}</h3>
          <p className="text-sm font-medium text-primary">
            {getRelationshipLabel(relationshipType)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <span className="text-xs px-3 py-1.5 rounded-full font-semibold bg-primary/10 text-primary border border-primary/20">
          🌍 {language}
        </span>
      </div>

      <button
        onClick={() => onChat(id)}
        className="w-full py-3.5 rounded-2xl text-sm font-bold text-white transition-all cursor-pointer bg-gradient-to-r from-rose-500 to-violet-500 hover:from-rose-600 hover:to-violet-600 shadow-md hover:shadow-lg active:scale-95 hover:scale-[1.02]"
      >
        💬 Chat with {name}
      </button>
    </div>
  );
}
