import React, { useState } from 'react';
import { Sparkles, BookOpen, PlusCircle } from 'lucide-react';

export default function BookCreationTab({ onCreateBook }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('동화');
  const [desc, setDesc] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreateBook({ title, category, desc });
    setTitle('');
    setDesc('');
  };

  return (
    <div className="w-full max-w-5xl mx-auto pt-1 animate-in fade-in-50 duration-500 select-none text-navy-purple bg-transparent">
      {/* Title Header */}
      <div className="border-b border-lavender-border pb-4 mb-4">
        <h2 className="text-xl font-black text-navy-purple tracking-tight font-serif">
          책 만들기
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-lavender-border shadow-sm p-4 md:p-5 space-y-4">
        <div className="flex items-center gap-2 text-brand-purple mb-2.5">
          <Sparkles className="w-5 h-5 animate-pulse" />
          <h3 className="font-plus font-bold text-base text-navy-purple">나만의 책 등재하기</h3>
        </div>

        <p className="text-xs text-purple-gray-text leading-relaxed">
          책꽂이에 등재할 나만의 특별한 도서를 창조해 보세요. 장르를 선택하고, 줄거리를 짧게 적어 책꽂이에 등재할 수 있습니다.
        </p>

        <div className="space-y-3.5">
          {/* 1. Book Title Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-navy-purple block">
              1. 도서 제목 <span className="text-rose-500">*</span>
            </label>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 공룡 사우루스의 하루"
              required
              className="w-full bg-white border border-lavender-border focus:border-brand-purple focus:ring-1 focus:ring-brand-purple rounded-xl px-4 py-2 text-xs md:text-sm outline-none text-navy-purple font-medium"
              id="creation-title-input"
            />
          </div>

          {/* 2. Genre Category Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-navy-purple block">
              2. 도서 장르
            </label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white border border-lavender-border focus:border-brand-purple focus:ring-1 focus:ring-brand-purple rounded-xl px-4 py-2 text-xs md:text-sm outline-none text-navy-purple font-bold cursor-pointer"
              id="creation-category-select"
            >
              <option value="동화">🧸 동화</option>
              <option value="소설">📚 소설</option>
              <option value="시">✍️ 시</option>
              <option value="에세이">💭 에세이</option>
            </select>
          </div>

          {/* 3. Book Description Textarea */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-navy-purple block">
              3. 도서 줄거리 요약 (선택)
            </label>
            <textarea 
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="직접 연필로 창조하고 싶은 재미있는 내용을 짧게 적어보세요."
              rows={3}
              className="w-full bg-white border border-lavender-border focus:border-brand-purple focus:ring-1 focus:ring-brand-purple rounded-xl px-4 py-2 text-xs md:text-sm outline-none text-navy-purple resize-none leading-relaxed"
              id="creation-desc-input"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end pt-2.5 border-t border-lavender-border">
          <button 
            type="submit"
            disabled={!title.trim()}
            className="px-5 py-2 bg-brand-gradient hover:opacity-95 text-white font-bold text-xs rounded-full shadow-md shadow-brand-purple/10 border border-white/10 cursor-pointer select-none transition-all active:scale-95 disabled:opacity-40 flex items-center gap-1.5"
            id="creation-submit-btn"
          >
            <PlusCircle className="w-4 h-4" /> 책꽂이에 등재하기
          </button>
        </div>
      </form>
    </div>
  );
}
