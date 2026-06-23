'use client';

interface AvatarProps {
  name: string;
  photoUrl?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
};

export default function Avatar({ name, photoUrl, size = 'md' }: AvatarProps) {
  const initials = name
    ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'AI';
  const sizeClass = sizeMap[size];

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className={`${sizeClass} rounded-full object-cover flex-shrink-0 border-2 border-surface shadow-sm`}
      />
    );
  }

  return (
    <div className={`avatar ${sizeClass} shadow-sm`}>
      {initials}
    </div>
  );
}
