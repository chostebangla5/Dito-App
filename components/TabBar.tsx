'use client';

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

import { haptics } from '@/lib/haptics';

export default function TabBar({ tabs, activeTab, onTabChange }: TabBarProps) {
  return (
    <div className="tab-bar">
      {tabs.map(({ id, label, icon }) => {
        const active = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => {
              if (!active) {
                haptics.light();
                onTabChange(id);
              }
            }}
            className={`tab-item ${active ? 'active' : ''} cursor-pointer active:scale-95`}
          >
            <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'scale-100'} ease-[cubic-bezier(0.34,1.56,0.64,1)]`}>
              {icon}
            </div>
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
