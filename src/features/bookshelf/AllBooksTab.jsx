import React, { useState } from 'react';
import { Sparkles, ChevronRight, X, Edit2, Save, BookOpen, Clock, Tag, FileText, Award, Calendar } from 'lucide-react';

export default function AllBooksTab({ filteredBooks, onOpenViewer, setActiveTab, onUpdateBook }) {
  const [selectedBook, setSelectedBook] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    id: '',
    title: '',
    author: '',
    category: '',
    description: '',
    readingTime: '',
    pages: 30,
    magicLevel: 'Lv. 1'
  });

  const handleOpenDetail = (book) => {
    setSelectedBook(book);
    setEditForm({
      id: book.id,
      title: book.title,
      author: book.author,
      category: book.category,
      description: book.description,
      readingTime: book.readingTime || '10분',
      pages: book.pages || 15,
      magicLevel: book.magicLevel || 'Lv. 1',
      isPublic: book.isPublic ?? true
    });
    setIsEditing(false);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editForm.title.trim()) return;

    const updated = {
      ...selectedBook,
      title: editForm.title,
      author: editForm.author,
      category: editForm.category,
      description: editForm.description,
      readingTime: editForm.readingTime,
      pages: Number(editForm.pages),
      magicLevel: editForm.magicLevel,
      isPublic: editForm.isPublic
    };

    onUpdateBook(updated);
    setSelectedBook(updated);
    setIsEditing(false);
  };

  const myBooks = filteredBooks.filter(
    (b) => b.author.includes('지우') || b.category === '나만의 AI 창작' || b.id.includes('manual')
  );

  return (
    <div className="space-y-4 bg-transparent text-navy-purple">
      <div className="flex justify-between items-center select-none header-wrap">
        <div>
          <h3 className="font-plus text-xl font-black text-navy-purple">내가 쓴 책</h3>
        </div>

        <button 
          onClick={() => setActiveTab('create')}
          id="shortcut-ai-btn"
          className="flex items-center gap-1.5 bg-brand-gradient hover:opacity-95 text-white font-bold text-xs px-4 py-2 rounded-full shadow-md shadow-brand-purple/10 border border-white/10 cursor-pointer select-none transition-all active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-white animate-spin" /> 새 이야기 집필하러 가기
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {myBooks.map(book => (
          <div 
            key={book.id} 
            id={`userbook-${book.id}`}
            className="bg-white rounded-2xl border border-lavender-border shadow-sm overflow-hidden flex flex-col justify-between group hover:shadow-md hover:border-brand-purple/50 transition-all h-[340px]"
          >
            <div className="relative aspect-[16/9] overflow-hidden">
              <img src={book.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" alt="Book Cover" referrerPolicy="no-referrer" />
              <span className="absolute top-2 left-2 bg-white text-navy-purple font-bold text-[9px] px-2.5 py-0.5 rounded-full border border-lavender-border shadow-sm">
                 내가 쓴 책 {book.isPublic === false ? '(비공개)' : ''}
              </span>
            </div>
            <div className="p-4 flex-grow flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-[9px] font-extrabold px-2 py-0.5 bg-lavender-bg text-brand-purple rounded-full">
                    {book.category}
                  </span>
                  <span className="text-[9px] text-purple-gray-text font-semibold">
                    {book.author}
                  </span>
                </div>
                <h4 className="font-plus font-bold text-sm text-navy-purple tracking-tight truncate mt-1.5">{book.title}</h4>
                <p className="text-[10px] text-purple-gray-text mt-1 line-clamp-2 leading-relaxed">{book.description}</p>
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleOpenDetail(book)}
                  className="px-3.5 py-2 bg-lavender-bg hover:bg-lavender-card text-brand-purple font-bold text-xs rounded-full cursor-pointer transition-all flex items-center justify-center gap-1 border border-lavender-border"
                  title="도서 정보 조회 및 수정"
                >
                  상세 & 수정 🔍
                </button>
                <button
                  onClick={() => onOpenViewer(book.id)}
                  id={`open-user-book-${book.id}`}
                  className="flex-grow py-2 bg-brand-purple hover:bg-brand-dark text-white font-bold text-xs rounded-full cursor-pointer transition-all flex items-center justify-center gap-1 shadow-sm"
                >
                  읽어보기 <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {myBooks.length === 0 && (
          <div className="col-span-full py-10 text-center border-2 border-dashed border-lavender-border rounded-2xl bg-white max-w-lg mx-auto w-full select-none flex flex-col items-center justify-center gap-2">
            <span className="text-4xl">✒️</span>
            <h5 className="font-plus font-bold text-sm text-navy-purple">아직 상상 속에 봉인되어 있어요!</h5>
            <p className="text-[10px] text-purple-gray-text max-w-[210px] leading-relaxed">
              우측 사이드바의 <Sparkles className="w-3.5 h-3.5 inline text-brand-purple" /> [독후감] 또는 위의 집필을 통해서 나만의 새로운 상상 도서를 창작해 직접 등재해 보세요!
            </p>
          </div>
        )}
      </div>

      {/* Book Detail & Edit Modal */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-lavender-border shadow-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-lavender-bg px-6 py-4 border-b border-lavender-border flex justify-between items-center">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-brand-purple" />
                <h4 className="font-serif font-black text-navy-purple text-base">
                  {isEditing ? '내 이야기 수정하기 🧙' : '도서 상세 정보 📖'}
                </h4>
              </div>
              <button 
                onClick={() => setSelectedBook(null)}
                className="w-8 h-8 rounded-full bg-white hover:bg-lavender-bg text-navy-purple border border-lavender-border flex items-center justify-center cursor-pointer transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {isEditing ? (
                <form onSubmit={handleSaveEdit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-extrabold text-navy-purple block mb-1">도서 제목</label>
                      <input 
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        required
                        className="w-full bg-white border border-lavender-border rounded-xl px-3.5 py-2 text-xs font-bold text-navy-purple outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all"
                        placeholder="이야기 제목을 지어주세요"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-extrabold text-navy-purple block mb-1">지은이 (작가)</label>
                      <input 
                        type="text"
                        value={editForm.author}
                        onChange={(e) => setEditForm({ ...editForm, author: e.target.value })}
                        required
                        className="w-full bg-white border border-lavender-border rounded-xl px-3.5 py-2 text-xs font-bold text-navy-purple outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all"
                        placeholder="작가명을 지정해 주세요"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-extrabold text-navy-purple block mb-1">장르 및 카테고리</label>
                      <select
                        value={editForm.category}
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                        className="w-full bg-white border border-lavender-border rounded-xl px-3 py-2 text-xs font-extrabold text-navy-purple outline-none cursor-pointer hover:border-brand-purple focus:border-brand-purple transition-all"
                      >
                        <option value="동화">동화 (Fantasy Fairy Tale)</option>
                        <option value="SF">SF (Sci-Fi Adventure)</option>
                        <option value="나만의 AI 창작">나만의 AI 창작</option>
                        <option value="모험">스릴 만점 모험</option>
                        <option value="학습">지혜로운 학습</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-extrabold text-navy-purple block mb-1">독서 시간</label>
                      <input 
                        type="text"
                        value={editForm.readingTime}
                        onChange={(e) => setEditForm({ ...editForm, readingTime: e.target.value })}
                        className="w-full bg-white border border-lavender-border rounded-xl px-3.5 py-2 text-xs font-bold text-navy-purple outline-none focus:border-brand-purple transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-extrabold text-navy-purple block mb-1">총 페이지 수</label>
                      <input 
                        type="number"
                        value={editForm.pages}
                        onChange={(e) => setEditForm({ ...editForm, pages: Number(e.target.value) })}
                        className="w-full bg-white border border-lavender-border rounded-xl px-3.5 py-2 text-xs font-bold text-navy-purple outline-none focus:border-brand-purple transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-extrabold text-navy-purple block mb-1">공개 설정</label>
                      <button
                        type="button"
                        onClick={() => setEditForm({ ...editForm, isPublic: !editForm.isPublic })}
                        className={`w-full py-2 rounded-xl text-xs font-bold transition-all border ${editForm.isPublic ? 'bg-brand-purple text-white border-brand-purple' : 'bg-lavender-bg text-navy-purple border-lavender-border'}`}
                      >
                        {editForm.isPublic ? '공개 중' : '비공개 중'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-extrabold text-navy-purple block mb-1">줄거리 및 설명</label>
                    <textarea 
                      rows={4}
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="w-full bg-white border border-lavender-border rounded-xl p-3.5 text-xs text-navy-purple outline-none resize-none tracking-wide font-medium focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all leading-relaxed"
                      placeholder="도서의 상상 줄거리를 아름답게 펼쳐 적어보세요..."
                    />
                  </div>

                  <div className="flex justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-white border border-lavender-border text-navy-purple rounded-full text-xs font-bold shadow-sm hover:bg-lavender-bg transition-all cursor-pointer"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-brand-purple hover:bg-brand-dark text-white rounded-full text-xs font-bold shadow-md transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" /> 설정 저장하기
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                  {/* Left Side cover banner */}
                  <div className="md:col-span-5 bg-lavender-bg/40 rounded-2xl p-4 flex flex-col justify-between border border-lavender-border shadow-inner relative min-h-[240px]">
                    <div className="mx-auto my-auto relative w-32 h-44 rounded-xl shadow-lg border border-lavender-border overflow-hidden bg-white">
                      <img src={selectedBook.coverUrl} className="w-full h-full object-cover" alt="Cover detail" referrerPolicy="no-referrer" />
                      <div className="absolute top-2 right-2 bg-brand-purple text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow">
                        {selectedBook.magicLevel || 'Lv. 1'}
                      </div>
                    </div>
                    
                    <div className="flex justify-center gap-2 mt-4">
                      <span className="text-[9px] font-extrabold px-2.5 py-1 bg-white border border-lavender-border text-brand-purple rounded-full shadow-xs">
                        {selectedBook.category}
                      </span>
                      <span className="text-[9px] font-extrabold px-2.5 py-1 bg-white border border-lavender-border text-navy-purple rounded-full shadow-xs">
                        {selectedBook.readingTime || '10분'}
                      </span>
                    </div>
                  </div>

                  {/* Right Side metadata display */}
                  <div className="md:col-span-7 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] font-extrabold text-brand-purple flex items-center gap-1">
                          <Tag className="w-3 h-3" /> {selectedBook.author} 님의 작품
                        </span>
                        <h3 className="font-serif font-black text-navy-purple text-lg mt-1 tracking-tight">
                          {selectedBook.title}
                        </h3>
                      </div>

                      <div className="bg-lavender-bg/30 p-3.5 rounded-xl border border-dashed border-lavender-border">
                        <span className="text-[9px] font-extrabold text-navy-purple block mb-1 flex items-center gap-1">
                          <FileText className="w-3 h-3 text-brand-purple" /> 상상 시놉시스 (줄거리)
                        </span>
                        <p className="text-xs text-purple-gray-text leading-relaxed font-medium">
                          {selectedBook.description || '이 책은 별도의 줄거리 요약이 정의되지 않은 무한한 우주의 신비로운 이야기입니다.'}
                        </p>
                      </div>

                      {/* Info Row parameters */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white border border-lavender-border rounded-xl p-2.5 text-center flex items-center justify-between px-3.5">
                          <span className="text-[10px] font-bold text-purple-gray-text flex items-center gap-1">
                            <Clock className="w-3 h-3 text-indigo-400" /> 완독 시간
                          </span>
                          <span className="text-xs font-bold text-navy-purple">{selectedBook.readingTime || '10분'}</span>
                        </div>
                        <div className="bg-white border border-lavender-border rounded-xl p-2.5 text-center flex items-center justify-between px-3.5">
                          <span className="text-[10px] font-bold text-purple-gray-text flex items-center gap-1">
                            <Award className="w-3 h-3 text-amber-500" /> 총 분량
                          </span>
                          <span className="text-xs font-bold text-navy-purple">{selectedBook.pages || 15}쪽</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2.5 mt-6 pt-4 border-t border-lavender-border">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-white border border-lavender-border text-navy-purple rounded-full text-xs font-bold shadow-sm hover:bg-lavender-bg transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3 text-brand-purple" /> 정보 수정
                      </button>
                      
                      <button
                        onClick={() => {
                          onOpenViewer(selectedBook.id);
                          setSelectedBook(null);
                        }}
                        className="flex-grow py-2 bg-brand-purple hover:bg-brand-dark text-white font-bold text-xs rounded-full cursor-pointer transition-all flex items-center justify-center gap-1 shadow-sm"
                      >
                        이 책 지금 읽어보기 <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
