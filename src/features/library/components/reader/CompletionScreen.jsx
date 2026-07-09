import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, MessageSquare, Eye } from "lucide-react";
import { getRecommendations, getBook } from "@/src/api/bookApi";

const genreBadge = (bookType) => {
  const map = {
    "NOVEL": { cls: "bg-[#ddd6fe] text-[#5b21b6] border-[#c4b5fd]", label: "소설" },
    "POEM": { cls: "bg-[#e9d5ff] text-[#7e22ce] border-[#d8b4fe]", label: "시" },
    "ESSAY": { cls: "bg-[#ede9ff] text-[#6b54e7] border-[#d4cdf2]", label: "에세이" },
    "FAIRY_TALE": { cls: "bg-[#f3e8ff] text-[#9333ea] border-[#e9d5ff]", label: "동화" },
  };
  return map[bookType] || { cls: "bg-[#e6e2fc] text-[#6b54e7] border-[#d4cdf2]", label: bookType };
};

export default function CompletionScreen({ book, onBack, onSelectRecommended, onExploreLibrary }) {
  const [selectedRecommend, setSelectedRecommend] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [pageCount, setPageCount] = useState(null);

  useEffect(() => {
    if (!book?.id) return;
    getRecommendations(book.id, 4)
      .then(res => {
        const items = res.data?.data?.items || [];
        setRecommendations(items.map(item => ({ ...item, coverImage: item.coverImageUrl })));
      })
      .catch(() => setRecommendations([]));
  }, [book?.id]);

  useEffect(() => {
    if (!book?.id) return;
    getBook(book.id)
      .then(res => setPageCount(res.data?.data?.pageCount ?? null))
      .catch(() => setPageCount(null));
  }, [book?.id]);

  return (
    <div id="book-completion-root" className="w-full min-h-screen bg-[#f8f7f4] text-black flex flex-col font-gowun select-none overflow-x-hidden relative">
      <main className="flex-1 flex flex-col items-center justify-center py-10 px-4 max-w-5xl mx-auto w-full transition-all duration-300">
        <div className="flex flex-col items-center justify-center text-center mt-2 mb-8 max-w-md w-full">
          <div className="w-full max-w-[150px] aspect-[3/4] rounded-xl overflow-hidden mb-6 shadow-[0_8px_30px_rgba(0,0,0,0.15)] border border-[#d2e4e6] transform hover:rotate-2 transition duration-300">
            <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>

          <p className="text-black font-gowun text-[18px] md:text-[20px] font-bold tracking-tight mt-2.5">
            {book.title} — {book.author}
          </p>
          {pageCount != null && (
            <span className="inline-block mt-4 bg-[#e6e2fc] text-[#6b54e7] text-sm font-semibold px-4.5 py-1.5 rounded-full border border-[#d4cdf2] shadow-sm">
              총 {pageCount}페이지 완독
            </span>
          )}

          <div className="w-full mt-10 grid grid-cols-2 gap-3.5">
            <button onClick={onBack} className="bg-white hover:bg-neutral-50 text-neutral-800 text-sm font-bold py-3.5 px-4 rounded-xl border border-neutral-200 shadow-sm transition duration-200 text-center">
              서재로 돌아가기
            </button>
            <button
              onClick={() => onExploreLibrary?.()}
              className="bg-white hover:bg-neutral-50 text-neutral-800 text-sm font-bold py-3.5 px-4 rounded-xl border border-neutral-200 shadow-sm transition duration-200 text-center"
            >
              다른 작품 둘러보기
            </button>
          </div>
        </div>

        <div className="w-full max-w-2xl h-px bg-neutral-200/50 mb-8" />

        <div className="text-center mb-10">
          <h2 className="text-lg md:text-xl font-bold text-neutral-800 tracking-wide">이 책과 함께 읽기 좋은 작품</h2>
          <div className="w-8 h-[2px] bg-amber-500/80 mx-auto mt-3" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 md:gap-10 w-full max-w-5xl px-4">
          {recommendations.map(rec => {
            const badge = genreBadge(rec.bookType);
            return (
              <div key={rec.id} onClick={() => setSelectedRecommend(rec)} className="group flex flex-col items-center cursor-pointer">
                <div className="relative w-full aspect-[3/4] bg-neutral-100 rounded-xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] group-hover:shadow-[0_15px_40px_rgba(0,0,0,0.22)] transition-all duration-300 transform group-hover:-translate-y-1">
                  <img src={rec.coverImage} alt={rec.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold border backdrop-blur-sm ${badge.cls}`}>
                    {badge.label}
                  </div>
                  <div className="absolute bottom-0 inset-x-0 p-3 text-left">
                    <h3 className="font-gowun text-white text-sm font-semibold leading-tight line-clamp-2 mb-1.5">{rec.title}</h3>
                    <div className="flex items-center gap-2.5 text-white/80 text-xs">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5" />
                        {(rec.likeCount ?? 0) >= 1000 ? `${(rec.likeCount / 1000).toFixed(1)}k` : (rec.likeCount ?? 0)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {rec.commentCount ?? 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {rec.viewCount ?? 0}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-sm font-bold text-[#2f2d59] mt-2">{rec.author}</p>
              </div>
            );
          })}
        </div>
      </main>

      <AnimatePresence>
        {selectedRecommend && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedRecommend(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-black/5"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative aspect-[4/3] bg-neutral-900 overflow-hidden">
                <img src={selectedRecommend.coverImage} alt={selectedRecommend.title} className="w-full h-full object-cover opacity-90" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-5 text-white">
                  <span className="text-[10px] uppercase font-gowun tracking-widest text-[#fb923c] font-bold">RECOMMENDED</span>
                  <h4 className="text-xl font-gowun font-bold mt-1">{selectedRecommend.title}</h4>
                  <p className="text-xs text-white/70 mt-0.5">{selectedRecommend.author}</p>
                </div>
                <button onClick={() => setSelectedRecommend(null)} className="absolute top-3 right-3 p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full transition">
                  ✕
                </button>
              </div>
              <div className="p-6">
                <p className="text-sm font-gowun text-neutral-600 leading-relaxed font-normal">{selectedRecommend.description}</p>
                <div className="mt-6">
                  <button
                    onClick={() => {
                      onSelectRecommended(selectedRecommend);
                      setSelectedRecommend(null);
                    }}
                    className="w-full bg-[#6b54e7] hover:bg-[#6148e1] text-white text-xs font-bold py-2.5 rounded-lg transition text-center"
                  >
                    상세 정보 보기
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
