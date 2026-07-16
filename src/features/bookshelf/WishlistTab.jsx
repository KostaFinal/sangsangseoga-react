import React, { useState } from 'react';
import { Heart, BookOpen } from 'lucide-react';

export default function WishlistTab({ filteredBooks, onOpenDetail, onToggleFavorite, onStartReading }) {
  const [wishlistCategory, setWishlistCategory] = useState('all');

  return (
    <div className="space-y-4 bg-transparent text-navy-purple">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 select-none">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-black text-navy-purple">
            읽고 싶은 책 
          </h3>

          <span className="px-2.5 py-1 rounded-full bg-brand-purple/10 text-brand-purple text-xs font-bold">
            {
              filteredBooks.filter(
                b =>
                  b.isFavorite &&
                  (wishlistCategory === 'all' || b.category === wishlistCategory)
              ).length
            }권
          </span>
        </div>
      </div>

      {/* 장르 카테고리 필터 탭 */}
      <div className="flex gap-2 pb-1 overflow-x-auto select-none no-scrollbar">
        {['all', '소설', '시', '에세이', '동화'].map((cat) => (
          <button
            key={cat}
            onClick={() => setWishlistCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap cursor-pointer ${wishlistCategory === cat
              ? 'bg-brand-purple border-brand-purple text-white shadow-sm scale-105 hover:bg-brand-dark'
              : 'bg-white border-lavender-border text-purple-gray-text hover:bg-lavender-bg hover:text-navy-purple'
              }`}
          >
            {cat === 'all' ? '전체' : cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredBooks
          .filter(b => b.isFavorite && (wishlistCategory === 'all' || b.category === wishlistCategory))
          .map(book => (
            <div
              key={book.id}
              id={`wishbook-${book.id}`}
              onClick={() => onOpenDetail(book)}
              className="bg-white rounded-2xl border border-lavender-border shadow-sm overflow-hidden flex flex-col justify-between group hover:shadow-md hover:border-brand-purple/50 transition-all h-[320px] cursor-pointer"
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <img src={book.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" alt="Book Cover" referrerPolicy="no-referrer" />
                <span className="absolute top-2 left-2 bg-white text-navy-purple font-bold text-[9px] px-2.5 py-0.5 rounded-full border border-lavender-border">
                  {book.category}
                </span>
              </div>
              <div className="p-4 flex-grow flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-sm text-navy-purple tracking-tight truncate">{book.title}</h4>
                  <p className="text-[10px] text-purple-gray-text mt-0.5 line-clamp-2 leading-relaxed">{book.description}</p>
                </div>

                <div className="flex justify-between items-center mt-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(book.id);
                    }}
                    className={`p-2 rounded-full transition-all cursor-pointer ${book.isFavorite ? 'text-rose-500 bg-rose-50' : 'text-purple-gray-text hover:text-rose-500 hover:bg-rose-50'}`}
                  >
                    <Heart className={`w-5 h-5 ${book.isFavorite ? 'fill-rose-500' : ''}`} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log("책 펼치기 클릭");
                      onStartReading(book.id);
                    }}
                    className="flex items-center gap-1 px-3 py-2 rounded-full bg-brand-purple text-white text-xs font-bold hover:bg-brand-dark transition-all cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" />
                    책 펼치기
                  </button>

                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
