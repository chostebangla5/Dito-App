'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export default function DisclaimerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check if user already accepted disclaimer
    const checkDisclaimer = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }

      const { data: settings } = await supabase
        .from('user_settings')
        .select('disclaimer_shown')
        .eq('user_id', user.id)
        .single();

      if (settings?.disclaimer_shown) {
        router.push('/dashboard');
        return;
      }

      setChecking(false);
    };

    checkDisclaimer();
  }, [router]);

  const handleAccept = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          disclaimer_shown: true,
        }, { onConflict: 'user_id' });
    }
    router.push('/dashboard');
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAF6F8' }}>
        <div className="w-10 h-10 rounded-full" style={{ border: '3px solid #EDD8E4', borderTopColor: '#C4415C', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10" style={{ background: '#FAF6F8' }}>
      <div
        className="max-w-md w-full rounded-2xl p-8 animate-fade-in-up"
        style={{
          background: 'white',
          border: '1px solid #EDD8E4',
          boxShadow: '0 8px 40px rgba(61,26,50,0.1)',
        }}
      >
        {/* Icon */}
        <div className="text-center mb-6">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, #E8F4FD, #F0E8F8)' }}
          >
            <span className="text-3xl">💙</span>
          </div>
          <h1 className="text-xl font-bold" style={{ color: '#3D1A32' }}>
            Before You Continue
          </h1>
        </div>

        {/* Content */}
        <div className="space-y-4 mb-8">
          <p className="text-sm leading-relaxed" style={{ color: '#3D1A32' }}>
            Dito is an AI companion — <strong>not a real person</strong>.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: '#3D1A32' }}>
            It is designed to bring comfort and connection. But please remember:
          </p>

          <ul className="space-y-3">
            {[
              'This is not a replacement for real human relationships',
              'If you are grieving, professional grief counseling can help',
              'If you are in emotional distress, please speak to someone you trust',
              'Dito will never try to make you dependent on it',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: '#3D1A32' }}>
                <span className="text-base leading-5" style={{ color: '#8B5E8B' }}>•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div
            className="rounded-xl p-4 mt-4"
            style={{ background: '#FAF6F8', border: '1px solid #EDD8E4' }}
          >
            <p className="text-sm font-semibold mb-2" style={{ color: '#3D1A32' }}>
              If at any point you feel overwhelmed, please reach out to:
            </p>
            <div className="space-y-1.5">
              <p className="text-sm" style={{ color: '#8B5E8B' }}>
                → <strong>iCall India:</strong> 9152987821
              </p>
              <p className="text-sm" style={{ color: '#8B5E8B' }}>
                → <strong>Vandrevala Foundation:</strong> 1860-2662-345
              </p>
            </div>
          </div>
        </div>

        {/* Accept button */}
        <button
          onClick={handleAccept}
          disabled={loading}
          className="w-full py-4 rounded-2xl text-sm font-bold text-white transition-all cursor-pointer"
          style={{
            background: loading ? '#D0B0BB' : 'linear-gradient(135deg, #C4415C, #8B5E8B)',
            boxShadow: loading ? 'none' : '0 4px 16px rgba(196,65,92,0.35)',
          }}
        >
          {loading ? 'Please wait...' : "I Understand — Let's Begin 💕"}
        </button>
      </div>
    </div>
  );
}
