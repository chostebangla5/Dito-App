'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dob, setDob] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isUnder18 = () => {
    if (!dob) return false;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age < 18;
  };

  const handleRegister = async () => {
    setError('');
    setSuccess('');

    if (!email || !password || !confirmPassword || !dob) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (isUnder18()) {
      setError('You must be 18 or older to use Dito.');
      return;
    }
    if (!agreeTerms) {
      setError('You must agree to the Terms of Service.');
      return;
    }

    setLoading(true);
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
      } else {
        // Create user_settings row
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('user_settings').insert({
            user_id: user.id,
            is_premium: false,
            daily_message_count: 0,
            disclaimer_shown: false,
          });
        }
        setSuccess('Account created! Redirecting...');
        setTimeout(() => router.push('/disclaimer'), 1000);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
      } else {
        // Check if disclaimer has been shown
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: settings } = await supabase
            .from('user_settings')
            .select('disclaimer_shown')
            .eq('user_id', user.id)
            .single();

          if (!settings?.disclaimer_shown) {
            router.push('/disclaimer');
          } else {
            router.push('/dashboard');
          }
        } else {
          router.push('/dashboard');
        }
      }
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <div className="px-6 pt-12 pb-14 text-center bg-gradient-to-br from-background via-surface to-background border-b border-border shadow-sm">
        <div className="flex items-center justify-center gap-2 mb-4 animate-fade-in-up">
          <svg viewBox="0 0 24 24" className="w-8 h-8 fill-primary">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <span className="text-foreground font-bold text-3xl tracking-tight">Dito</span>
        </div>
        <p className="text-sm font-medium text-text-muted animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {tab === 'login' ? 'Welcome back 💕' : 'Create your account'}
        </p>
      </div>

      {/* Tabs & Form Wrapper */}
      <div className="flex-1 flex flex-col items-center px-4 sm:px-6 lg:px-8 -mt-8 w-full z-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="max-w-md w-full rounded-3xl overflow-hidden bg-surface border border-border shadow-xl hover:shadow-2xl transition-shadow duration-300 glass">
          <div className="flex border-b border-border">
            {(['login', 'register'] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); setSuccess(''); }}
                className={`flex-1 py-4 text-sm font-bold transition-all cursor-pointer ${
                  tab === t 
                    ? 'text-primary bg-background shadow-inner' 
                    : 'text-text-muted hover:text-foreground hover:bg-surface-hover'
                }`}
                style={{
                  borderBottom: tab === t ? '2px solid var(--primary)' : '2px solid transparent'
                }}
              >
                {t === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <div className="p-6 sm:p-8">
            <form onSubmit={(e) => { e.preventDefault(); tab === 'login' ? handleLogin() : handleRegister(); }}>
              {/* Error / Success */}
              {error && (
                <div className="mb-6 px-4 py-3 rounded-2xl text-sm font-medium bg-rose-500/10 text-rose-500 border border-rose-500/20 animate-fade-in">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-6 px-4 py-3 rounded-2xl text-sm font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 animate-fade-in">
                  {success}
                </div>
              )}

              {/* Email */}
              <div className="mb-5 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <label htmlFor="email" className="block text-sm font-bold mb-2 text-foreground">
                  Email <span className="text-primary">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-2xl px-5 py-3.5 text-sm bg-background border border-border text-foreground placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                />
              </div>

              {/* Password */}
              <div className="mb-5 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
                <label htmlFor="password" className="block text-sm font-bold mb-2 text-foreground">
                  Password <span className="text-primary">*</span>
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-2xl px-5 py-3.5 text-sm bg-background border border-border text-foreground placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                />
              </div>

              {/* Register-only fields */}
              {tab === 'register' && (
                <>
                  <div className="mb-5 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <label htmlFor="confirmPassword" className="block text-sm font-bold mb-2 text-foreground">
                      Confirm Password <span className="text-primary">*</span>
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full rounded-2xl px-5 py-3.5 text-sm bg-background border border-border text-foreground placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                    />
                  </div>

                  <div className="mb-5 animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
                    <label htmlFor="dob" className="block text-sm font-bold mb-2 text-foreground">
                      Date of Birth <span className="text-primary">*</span>
                    </label>
                    <input
                      id="dob"
                      name="dob"
                      type="date"
                      value={dob}
                      onChange={e => setDob(e.target.value)}
                      className="w-full rounded-2xl px-5 py-3.5 text-sm bg-background border border-border text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                    />
                    {dob && isUnder18() && (
                      <p className="text-xs font-semibold mt-2 text-rose-500 animate-fade-in">
                        You must be 18 or older to use Dito.
                      </p>
                    )}
                  </div>

                  <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    <label htmlFor="agreeTerms" className="flex items-start gap-3 cursor-pointer group">
                      <input
                        id="agreeTerms"
                        name="agreeTerms"
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={e => setAgreeTerms(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
                      />
                      <span className="text-sm font-medium text-foreground group-hover:text-text-accent transition-colors">
                        I agree to the{' '}
                        <span className="underline text-primary hover:text-primary-hover">Terms of Service</span>
                        {' '}and{' '}
                        <span className="underline text-primary hover:text-primary-hover">Privacy Policy</span>
                      </span>
                    </label>
                  </div>
                </>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-2xl text-base font-bold text-white transition-all shadow-lg active:scale-95 animate-fade-in-up ${
                  loading 
                    ? 'bg-text-muted cursor-not-allowed shadow-none' 
                    : 'bg-gradient-to-r from-rose-500 to-violet-500 hover:from-rose-600 hover:to-violet-600 hover:shadow-xl hover:scale-[1.02]'
                }`}
                style={{ animationDelay: tab === 'login' ? '0.2s' : '0.35s' }}
              >
                {loading ? 'Please wait...' : tab === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            {tab === 'login' && (
              <p className="text-center text-sm mt-6 font-medium text-text-muted animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <span className="cursor-pointer hover:underline hover:text-primary transition-colors">
                  Forgot password?
                </span>
              </p>
            )}
          </div>
        </div>

        <p className="text-center text-sm mt-8 pb-12 font-medium text-text-muted animate-fade-in" style={{ animationDelay: '0.4s' }}>
          {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setTab(tab === 'login' ? 'register' : 'login'); setError(''); setSuccess(''); }}
            className="font-bold hover:underline transition-colors text-primary hover:text-primary-hover active:scale-95"
          >
            {tab === 'login' ? 'Register' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}
