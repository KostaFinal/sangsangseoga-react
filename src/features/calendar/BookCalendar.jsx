import React, { useState } from 'react';
import { CalendarDays, Star, Award, Heart, ShieldCheck, Clock, X } from 'lucide-react';
import { calendarDays } from '@/data';

export default function BookCalendar({ onSelectBook }) {
  const [selectedDayNum, setSelectedDayNum] = useState(null);
  const [modalDay, setModalDay] = useState(null);

  const daysInMonth = 30; // 5월로 가정한 독서 캘린더 기준
  const firstDayOffset = 5; // 금요일 시작 가상 세팅

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyCells = Array.from({ length: firstDayOffset }, (_, i) => i);

  const monthName = '2026년 6월';

  const handleCellClick = (dayNum) => {
    setSelectedDayNum(dayNum);
    const detail = calendarDays[dayNum];
    if (detail) {
      setModalDay(detail);
    }
  };

  return (
    <div className="w-full flex flex-col pt-1 animate-in fade-in-50 duration-500 select-none text-navy-purple bg-transparent">
      {/* Description header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div>
          <h3 className="font-plus text-xl font-black text-navy-purple">
            {monthName}
          </h3>
        </div>
      </div>

      <div className="w-full">
        {/* Calendar visual board matrix */}
        <div className="w-full bg-white rounded-3xl border border-lavender-border shadow-sm p-4 md:p-5">
          {/* Day of Week headers */}
          <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold text-purple-gray-text/60 mb-3 tracking-widest uppercase">
            <span>일</span><span>월</span><span>화</span><span>수</span><span>목</span><span className="text-brand-purple">금</span><span className="text-brand-purple">토</span>
          </div>

          {/* Grid rows */}
          <div className="grid grid-cols-7 gap-2">
            {/* Pad offset cells */}
            {emptyCells.map((val) => (
              <div key={`empty-${val}`} className="aspect-square bg-lavender-bg rounded-lg border border-lavender-border/50" />
            ))}

            {/* Real day cells */}
            {daysArray.map((day) => {
              const detail = calendarDays[day];
              const hasActivity = !!detail;
              const isSelected = selectedDayNum === day;

              return (
                <div 
                  key={`day-${day}`}
                  id={`calendar-day-${day}`}
                  onClick={() => handleCellClick(day)}
                  className={`aspect-square rounded-xl relative border transition-all cursor-pointer flex flex-col justify-between overflow-hidden p-1 ${
                    isSelected
                      ? 'ring-4 ring-brand-purple ring-offset-2 scale-105 z-30 border-brand-purple bg-white shadow-md'
                      : hasActivity 
                        ? 'border-brand-purple bg-white hover:shadow-md hover:scale-105 group' 
                        : 'border-lavender-border/80 bg-white hover:bg-lavender-bg'
                  }`}
                >
                  {/* Miniature Cover Fill if has activity */}
                  {hasActivity && detail.books && detail.books.length > 0 && (
                    <div className="absolute inset-0 z-10 opacity-75 group-hover:opacity-100 transition-all flex w-full h-full">
                      {detail.books.length === 1 ? (
                        <div className="w-full h-full relative">
                          <img 
                            src={detail.books[0].coverUrl} 
                            alt="Miniature Book" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        /* Multi-book style: split views horizontally showing halves of both covers */
                        <div className="w-full h-full relative flex overflow-hidden">
                          {detail.books.slice(0, 2).map((book, bIdx) => (
                            <div 
                              key={bIdx} 
                              className="h-full relative border-r last:border-0 border-white/40"
                              style={{ width: `${100 / Math.min(detail.books.length, 2)}%` }}
                            >
                              <img 
                                src={book.coverUrl} 
                                alt={`Miniature Book ${bIdx}`} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                          {/* Crimson dynamic count overlay badge */}
                          <div className="absolute top-1.5 right-1.5 bg-brand-purple text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-lg border border-lavender-border scale-95 z-30">
                            {detail.books.length}
                          </div>
                        </div>
                      )}
                      {/* Contrast Overlay dark gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />
                    </div>
                  )}

                  {/* Day Number text */}
                  <span className={`text-xs font-bold font-plus z-20 relative select-none ${
                    hasActivity 
                      ? 'text-white drop-shadow-[0_1.5px_3.5px_rgba(0,0,0,0.95)]' 
                      : 'text-navy-purple'
                  }`}>
                    {day}
                  </span>

                  {/* Stamp badge marker index bottom */}
                  {hasActivity && (
                    <span className="self-end z-20 relative text-[9px] font-extrabold select-none text-white drop-shadow-[0_1.2px_3px_rgba(0,0,0,0.95)] max-w-full truncate bg-brand-purple/60 px-1 rounded scale-90">
                      {detail.books.length > 1 ? `📚 ${detail.books.length}권` : (detail.books[0].status === '완독' ? '🌟 완독' : '📖 읽는중')}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal for Book List (팝업) */}
      {modalDay && (
        <div 
          className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          id="dayModal"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setModalDay(null);
            }
          }}
        >
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full p-8 relative animate-in zoom-in-95 duration-300 border border-lavender-border flex flex-col gap-6">
            <button 
              className="absolute top-6 right-6 w-9 h-9 rounded-full bg-white hover:bg-lavender-bg flex items-center justify-center text-navy-purple border border-lavender-border transition-all cursor-pointer shadow-sm"
              onClick={() => setModalDay(null)}
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl md:text-2xl font-black text-navy-purple font-plus pr-10">
              📅 {modalDay.day}일 독서 기록
            </h3>

            <div className="space-y-4 max-h-[360px] overflow-y-auto custom-scrollbar pr-1">
              {modalDay.books.map((b, bIdx) => (
                <div key={bIdx} className="flex gap-4 p-4 bg-white rounded-2xl items-center border border-lavender-border shadow-sm transition-all hover:scale-[1.01]">
                  <div 
                    className="w-16 h-24 bg-cover bg-center rounded-xl flex-shrink-0 shadow-md border border-lavender-border"
                    style={{ backgroundImage: `url('${b.coverUrl}')` }}
                  />
                  <div className="min-w-0 flex-grow">
                    <h4 className="text-base font-bold text-navy-purple truncate font-plus">{b.title}</h4>
                    <p className="text-xs font-semibold text-purple-gray-text mt-1 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-brand-purple" /> 독서 시간: <strong className="text-navy-purple">{b.time}</strong>
                    </p>
                    
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-brand-purple text-white`}>
                        {b.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setModalDay(null)}
              className="w-full py-4 bg-brand-purple hover:bg-brand-dark text-white rounded-full font-bold active:scale-95 transition-all shadow-md text-xs cursor-pointer tracking-wider"
            >
              전체 기록 확인 완료
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
