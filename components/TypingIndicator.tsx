'use client';

import Avatar from './Avatar';

interface TypingIndicatorProps {
  name: string;
  photoUrl?: string | null;
}

export default function TypingIndicator({ name, photoUrl }: TypingIndicatorProps) {
  return (
    <div className="flex items-end gap-2 msg-partner">
      <Avatar name={name} photoUrl={photoUrl} size="sm" />
      <div className="bubble-partner glass flex items-center justify-center py-4 px-5">
        <div className="flex gap-1.5 items-center">
          <span className="w-2 h-2 rounded-full bg-primary/40 dot-1" />
          <span className="w-2 h-2 rounded-full bg-primary/60 dot-2" />
          <span className="w-2 h-2 rounded-full bg-primary/80 dot-3" />
        </div>
      </div>
    </div>
  );
}
