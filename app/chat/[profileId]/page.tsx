'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { buildSystemPrompt, type Profile } from '@/lib/promptBuilder';
import { detectCrisis, CRISIS_SUFFIX, WELLNESS_THRESHOLD } from '@/lib/safety';
import { getRelationshipLabel } from '@/lib/languageMap';
import Avatar from '@/components/Avatar';
import ChatBubble from '@/components/ChatBubble';
import TypingIndicator from '@/components/TypingIndicator';
import TabBar from '@/components/TabBar';
import WellnessBanner from '@/components/WellnessBanner';
import ProtectedRoute from '@/components/ProtectedRoute';
import { haptics } from '@/lib/haptics';

// SVG Icons
const IconBack = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);
const IconSend = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
);
const IconChat = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
  </svg>
);
const IconPhone = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.01L6.6 10.8z" />
  </svg>
);
const IconVideo = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
  </svg>
);

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
}

// Coming Soon Tab Component
function ComingSoonTab({ type, partnerName }: { type: 'voice' | 'video'; partnerName: string }) {
  const isVoice = type === 'voice';
  const config = isVoice
    ? {
        Icon: IconPhone,
        title: 'Voice Calls',
        desc: `Hear ${partnerName}'s voice — powered by real-time AI voice cloning.`,
        phase: 'Phase 2',
        phaseColor: 'text-rose-500',
        phaseBg: 'bg-rose-500/10',
        needs: [
          { emoji: '🎙', text: 'ElevenLabs API — voice cloning from sample recordings' },
          { emoji: '⚡', text: 'Deepgram — real-time speech-to-text transcription' },
          { emoji: '🔗', text: 'LiveKit / WebRTC — low-latency call streaming' },
          { emoji: '🎤', text: '30–60 seconds of partner\'s voice recordings' },
        ],
        cost: '~₹25–50 per minute of voice call',
      }
    : {
        Icon: IconVideo,
        title: 'Video Calls',
        desc: `See ${partnerName}'s face, lip-synced to their voice in real time.`,
        phase: 'Phase 3',
        phaseColor: 'text-violet-500',
        phaseBg: 'bg-violet-500/10',
        needs: [
          { emoji: '🎬', text: 'Tavus or D-ID API — animated face avatar from photos' },
          { emoji: '🖼', text: 'Multiple clear photos or short video of partner' },
          { emoji: '🔗', text: 'WebRTC — live video streaming pipeline' },
          { emoji: '⚡', text: 'GPU-backed infrastructure for real-time rendering' },
        ],
        cost: '~₹150–400 per minute of video call',
      };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-background animate-fade-in-up">
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-5 ${config.phaseBg} ${config.phaseColor} animate-float`}>
        <config.Icon />
      </div>
      <h3 className="text-2xl font-bold mb-2 text-foreground">{config.title}</h3>
      <p className="text-sm font-medium mb-8 text-primary max-w-xs">{config.desc}</p>

      <div className="w-full max-w-xs rounded-3xl p-6 text-left bg-surface border border-border shadow-md glass">
        <p className="text-xs font-bold uppercase tracking-wider mb-4 text-text-muted">
          What you need to build this
        </p>
        <ul className="space-y-3">
          {config.needs.map((n, i) => (
            <li key={i} className="flex items-start gap-3 text-sm font-medium text-foreground">
              <span className="text-lg leading-5">{n.emoji}</span>
              <span>{n.text}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5 pt-4 border-t border-border text-xs font-medium text-text-muted">
          💰 Estimated cost: <strong className="text-foreground">{config.cost}</strong>
        </div>
      </div>

      <span className={`mt-6 px-4 py-2 rounded-full text-xs font-bold ${config.phaseBg} ${config.phaseColor}`}>
        {config.phase} — Coming Soon
      </span>

      <button className="mt-6 px-6 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer bg-surface border border-border text-primary hover:bg-surface-hover hover:scale-105 active:scale-95 shadow-sm">
        🔔 Notify me when it&apos;s ready
      </button>
    </div>
  );
}

function ChatContent({ params }: { params: Promise<{ profileId: string }> }) {
  const { profileId } = use(params);
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('chat');
  const [sessionMsgCount, setSessionMsgCount] = useState(0);
  const [showWellness, setShowWellness] = useState(false);
  const [dailyCount, setDailyCount] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load profile and messages
  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }

      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .eq('user_id', user.id)
        .single();

      if (!profileData) {
        router.push('/dashboard');
        return;
      }

      setProfile(profileData);

      // Load last 30 messages
      const { data: messagesData } = await supabase
        .from('messages')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: true })
        .limit(30);

      if (messagesData && messagesData.length > 0) {
        setMessages(messagesData.map(m => ({ id: m.id, role: m.role, content: m.content })));
      } else {
        // Generate greeting
        const petName = profileData.pet_names?.split(',')[0]?.trim();
        const greeting = petName
          ? `Hey ${petName}! 💕 Was just thinking about you...`
          : `Hey you 💕 So glad you're here...`;
        const greetingMsg: Message = { role: 'assistant', content: greeting };
        setMessages([greetingMsg]);

        // Save greeting to DB
        await supabase.from('messages').insert({
          profile_id: profileId,
          user_id: user.id,
          role: 'assistant',
          content: greeting,
        });
      }

      // Check daily limit
      const { data: settings } = await supabase
        .from('user_settings')
        .select('is_premium, daily_message_count, last_active_date')
        .eq('user_id', user.id)
        .single();

      if (settings) {
        const today = new Date().toISOString().split('T')[0];
        if (settings.last_active_date !== today) {
          // Reset daily count
          await supabase.from('user_settings').update({
            daily_message_count: 0,
            last_active_date: today,
          }).eq('user_id', user.id);
          setDailyCount(0);
        } else {
          setDailyCount(settings.daily_message_count || 0);
        }
        setIsPremium(settings.is_premium || false);
      }

      haptics.heartbeat();
      setPageLoading(false);
    };

    loadData();
  }, [profileId, router]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Wellness banner trigger
  useEffect(() => {
    if (sessionMsgCount >= WELLNESS_THRESHOLD && !showWellness) {
      setShowWellness(true);
    }
  }, [sessionMsgCount, showWellness]);

  const sendMessage = async () => {
    if (!input.trim() || loading || !profile) return;
    haptics.medium();

    // Check daily limit
    if (!isPremium && dailyCount >= 30) {
      setShowLimitModal(true);
      return;
    }

    const userMsg: Message = { role: 'user', content: input };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);
    setSessionMsgCount(prev => prev + 1);

    const { data: { user } } = await supabase.auth.getUser();

    // Save user message
    if (user) {
      await supabase.from('messages').insert({
        profile_id: profileId,
        user_id: user.id,
        role: 'user',
        content: input,
      });

      // Update daily count
      const newCount = dailyCount + 1;
      setDailyCount(newCount);
      await supabase.from('user_settings').update({
        daily_message_count: newCount,
        last_active_date: new Date().toISOString().split('T')[0],
      }).eq('user_id', user.id);
    }

    try {
      const systemPrompt = buildSystemPrompt(profile);
      const conversationHistory = updatedMessages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationHistory,
          systemPrompt,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      let reply = data.reply;

      // Client-side crisis detection as backup
      if (detectCrisis(input) && !reply.includes('iCall')) {
        reply += CRISIS_SUFFIX;
      }

      const assistantMsg: Message = { role: 'assistant', content: reply };
      setMessages(prev => [...prev, assistantMsg]);

      // Save assistant message
      if (user) {
        await supabase.from('messages').insert({
          profile_id: profileId,
          user_id: user.id,
          role: 'assistant',
          content: reply,
        });
      }
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Hmm, something went wrong. Try again? 💙' },
      ]);
    }

    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const tabs = [
    { id: 'chat', label: 'Chat', icon: <IconChat /> },
    { id: 'voice', label: 'Voice', icon: <IconPhone /> },
    { id: 'video', label: 'Video', icon: <IconVideo /> },
  ];

  if (pageLoading) {
    return (
      <div className="min-h-screen flex flex-col max-w-3xl w-full mx-auto bg-background">
        <div className="px-4 py-4 flex items-center gap-3 border-b border-border">
          <div className="w-8 h-8 rounded-full skeleton" />
          <div className="w-10 h-10 rounded-full skeleton" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 rounded-full skeleton" />
            <div className="h-3 w-1/4 rounded-full skeleton" />
          </div>
        </div>
        <div className="flex-1 px-4 py-6 space-y-6">
          <div className="flex items-end gap-2 flex-row msg-partner">
            <div className="w-8 h-8 rounded-full skeleton" />
            <div className="h-12 w-2/3 rounded-2xl rounded-bl-sm skeleton" />
          </div>
          <div className="flex items-end gap-2 flex-row-reverse msg-user">
            <div className="h-10 w-1/2 rounded-2xl rounded-br-sm skeleton" />
          </div>
          <div className="flex items-end gap-2 flex-row msg-partner">
            <div className="w-8 h-8 rounded-full skeleton" />
            <div className="h-16 w-3/4 rounded-2xl rounded-bl-sm skeleton" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen flex flex-col max-w-3xl w-full mx-auto bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <div className="px-4 py-4 flex items-center gap-3 bg-gradient-to-br from-background via-surface to-background border-b border-border shadow-sm z-20">
        <button
          onClick={() => router.push('/dashboard')}
          className="p-2 rounded-full text-foreground hover:bg-surface-hover transition-colors cursor-pointer active:scale-95"
        >
          <IconBack />
        </button>
        <div className="partner-avatar">
          <Avatar name={profile.name} photoUrl={profile.photo_url} size="md" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-foreground text-base leading-tight truncate">{profile.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0 bg-success online-dot" />
            <p className="text-xs font-medium text-text-muted truncate">
              AI Companion · Online
            </p>
          </div>
        </div>
        <span className="text-xs px-3 py-1 rounded-full flex-shrink-0 font-bold bg-primary/10 text-primary border border-primary/20">
          {getRelationshipLabel(profile.relationship_type)}
        </span>
      </div>

      {/* AI disclaimer */}
      <div className="text-center py-1.5 bg-surface-hover border-b border-border/50">
        <p className="text-[11px] font-bold uppercase tracking-widest text-text-muted">AI Companion — Not a real person</p>
      </div>

      {/* Tab Bar */}
      <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Content Area */}
      {activeTab === 'chat' && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-background relative">
            {/* Background subtle gradient for depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-surface/20 to-transparent pointer-events-none" />

            {/* Today divider */}
            <div className="text-center relative z-10 my-4">
              <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-surface border border-border text-text-muted shadow-sm glass">
                Today
              </span>
            </div>

            <div className="relative z-10 space-y-4">
              {messages.map((msg, i) => (
                <ChatBubble
                  key={i}
                  content={msg.content}
                  role={msg.role}
                  partnerName={profile.name}
                  partnerPhoto={profile.photo_url}
                />
              ))}

              {loading && (
                <TypingIndicator name={profile.name} photoUrl={profile.photo_url} />
              )}
            </div>

            {/* Wellness banner */}
            {showWellness && <WellnessBanner />}

            <div ref={messagesEndRef} className="h-2" />
          </div>

          {/* Input Bar */}
          <div className="px-4 py-3 bg-surface/80 border-t border-border glass z-20 pb-safe">
            {/* Daily count indicator */}
            {!isPremium && (
              <div className="flex items-center justify-between mb-2.5 px-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  {dailyCount}/30 messages today
                </span>
                {dailyCount >= 25 && (
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500 animate-pulse">
                    {30 - dailyCount} left
                  </span>
                )}
              </div>
            )}

            <div className="flex items-end gap-2">
              <textarea
                className="chat-input flex-1 max-h-32 resize-none"
                placeholder={`Say something to ${profile.name}...`}
                value={input}
                onChange={e => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                onKeyDown={handleKeyDown}
                rows={1}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-all flex-shrink-0 duration-150 ${
                  input.trim() && !loading
                    ? 'btn-primary p-0 min-h-0 cursor-pointer'
                    : 'bg-surface-hover text-text-muted cursor-not-allowed border border-border'
                }`}
              >
                <IconSend />
              </button>
            </div>
          </div>
        </>
      )}

      {activeTab === 'voice' && <ComingSoonTab type="voice" partnerName={profile.name} />}
      {activeTab === 'video' && <ComingSoonTab type="video" partnerName={profile.name} />}

      {/* Daily Limit Modal */}
      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5 bg-background/80 glass animate-fade-in">
          <div className="rounded-3xl p-8 max-w-sm w-full text-center bg-surface border border-border shadow-2xl animate-fade-in-up">
            <div className="text-5xl mb-4 animate-float">💬</div>
            <h3 className="font-bold text-xl mb-3 text-foreground">
              Daily limit reached
            </h3>
            <p className="text-sm font-medium mb-8 text-text-muted leading-relaxed">
              You&apos;ve used all 30 free messages today. Upgrade to Premium for unlimited conversations.
            </p>
            <button className="w-full py-4 rounded-2xl text-sm font-bold text-white mb-3 cursor-pointer bg-gradient-to-r from-rose-500 to-violet-500 hover:from-rose-600 hover:to-violet-600 transition-all shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95">
              Upgrade to Premium ✨
            </button>
            <button
              onClick={() => setShowLimitModal(false)}
              className="text-sm font-bold text-text-muted hover:text-foreground transition-colors cursor-pointer py-2 px-4 rounded-lg hover:bg-surface-hover"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChatPage({ params }: { params: Promise<{ profileId: string }> }) {
  return (
    <ProtectedRoute>
      <ChatContent params={params} />
    </ProtectedRoute>
  );
}
