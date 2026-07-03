import React, { useState } from 'react';
import { Plus } from 'lucide-react';

export default function SavedAuthorTab({ favoriteAuthors,
  setFavoriteAuthors,
  setActiveTab,
  onSelectAuthor,
  onOpenAuthorSearch }) {
  // Local form states co-located in the tab
  const [isAddAuthorOpen, setIsAddAuthorOpen] = useState(false);
  const [newAuthorName, setNewAuthorName] = useState('');
  const [newAuthorGenre, setNewAuthorGenre] = useState('');
  const [newAuthorWorks, setNewAuthorWorks] = useState('');
  const [newAuthorAvatar, setNewAuthorAvatar] = useState('👩‍🎨');

  return (
    <div className="space-y-4 bg-transparent text-navy-purple">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 select-none">
        <div>
          <h3 className="font-plus text-xl font-black text-navy-purple">관심 작가 목록</h3>
        </div>

        <button
          onClick={onOpenAuthorSearch}
          id="toggle-add-author-btn"
          className="flex items-center gap-1.5 bg-brand-purple hover:bg-brand-dark text-white font-bold text-xs px-4 py-2.5 rounded-full shadow-sm cursor-pointer select-none transition-all"
        >
          <Plus className="w-4 h-4" /> 관심 작가 등록
        </button>
      </div>

      {/* Inline collapse Author Adding FORM inside UI directly */}
      {isAddAuthorOpen && (
        <div
          className="bg-white p-5 rounded-3xl border border-lavender-border shadow-sm space-y-4 overflow-hidden"
        >
          <h4 className="font-plus font-bold text-sm text-navy-purple">새 관심 작가 신규 등록</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-navy-purple/70">작가 이름</label>
              <input
                type="text"
                placeholder="예: 지우작가, 구름요정"
                value={newAuthorName}
                onChange={(e) => setNewAuthorName(e.target.value)}
                className="w-full bg-white border border-lavender-border focus:border-brand-purple rounded-xl px-3 py-2 text-xs outline-none text-navy-purple"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-navy-purple/70">주 장르</label>
              <input
                type="text"
                placeholder="예: 공룡 어드벤처, 수채화 만화"
                value={newAuthorGenre}
                onChange={(e) => setNewAuthorGenre(e.target.value)}
                className="w-full bg-white border border-lavender-border focus:border-brand-purple rounded-xl px-3 py-2 text-xs outline-none text-navy-purple"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-navy-purple/70">대표작</label>
              <input
                type="text"
                placeholder="예: 아기사우루스의 가치 등"
                value={newAuthorWorks}
                onChange={(e) => setNewAuthorWorks(e.target.value)}
                className="w-full bg-white border border-lavender-border focus:border-brand-purple rounded-xl px-3 py-2 text-xs outline-none text-navy-purple"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              className="px-4 py-2 bg-white text-brand-purple hover:bg-lavender-bg rounded-full text-xs font-bold border border-lavender-border"
              onClick={() => {
                setIsAddAuthorOpen(false);
                setNewAuthorName('');
                setNewAuthorGenre('');
                setNewAuthorWorks('');
              }}
            >
              취소
            </button>
            <button
              disabled={!newAuthorName.trim()}
              className="px-5 py-2 bg-brand-purple hover:bg-brand-dark text-white rounded-full text-xs font-bold disabled:opacity-45 transition-all"
              onClick={() => {
                const newAuthObj = {
                  id: `custom_auth_${Date.now()}`,
                  name: newAuthorName,
                  genre: newAuthorGenre || '자연 감성 창작소정',
                  likes: 1,
                  avatar: newAuthorAvatar,
                  works: newAuthorWorks || '첫 등록 작품집 예정',
                  isFavorite: true
                };
                setFavoriteAuthors((prev) => [newAuthObj, ...prev]);
                setNewAuthorName('');
                setNewAuthorGenre('');
                setNewAuthorWorks('');
                setIsAddAuthorOpen(false);
              }}
            >
              관심 작가 추가
            </button>
          </div>
        </div>
      )}

      {/* Authors Display Group split into My Favorites and Recommendations */}
      <div className="space-y-5 select-none">

        {/* Section 1: My Favorites */}
        <div>
          <h4 className="text-[10px] font-bold text-navy-purple mb-2.5 flex items-center gap-1.5 bg-white border border-lavender-border px-3 py-1.5 rounded-full self-start inline-block">
            ❤️ 내가 등록한 관심 작가 ({favoriteAuthors.filter(a => a.isFavorite).length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {favoriteAuthors.filter(a => a.isFavorite).map((author) => (
              <div
                key={author.id}
                onClick={() => onSelectAuthor(author.name)}
                className="bg-white rounded-2xl border border-lavender-border shadow-sm p-4 flex flex-col justify-between h-[180px] group hover:scale-[1.01] hover:border-brand-purple/50 transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white border border-lavender-border flex items-center justify-center text-xl select-none group-hover:scale-110 transition-all shrink-0 shadow-sm">
                      {author.avatar}
                    </div>
                    <div>
                      <h4 className="font-plus font-bold text-sm text-navy-purple tracking-tight">{author.name}</h4>
                      <span className="text-[9px] text-purple-gray-text">{author.genre}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFavoriteAuthors(prev => prev.map(a => a.id === author.id ? { ...a, isFavorite: false } : a));
                    }}
                    className="w-7 h-7 rounded-full bg-white border border-lavender-border text-rose-500 flex items-center justify-center text-xs hover:bg-rose-50 transition-all cursor-pointer"
                    title="관심 작가 취소"
                  >
                    ❤️
                  </button>
                </div>

                <div className="py-1.5">
                  <p className="text-[10px] text-purple-gray-text">대표작: <strong className="text-navy-purple">{author.works}</strong></p>
                </div>

                <div className="flex items-center text-[10px] font-bold text-navy-purple border-t border-lavender-border pt-2.5">
                  <span className="text-navy-purple">👥 팔로우 수: {author.likes.toLocaleString()}명</span>
                </div>
              </div>
            ))}

            {favoriteAuthors.filter(a => a.isFavorite).length === 0 && (
              <div className="col-span-full py-8 bg-white border border-dashed border-lavender-border rounded-2xl text-center select-none text-[10px] text-purple-gray-text">
                아직 관심 등록된 작가가 없어요. 새로운 작가를 등록해 보세요!
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
