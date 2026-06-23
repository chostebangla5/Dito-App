'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { SUPPORTED_LANGUAGES, RELATIONSHIP_TYPES } from '@/lib/languageMap';
import { parseWhatsAppExport, type ParsedWhatsApp } from '@/lib/whatsappParser';
import ProtectedRoute from '@/components/ProtectedRoute';
import { haptics } from '@/lib/haptics';

interface FormData {
  name: string;
  relationship_type: string;
  language: string;
  pet_names: string;
  is_deceased: boolean;
  consent_given: boolean;
  personality: string;
  speaking_style: string;
  interests: string;
  memories: string;
  photo: File | null;
  whatsapp_file: File | null;
}

function SetupContent() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [parsedWA, setParsedWA] = useState<ParsedWhatsApp | null>(null);
  const [parsing, setParsing] = useState(false);

  const [data, setData] = useState<FormData>({
    name: '',
    relationship_type: 'girlfriend',
    language: 'English',
    pet_names: '',
    is_deceased: false,
    consent_given: false,
    personality: '',
    speaking_style: '',
    interests: '',
    memories: '',
    photo: null,
    whatsapp_file: null,
  });

  const update = (key: keyof FormData, value: string | boolean | File | null) => {
    setData(prev => {
      const updated = { ...prev, [key]: value };
      // Auto-select deceased relationship type
      if (key === 'is_deceased' && value === true) {
        updated.relationship_type = 'deceased_partner';
      }
      return updated;
    });
  };

  const steps = [
    {
      title: 'Who are they?',
      subtitle: 'Tell me about them — the more you share, the more real this feels.',
    },
    {
      title: 'Their personality',
      subtitle: 'How did they make you feel? What made them uniquely them?',
    },
    {
      title: 'Your story together',
      subtitle: 'The memories, the little things — these are what make it yours.',
    },
    {
      title: 'Upload WhatsApp Chat',
      subtitle: 'Make the AI sound exactly like them (optional but powerful).',
    },
  ];

  const current = steps[step];
  const isLastStep = step === steps.length - 1;

  const canAdvance = () => {
    if (step === 0) {
      return data.name.trim().length > 0 && data.consent_given;
    }
    return true;
  };

  const handleWhatsAppUpload = async (file: File) => {
    update('whatsapp_file', file);
    setParsing(true);
    try {
      const content = await file.text();
      const result = parseWhatsAppExport(content, data.name);
      setParsedWA(result);
    } catch {
      setError('Failed to parse WhatsApp file. Please try again.');
    }
    setParsing(false);
  };

  const handleCreate = async () => {
    setSaving(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Please sign in first.');
        setSaving(false);
        return;
      }

      // Upload photo if provided
      let photoUrl: string | null = null;
      if (data.photo) {
        const fileExt = data.photo.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(fileName, data.photo);

        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('photos').getPublicUrl(fileName);
          photoUrl = urlData.publicUrl;
        }
      }

      // Create profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          name: data.name,
          relationship_type: data.relationship_type,
          language: data.language,
          personality: data.personality,
          speaking_style: data.speaking_style,
          memories: data.memories,
          interests: data.interests,
          pet_names: data.pet_names,
          whatsapp_phrases: parsedWA?.phrases || [],
          whatsapp_tone: parsedWA?.toneSummary || '',
          photo_url: photoUrl,
          is_deceased: data.is_deceased,
          consent_given: data.consent_given,
        })
        .select()
        .single();

      if (profileError) {
        setError(profileError.message);
        setSaving(false);
        haptics.error();
        return;
      }

      haptics.success();
      router.push(`/chat/${profile.id}`);
    } catch {
      haptics.error();
      setError('Failed to create profile. Please try again.');
      setSaving(false);
    }
  };

  const handleNext = () => {
    haptics.medium();
    if (isLastStep) {
      handleCreate();
      return;
    }
    setStep(s => s + 1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <div className="px-6 pt-10 pb-8 bg-gradient-to-br from-background via-surface to-background border-b border-border shadow-sm">
        <div className="max-w-3xl w-full mx-auto">
          <div className="flex items-center gap-2 mb-8 animate-fade-in-up">
            <svg viewBox="0 0 24 24" className="w-8 h-8 fill-primary">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span className="text-foreground font-bold text-2xl tracking-tight">Dito</span>
          </div>

          {/* Progress bar */}
          <div className="flex gap-2 mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full flex-1 transition-all duration-500 ${
                  i <= step ? 'bg-primary' : 'bg-surface-hover border border-border'
                }`}
              />
            ))}
          </div>

          <h2 className="text-foreground text-2xl font-bold leading-snug animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {current.title}
          </h2>
          <p className="text-sm mt-2 font-medium text-text-muted animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            {current.subtitle}
          </p>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 px-4 sm:px-6 pt-8 pb-6 overflow-y-auto">
        <div className="space-y-5 max-w-3xl w-full mx-auto animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          {/* Error */}
          {error && (
            <div className="px-4 py-3 rounded-2xl text-sm font-medium bg-rose-500/10 text-rose-500 border border-rose-500/20 animate-fade-in">
              {error}
            </div>
          )}

          {/* Step 1: Who Are They? */}
          {step === 0 && (
            <div className="animate-fade-in space-y-5">
              <div>
                <label className="block text-sm font-bold mb-2 text-foreground">
                  Their name <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sarah"
                  value={data.name}
                  onChange={e => update('name', e.target.value)}
                  className="w-full rounded-2xl px-5 py-3.5 text-sm bg-surface border border-border text-foreground placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-foreground">
                  Your relationship <span className="text-primary">*</span>
                </label>
                <select
                  value={data.relationship_type}
                  onChange={e => update('relationship_type', e.target.value)}
                  className="w-full rounded-2xl px-5 py-3.5 text-sm bg-surface border border-border text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm cursor-pointer appearance-none"
                >
                  {RELATIONSHIP_TYPES.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-foreground">
                  Language they speak
                </label>
                <select
                  value={data.language}
                  onChange={e => update('language', e.target.value)}
                  className="w-full rounded-2xl px-5 py-3.5 text-sm bg-surface border border-border text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm cursor-pointer appearance-none"
                >
                  {SUPPORTED_LANGUAGES.map(l => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-foreground">
                  What they call you (pet names)
                </label>
                <input
                  type="text"
                  placeholder="e.g. babe, jaan, shona, betu"
                  value={data.pet_names}
                  onChange={e => update('pet_names', e.target.value)}
                  className="w-full rounded-2xl px-5 py-3.5 text-sm bg-surface border border-border text-foreground placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                />
              </div>

              {/* Deceased toggle */}
              <label className="flex items-center gap-4 cursor-pointer py-2 group">
                <div
                  className={`relative w-12 h-7 rounded-full transition-all cursor-pointer ${
                    data.is_deceased ? 'bg-primary' : 'bg-surface-hover border border-border'
                  }`}
                  onClick={() => update('is_deceased', !data.is_deceased)}
                >
                  <div
                    className="absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-sm"
                    style={{ left: data.is_deceased ? '22px' : '4px' }}
                  />
                </div>
                <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  This person has passed away
                </span>
              </label>

              {/* Consent */}
              <label className="flex items-start gap-3 cursor-pointer pt-2 group">
                <input
                  type="checkbox"
                  checked={data.consent_given}
                  onChange={e => update('consent_given', e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
                />
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  This person has given consent OR has passed away <span className="text-primary">*</span>
                </span>
              </label>
            </div>
          )}

          {/* Step 2: Personality */}
          {step === 1 && (
            <div className="animate-fade-in space-y-5">
              <div>
                <label className="block text-sm font-bold mb-2 text-foreground">
                  Describe their personality
                </label>
                <textarea
                  rows={4}
                  placeholder="e.g. warm, always laughing, sarcastic in a loving way, very protective, lights up every room..."
                  value={data.personality}
                  onChange={e => update('personality', e.target.value)}
                  className="w-full rounded-2xl px-5 py-3.5 text-sm resize-none bg-surface border border-border text-foreground placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-foreground">
                  How they speak / text
                </label>
                <input
                  type="text"
                  placeholder="e.g. uses short messages, says 'honestly' a lot, very expressive, lots of emojis..."
                  value={data.speaking_style}
                  onChange={e => update('speaking_style', e.target.value)}
                  className="w-full rounded-2xl px-5 py-3.5 text-sm bg-surface border border-border text-foreground placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-foreground">
                  Their interests and hobbies
                </label>
                <input
                  type="text"
                  placeholder="e.g. loves cooking, obsessed with cricket, plays guitar, huge Bollywood fan..."
                  value={data.interests}
                  onChange={e => update('interests', e.target.value)}
                  className="w-full rounded-2xl px-5 py-3.5 text-sm bg-surface border border-border text-foreground placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                />
              </div>
            </div>
          )}

          {/* Step 3: Memories */}
          {step === 2 && (
            <div className="animate-fade-in space-y-5">
              <div>
                <label className="block text-sm font-bold mb-2 text-foreground">
                  Your shared memories
                </label>
                <textarea
                  rows={5}
                  placeholder="e.g. met in college, our first trip was Goa, they always called me at 10pm, we had a dog named Bruno, Saturday evenings were our time..."
                  value={data.memories}
                  onChange={e => update('memories', e.target.value)}
                  className="w-full rounded-2xl px-5 py-3.5 text-sm resize-none bg-surface border border-border text-foreground placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-foreground">
                  Upload their photo (optional)
                </label>
                <div
                  className="border-2 border-dashed border-border hover:border-primary/50 bg-surface rounded-2xl p-8 text-center transition-all cursor-pointer group"
                  onClick={() => document.getElementById('photo-input')?.click()}
                >
                  {data.photo ? (
                    <div className="group-hover:scale-105 transition-transform">
                      <div className="text-3xl mb-2 drop-shadow-sm">📸</div>
                      <p className="text-sm font-bold text-foreground">{data.photo.name}</p>
                      <p className="text-xs font-medium mt-1 text-text-muted">Click to change</p>
                    </div>
                  ) : (
                    <div className="group-hover:scale-105 transition-transform">
                      <div className="text-3xl mb-3 drop-shadow-sm">📷</div>
                      <p className="text-sm font-bold text-text-muted group-hover:text-primary transition-colors">Click to upload a photo</p>
                    </div>
                  )}
                </div>
                <input
                  id="photo-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => update('photo', e.target.files?.[0] || null)}
                />
              </div>
            </div>
          )}

          {/* Step 4: WhatsApp Upload */}
          {step === 3 && (
            <div className="animate-fade-in space-y-5">
              <div className="rounded-2xl p-5 text-sm bg-primary/5 border border-primary/20 text-foreground">
                <p className="font-bold mb-3">How to export your WhatsApp chat:</p>
                <ol className="list-decimal list-inside space-y-2 text-xs font-medium text-text-muted">
                  <li>Open WhatsApp → open your chat with them</li>
                  <li>Tap ⋮ → More → Export Chat → <span className="font-bold text-foreground">Without Media</span></li>
                  <li>Upload the .txt file below</li>
                </ol>
              </div>

              <div
                className="border-2 border-dashed border-border hover:border-primary/50 bg-surface rounded-2xl p-8 text-center transition-all cursor-pointer group"
                onClick={() => document.getElementById('wa-input')?.click()}
              >
                {parsing ? (
                  <div>
                    <div className="w-10 h-10 mx-auto mb-3 rounded-full border-4 border-surface-hover border-t-primary animate-spin" />
                    <p className="text-sm font-bold text-primary">Parsing messages...</p>
                  </div>
                ) : data.whatsapp_file ? (
                  <div className="group-hover:scale-105 transition-transform">
                    <div className="text-3xl mb-2 drop-shadow-sm">📄</div>
                    <p className="text-sm font-bold text-foreground">{data.whatsapp_file.name}</p>
                    <p className="text-xs font-medium mt-1 text-text-muted">Click to change</p>
                  </div>
                ) : (
                  <div className="group-hover:scale-105 transition-transform">
                    <div className="text-3xl mb-3 drop-shadow-sm">💬</div>
                    <p className="text-sm font-bold text-text-muted group-hover:text-primary transition-colors">Upload WhatsApp .txt file</p>
                    <p className="text-xs font-medium mt-2 text-text-muted">Optional but makes the AI much more accurate</p>
                  </div>
                )}
              </div>
              <input
                id="wa-input"
                type="file"
                accept=".txt"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleWhatsAppUpload(file);
                }}
              />

              {/* Parse results */}
              {parsedWA && (
                <div className="rounded-2xl p-5 space-y-4 animate-fade-in-up bg-surface border border-border shadow-md glass">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">✅</span>
                    <span className="text-sm font-bold text-foreground">
                      Parsed {parsedWA.totalMessages} messages
                    </span>
                  </div>

                  {parsedWA.phrases.length > 0 && (
                    <div>
                      <p className="text-xs font-bold mb-2 text-primary">
                        📝 Detected phrases:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {parsedWA.phrases.slice(0, 5).map((phrase, i) => (
                          <span
                            key={i}
                            className="text-xs px-3 py-1.5 rounded-full bg-background text-foreground border border-border font-medium shadow-sm"
                          >
                            &ldquo;{phrase}&rdquo;
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <span className="text-xl">🗣</span>
                    <span className="text-sm font-medium text-text-muted">
                      Tone: <strong className="text-foreground">{parsedWA.toneSummary}</strong>
                    </span>
                  </div>
                </div>
              )}

              {/* Consent reminder */}
              <div className="rounded-2xl p-4 text-xs font-medium bg-amber-500/10 text-amber-600 border border-amber-500/20">
                <strong className="font-bold">⚠️ Important:</strong> This is an AI companion, not a real person. Only create a persona with the full knowledge and consent of the person being represented. Your emotional wellbeing matters — please also nurture real human connections.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="px-4 sm:px-6 pb-10 pt-4 max-w-3xl w-full mx-auto w-full bg-background border-t border-border z-20">
        <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex-1 py-4 rounded-2xl text-base font-bold bg-surface border border-border text-foreground hover:bg-surface-hover transition-all active:scale-95 shadow-sm"
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canAdvance() || saving}
            className={`flex-1 transition-all ${
              canAdvance() && !saving 
                ? 'btn-primary' 
                : 'py-4 rounded-2xl text-base font-bold bg-text-muted text-white cursor-not-allowed shadow-none opacity-70'
            }`}
          >
            {saving
              ? 'Creating...'
              : isLastStep
                ? `Start talking to ${data.name || 'them'} 💕`
                : 'Continue →'}
          </button>
        </div>
        <p className="text-center text-sm mt-4 font-bold text-text-muted">
          Step {step + 1} of {steps.length}
        </p>
      </div>
    </div>
  );
}

export default function SetupPage() {
  return (
    <ProtectedRoute>
      <SetupContent />
    </ProtectedRoute>
  );
}
