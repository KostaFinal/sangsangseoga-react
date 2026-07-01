import React from 'react';

export const NotificationsView = ({ notifications, onMarkAllAsRead }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200 p-6 bg-white rounded-2xl border border-neutral-200/60 shadow-7xs">
      <div className="flex justify-between items-center border-b pb-4">
        <h2 className="text-xl font-black text-neutral-900 tracking-tight">전체 알림</h2>
        <button 
          onClick={onMarkAllAsRead}
          className="text-[10px] font-bold text-neutral-500 hover:text-black uppercase tracking-widest transition-colors cursor-pointer"
        >
          모두 읽음으로 표시
        </button>
      </div>
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <p className="text-center text-neutral-400 py-10">새로운 알림이 없습니다.</p>
        ) : (
          notifications.map((note) => (
            <div 
              key={note.id} 
              className={`p-4 rounded-xl border flex items-start gap-4 ${note.read ? 'bg-neutral-50 border-neutral-100' : 'bg-white border-neutral-200 shadow-sm'}`}
            >
              <div className={`w-2 h-2 mt-1.5 rounded-full ${note.read ? 'bg-neutral-300' : 'bg-black'}`}></div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-neutral-900">{note.text}</p>
                <span className="text-[10px] text-neutral-400 font-mono mt-1 block">{note.time}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
