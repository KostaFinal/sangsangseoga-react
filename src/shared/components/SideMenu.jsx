import React from 'react';
import { NavLink } from 'react-router-dom';
import { Star, BookOpen, Award, Calendar, MessageSquare, Book, Heart, BarChart2, ShieldAlert, } from 'lucide-react';

export default function SideMenu({ disabled = false }) {
  const bookmarks = [
    { path: 'wishlist', label: '읽고 싶은 책', icon: Star },
    { path: 'reading', label: '읽는 중', icon: BookOpen },
    { path: 'finished', label: '읽기 완료', icon: Award },
    { path: 'stats', label: '독서 통계', icon: BarChart2 },
    { path: 'calendar', label: '독서 캘린더', icon: Calendar },
    { path: 'ai-chat', label: '독후감', icon: MessageSquare },
    { path: 'all-books', label: '내가 쓴 책', icon: Book },
    { path: 'saved-authors', label: '관심 작가', icon: Heart },
    { path: 'reports', label: '신고 내역', icon: ShieldAlert },
  ];

  if (disabled) {
    return null;
  }

  return (
    <aside className="fixed right-0 top-1/2 -translate-y-1/2 flex flex-col items-end gap-1.5 z-40">
      {bookmarks.map((b) => {
        const IconComponent = b.icon;

        return (
          <NavLink
            key={b.path}
            to={b.path}
            id={`sidebookmark-${b.path}`}
            className="flex items-center group select-none"
          >
            {({ isActive }) => (
              <>
                <span className="pointer-events-none opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300 mr-2 font-bold text-xs bg-white text-navy-purple border border-lavender-border shadow-md px-3 py-1.5 rounded-lg whitespace-nowrap">
                  {b.label}
                </span>

                <div
                  className={`h-14 transition-all duration-300 rounded-l-2xl flex items-center justify-center border-l border-y border-lavender-border shadow-md cursor-pointer ${isActive
                      ? `bg-brand-purple text-white w-20 shadow-[-5px_0_15px_rgba(107,84,231,0.25)] border-l-4 border-brand-dark`
                      : 'bg-white hover:bg-lavender-bg hover:w-16 text-navy-purple/70 w-12'
                    }`}
                >
                  <IconComponent className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
                </div>
              </>
            )}
          </NavLink>
        );
      })}
    </aside>
  );
}
