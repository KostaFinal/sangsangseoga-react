import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const pad2 = (n) => String(n).padStart(2, '0');
const toDateStr = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

/**
 * 작고 단순한 단일 날짜 선택 캘린더 — 연/월 드롭다운 없이 이전/다음 달 이동만 지원.
 * value/onChange는 "YYYY-MM-DD" 문자열.
 */
export default function AdminCalendarInput({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const parsed = value ? new Date(`${value}T00:00:00`) : new Date();
  const [viewYear, setViewYear] = useState(parsed.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed.getMonth());

  const open = () => {
    const p = value ? new Date(`${value}T00:00:00`) : new Date();
    setViewYear(p.getFullYear());
    setViewMonth(p.getMonth());
    setIsOpen(true);
  };

  const goPrevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const goNextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const selectDay = (day) => {
    onChange(`${viewYear}-${pad2(viewMonth + 1)}-${pad2(day)}`);
    setIsOpen(false);
  };

  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const todayStr = toDateStr(new Date());
  const displayText = value ? value.replaceAll('-', '.') : '날짜 선택';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={open}
        className="w-full flex items-center justify-between gap-1.5 px-3 py-2 bg-[#FAF9FF] hover:bg-white text-sm text-[#2F2D59] rounded-xl border border-[#E6E2FC] focus:outline-none focus:border-[#6B54E7] transition-all cursor-pointer"
      >
        <span>{displayText}</span>
        <Calendar className="w-3.5 h-3.5 text-[#7C769D] shrink-0" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute z-50 mt-1.5 w-60 bg-white rounded-2xl border border-[#E6E2FC] shadow-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                onClick={goPrevMonth}
                className="w-6 h-6 flex items-center justify-center rounded-lg text-[#7C769D] hover:bg-[#FAF9FF] cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-black text-[#2F2D59]">{viewYear}년 {viewMonth + 1}월</span>
              <button
                type="button"
                onClick={goNextMonth}
                className="w-6 h-6 flex items-center justify-center rounded-lg text-[#7C769D] hover:bg-[#FAF9FF] cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {WEEKDAYS.map((w) => (
                <div key={w} className="text-center text-[10px] font-bold text-[#B9B0DC] py-1">{w}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5">
              {cells.map((day, idx) => {
                if (day === null) return <div key={`blank-${idx}`} />;
                const dateStr = `${viewYear}-${pad2(viewMonth + 1)}-${pad2(day)}`;
                const isSelected = value === dateStr;
                const isToday = todayStr === dateStr;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => selectDay(day)}
                    className={`aspect-square rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#6B54E7] text-white'
                        : isToday
                          ? 'text-[#6B54E7] font-black'
                          : 'text-[#2F2D59] hover:bg-[#FAF9FF]'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
