import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import ReviewModal from "./ReviewModal";

export default function CompletionScreen({ book, books = [], onBack, onReread, onSelectRecommended }) {
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedRecommend, setSelectedRecommend] = useState(null);

  const recommendations = books.filter(b => b.id !== book.id).slice(0, 3);

  return (
    <div id="book-completion-root" className="w-full min-h-screen bg-[#f8f7f4] text-black flex flex-col font-sans select-none overflow-x-hidden relative">
      <header className="w-full bg-[#f8f7f4] px-6 md:px-12 h-16 flex items-center justify-between sticky top-0 z-40 select-none">
        <span className="font-serif text-lg font-bold text-neutral-800 tracking-tight">The Silent Anthology</span>
        <button onClick={onBack} className="flex items-center gap-1 text-xs md:text-sm text-neutral-500 hover:text-neutral-900 font-medium transition">
          <span>✕</span> 서재로 돌아가기
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center py-10 px-4 max-w-5xl mx-auto w-full transition-all duration-300">
        <div className="flex flex-col items-center justify-center text-center mt-2 mb-16 max-w-md w-full">
          <div className="w-[68px] h-[68px] text-[#2c525a] bg-[#ecf4f5] rounded-xl flex items-center justify-center mb-6 shadow-sm border border-[#d2e4e6] transform hover:rotate-6 transition duration-300">
            <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>

          <h1 className="text-3xl md:text-4.5xl font-extrabold text-neutral-900 tracking-tight leading-tight">완독을 축하합니다!</h1>
          <p className="text-black font-gowun text-[18px] md:text-[20px] font-bold tracking-tight mt-2.5">
            {book.title} — {book.author}
          </p>
          <span className="inline-block mt-4 bg-[#e6e2fc] text-[#6b54e7] text-xs font-semibold px-4.5 py-1.5 rounded-full border border-[#d4cdf2] shadow-sm">
            총 48페이지 완독
          </span>

          <div className="w-full mt-10 space-y-3.5">
            <button
              onClick={() => setIsReviewOpen(true)}
              className="w-full bg-white hover:bg-neutral-50 text-neutral-800 text-[14px] font-bold py-4 px-6 rounded-2xl border border-neutral-200 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md transition-all duration-200 text-center"
            >
              댓글 작성하기
            </button>
            <div className="grid grid-cols-2 gap-3.5 w-full">
              <button onClick={onBack} className="bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-bold py-3.5 px-4 rounded-xl border border-neutral-200 shadow-sm transition duration-200 text-center">
                서재로 돌아가기
              </button>
              <button
                onClick={() => {
                  onBack();
                  setTimeout(() => {
                    alert("더 풍부한 사색 이야기를 확인하러 친구의 서재나 책 만들기 탭을 방문해보셔요.");
                  }, 100);
                }}
                className="bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-bold py-3.5 px-4 rounded-xl border border-neutral-200 shadow-sm transition duration-200 text-center"
              >
                다른 작품 둘러보기
              </button>
            </div>
          </div>
        </div>

        <div className="w-full max-w-2xl h-px bg-neutral-200/50 mb-14" />

        <div className="text-center mb-10">
          <h2 className="text-lg md:text-xl font-bold text-neutral-800 tracking-wide">이 책과 함께 읽기 좋은 작품</h2>
          <div className="w-8 h-[2px] bg-amber-500/80 mx-auto mt-3" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-10 w-full max-w-4xl px-4">
          {recommendations.map(rec => (
            <div key={rec.id} onClick={() => setSelectedRecommend(rec)} className="flex flex-col items-center group cursor-pointer">
              <div className="w-full aspect-[3/4] bg-neutral-100 rounded-xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] group-hover:shadow-[0_15px_40px_rgba(0,0,0,0.22)] transition-all duration-300 transform group-hover:-translate-y-1">
                <img src={rec.coverImage} alt={rec.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <h3 className="font-sans text-[14px] font-bold text-neutral-800 mt-4 tracking-tight">{rec.title}</h3>
              <p className="text-[11px] text-neutral-400 mt-1">{rec.author}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="w-full py-8 flex flex-col items-center justify-center gap-1 select-none opacity-40 text-[9px] font-mono tracking-widest text-neutral-500 text-center">
        <div>상상서가 &nbsp;|&nbsp; 완독 기록</div>
      </footer>

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
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#fb923c] font-bold">RECOMMENDED</span>
                  <h4 className="text-xl font-serif font-bold mt-1">{selectedRecommend.title}</h4>
                  <p className="text-xs text-white/70 mt-0.5">{selectedRecommend.author}</p>
                </div>
                <button onClick={() => setSelectedRecommend(null)} className="absolute top-3 right-3 p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full transition">
                  ✕
                </button>
              </div>
              <div className="p-6">
                <p className="text-sm font-sans text-neutral-600 leading-relaxed font-normal">{selectedRecommend.description}</p>
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

      <ReviewModal isOpen={isReviewOpen} onClose={() => setIsReviewOpen(false)} book={book} />
    </div>
  );
}
