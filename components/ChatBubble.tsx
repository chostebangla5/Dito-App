'use client';

import Avatar from './Avatar';

interface ChatBubbleProps {
  content: string;
  role: 'user' | 'assistant';
  partnerName: string;
  partnerPhoto?: string | null;
}

export default function ChatBubble({ content, role, partnerName, partnerPhoto }: ChatBubbleProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse msg-user' : 'flex-row msg-partner'}`}>
      {!isUser && (
        <div className="animate-fade-in" style={{ animationDelay: '50ms', animationFillMode: 'both' }}>
          <Avatar name={partnerName} photoUrl={partnerPhoto} size="sm" />
        </div>
      )}
      <div className="w-full flex flex-col" style={{ alignItems: isUser ? 'flex-end' : 'flex-start' }}>
        <div
          className={`break-words overflow-hidden ${
            isUser ? 'bubble-user' : 'bubble-partner glass'
          }`}
        >
          {content}
        </div>
        {isUser && (
          <div className="flex items-center justify-end gap-1 mt-1 pr-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Sent</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" className="w-3 h-3 text-primary">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
