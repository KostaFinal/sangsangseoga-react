import React from 'react';
import { Star, BookOpen, Award, Calendar, Edit3, MessageSquare, Book, Heart, BarChart2 } from 'lucide-react';

export default function SideMenu({ activeTab, setActiveTab, disabled = false }) {
  const bookmarks = [
    { id: 'wishlist', label: '읽고 싶은 책', icon: Star, color: 'bg-white text-black' },
    { id: 'reading', label: '읽는 중', icon: BookOpen, color: 'bg-white text-black' },
    { id: 'finished', label: '읽기 완료', icon: Award, color: 'bg-white text-black' },
    { id: 'stats', label: '독서 통계', icon: BarChart2, color: 'bg-white text-black' },
    { id: 'calendar', label: '독서 캘린더', icon: Calendar, color: 'bg-white text-black' },
    { id: 'ai-chat', label: '독후감', icon: MessageSquare, color: 'bg-white text-black' },
    { id: 'all-books', label: '내가 쓴 책', icon: Book, color: 'bg-white text-black' },
    { id: 'saved-author', label: '관심 작가', icon: Heart, color: 'bg-white text-black' }
  ];

  if (disabled) {
    return null;
  }

  return (
    <aside className="fixed right-0 top-1/2 -translate-y-1/2 flex flex-col items-end gap-1.5 z-40">
      {bookmarks.map((b) => {
        const isActive = activeTab === b.id;
        const IconComponent = b.icon;

        return (
          <div 
            key={b.id}
            id={`sidebookmark-${b.id}`}
            onClick={() => setActiveTab(b.id)}
            className="flex items-center group cursor-pointer select-none"
          >
            {/* Hover sliding label */}
            <span className="opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300 mr-2 font-bold text-xs bg-white text-navy-purple border border-lavender-border shadow-md px-3 py-1.5 rounded-lg whitespace-nowrap">
              {b.label}
            </span>

            {/* Bookmark tabs - pop out when active */}
            <div 
              className={`h-14 transition-all duration-300 rounded-l-2xl flex items-center justify-center border-l border-y border-lavender-border shadow-md ${
                isActive 
                  ? `bg-brand-purple text-white w-20 shadow-[-5px_0_15px_rgba(107,84,231,0.25)] border-l-4 border-brand-dark` 
                  : 'bg-white hover:bg-lavender-bg hover:w-16 text-navy-purple/70 w-12'
              }`}
            >
              <IconComponent className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
            </div>
          </div>
        );
      })}
    </aside>
  );
}
