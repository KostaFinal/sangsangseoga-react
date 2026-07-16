import React from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';

export const NotificationPanel = ({
  isOpen,
  onClose,
  notifications = [],
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onViewAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-[#E6E2FC] rounded-3xl shadow-2xl p-4 z-50 text-left animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex justify-between items-center pb-3 border-b border-neutral-100">
        <div className="flex items-center gap-1.5">
          <Bell className="w-4 h-4 text-[#6B54E7]" />
          <span className="text-xs font-extrabold text-[#2F2D59]">알림 소식</span>
          {notifications.some(n => !n.read) && (
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="text-[10px] text-[#6B54E7] hover:underline font-bold cursor-pointer"
            >
              모두 읽음
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-[#FAF9FF] cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto py-1 space-y-1.5 mt-2 custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-[11px] text-[#7C769D]">
            새로운 알림 소식이 없습니다.
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-2.5 rounded-2xl border transition-all text-left flex gap-2.5 items-start ${notif.read ? 'bg-white border-transparent shadow-xs' : 'bg-[#FAF9FF] border-[#E6E2FC]/40 shadow-xs'}`}
            >
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${notif.read ? 'bg-transparent' : 'bg-[#6B54E7]'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#2F2D59] font-medium leading-relaxed">{notif.text}</p>
                <span className="text-[10px] text-[#7C769D] mt-1 block">{notif.time}</span>
              </div>
              {!notif.read && (
                <button
                  onClick={() => onMarkAsRead(notif.id)}
                  title="읽음 표시"
                  className="p-1 text-neutral-400 hover:text-[#6B54E7] rounded-lg hover:bg-neutral-50 flex-shrink-0 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <div className="pt-2 mt-2 border-t border-neutral-100 flex justify-between items-center">
        {onViewAll ? (
          <button
            onClick={onViewAll}
            className="text-[10px] text-[#6B54E7] hover:underline font-extrabold cursor-pointer"
          >
            전체 알림 보기
          </button>
        ) : (
          <span className="text-[10px] text-neutral-400">상상서가 알림</span>
        )}
        {notifications.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-[10px] text-red-500 hover:text-red-600 font-bold flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>전체 삭제</span>
          </button>
        )}
      </div>
    </div>
  );
};
