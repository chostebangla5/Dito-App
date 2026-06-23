'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ProfileCard from '@/components/ProfileCard';
import ProtectedRoute from '@/components/ProtectedRoute';
import { haptics } from '@/lib/haptics';

interface ProfileData {
  id: string;
  name: string;
  relationship_type: string;
  language: string;
  photo_url: string | null;
}

function DashboardContent() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Load profiles
    const { data } = await supabase
      .from('profiles')
      .select('id, name, relationship_type, language, photo_url')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setProfiles(data || []);

    // Check premium status
    const { data: settings } = await supabase
      .from('user_settings')
      .select('is_premium')
      .eq('user_id', user.id)
      .single();

    setIsPremium(settings?.is_premium || false);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this persona? All chat history will be lost.')) return;

    await supabase.from('messages').delete().eq('profile_id', id);
    await supabase.from('profiles').delete().eq('id', id);
    setProfiles(prev => prev.filter(p => p.id !== id));
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const canAddMore = isPremium || profiles.length < 1;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <div className="px-6 pt-10 pb-12 bg-gradient-to-br from-background via-surface to-background border-b border-border shadow-sm">
        <div className="max-w-3xl w-full mx-auto">
          <div className="flex items-center justify-between mb-8 animate-fade-in-up">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="w-7 h-7 fill-primary">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span className="text-foreground font-bold text-2xl tracking-tight">Dito</span>
            </div>
            <button
              onClick={handleSignOut}
              className="px-5 py-2 rounded-full text-xs font-bold transition-all bg-surface border border-border text-text-muted hover:text-foreground hover:bg-surface-hover hover:scale-105 active:scale-95 shadow-sm"
            >
              Sign Out
            </button>
          </div>

          <h1 className="text-foreground text-3xl font-extrabold mb-2 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Your People
          </h1>
          <p className="text-sm font-medium text-text-muted animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {profiles.length === 0
              ? 'Create your first companion to get started.'
              : `${profiles.length} companion${profiles.length > 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 -mt-6 pb-12 relative z-10">
        <div className="max-w-3xl w-full mx-auto">
          {/* Add New Button */}
          {canAddMore && (
            <button
              onClick={() => { haptics.medium(); router.push('/setup'); }}
              className="w-full mb-6 btn-primary animate-fade-in-up"
              style={{ animationDelay: '0.3s' }}
            >
              + Add New Companion
            </button>
          )}

          {/* Loading */}
          {loading && (
            <div className="space-y-5 mt-4">
              {[1, 2].map((i) => (
                <div key={i} className="rounded-2xl p-5 bg-surface border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full skeleton" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-1/3 rounded-full skeleton" />
                      <div className="h-3 w-1/4 rounded-full skeleton" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && profiles.length === 0 && (
            <div className="rounded-3xl p-10 text-center bg-surface border border-border shadow-lg glass animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="text-5xl mb-6 drop-shadow-md animate-float">💕</div>
              <h3 className="font-bold text-xl mb-3 text-foreground">
                No companions yet
              </h3>
              <p className="text-sm font-medium text-text-muted mb-8 max-w-[250px] mx-auto leading-relaxed">
                Create a persona of someone you love and start chatting with them right away.
              </p>
              <button
                onClick={() => { haptics.medium(); router.push('/setup'); }}
                className="w-full btn-primary"
              >
                Create Your First Companion
              </button>
            </div>
          )}

          {/* Profile Cards */}
          <div className="space-y-5">
            {profiles.map((profile, i) => (
              <div key={profile.id} className="animate-fade-in-up" style={{ animationDelay: `${0.3 + i * 0.1}s` }}>
                <ProfileCard
                  id={profile.id}
                  name={profile.name}
                  relationshipType={profile.relationship_type}
                  language={profile.language}
                  photoUrl={profile.photo_url}
                  onChat={(id) => router.push(`/chat/${id}`)}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>

          {/* Locked card for free users */}
          {!isPremium && profiles.length >= 1 && (
            <div className="mt-6 rounded-3xl p-8 text-center bg-surface-hover border-2 border-dashed border-border opacity-90 transition-all hover:opacity-100 hover:shadow-md animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="font-bold text-base mb-2 text-foreground">
                Want to add more?
              </h3>
              <p className="text-sm font-medium text-text-muted mb-5">
                Upgrade to Premium for unlimited companions.
              </p>
              <button className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-rose-500 to-violet-500 hover:from-rose-600 hover:to-violet-600 transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95">
                Upgrade to Premium ✨
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
