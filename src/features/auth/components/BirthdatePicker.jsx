import React, { useState } from 'react';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const pad2 = (n) => String(n).padStart(2, '0');

const parseValue = (value) => {
  if (value) {
    const [y, m, d] = value.split('-').map(Number);
    if (y && m && d) return { year: y, month: m - 1, day: d };
  }
  const today = new Date();
  return { year: today.getFullYear() - 10, month: today.getMonth(), day: 1 };
};

export default function BirthdatePicker({ value, onChange }) {
  const parsed = parseValue(value);
  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(parsed.year);
  const [viewMonth, setViewMonth] = useState(parsed.month);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i);

  const open = () => {
    const p = parseValue(value);
    setViewYear(p.year);
    setViewMonth(p.month);
    setIsOpen(true);
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

  const displayText = value
    ? `${parsed.year}년 ${parsed.month + 1}월 ${parsed.day}일`
    : '생년월일을 선택해 주세요';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={open}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-neutral-50 hover:bg-neutral-100/50 text-sm text-neutral-900 rounded-xl border border-neutral-200 focus:border-black focus:outline-none transition-all duration-200 text-left cursor-pointer"
      >
        <span className={value ? '' : 'text-neutral-400'}>{displayText}</span>
        <span className="material-symbols-outlined text-neutral-400 text-lg">calendar_month</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute z-50 mt-2 w-full min-w-[280px] bg-white rounded-2xl border border-neutral-200 shadow-xl p-3">
            <div className="flex items-center gap-2 mb-3">
              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                className="flex-1 px-2 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-bold text-neutral-800 focus:outline-none focus:border-black cursor-pointer"
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}년</option>
                ))}
              </select>
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                className="flex-1 px-2 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-bold text-neutral-800 focus:outline-none focus:border-black cursor-pointer"
              >
                {months.map((m) => (
                  <option key={m} value={m}>{m + 1}월</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-1">
              {WEEKDAYS.map((w) => (
                <div key={w} className="text-center text-[10px] font-bold text-neutral-400 py-1">{w}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, idx) => {
                if (day === null) return <div key={`blank-${idx}`} />;
                const isSelected = value === `${viewYear}-${pad2(viewMonth + 1)}-${pad2(day)}`;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => selectDay(day)}
                    className={`aspect-square rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-black text-white'
                        : 'text-neutral-700 hover:bg-neutral-100'
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
