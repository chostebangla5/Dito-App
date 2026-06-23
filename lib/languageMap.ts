export const SUPPORTED_LANGUAGES = [
  { value: 'English', label: 'English' },
  { value: 'Hindi', label: 'Hindi (हिंदी)' },
  { value: 'Bengali', label: 'Bengali (বাংলা)' },
  { value: 'Tamil', label: 'Tamil (தமிழ்)' },
  { value: 'Telugu', label: 'Telugu (తెలుగు)' },
  { value: 'Marathi', label: 'Marathi (मराठी)' },
  { value: 'Gujarati', label: 'Gujarati (ગુજરાતી)' },
  { value: 'Punjabi', label: 'Punjabi (ਪੰਜਾਬੀ)' },
  { value: 'Urdu', label: 'Urdu (اردو)' },
] as const;

export const RELATIONSHIP_TYPES = [
  { value: 'girlfriend', label: '💕 Girlfriend', emoji: '💕' },
  { value: 'boyfriend', label: '💕 Boyfriend', emoji: '💕' },
  { value: 'husband', label: '💍 Husband', emoji: '💍' },
  { value: 'wife', label: '💍 Wife', emoji: '💍' },
  { value: 'father', label: '👨 Father', emoji: '👨' },
  { value: 'mother', label: '👩 Mother', emoji: '👩' },
  { value: 'grandparent', label: '👴 Grandparent', emoji: '👴' },
  { value: 'best_friend', label: '🤝 Best Friend', emoji: '🤝' },
  { value: 'deceased_partner', label: '🕊 Deceased Loved One', emoji: '🕊' },
] as const;

export function getRelationshipLabel(value: string): string {
  return RELATIONSHIP_TYPES.find(r => r.value === value)?.label || value;
}

export function getRelationshipEmoji(value: string): string {
  return RELATIONSHIP_TYPES.find(r => r.value === value)?.emoji || '💕';
}
