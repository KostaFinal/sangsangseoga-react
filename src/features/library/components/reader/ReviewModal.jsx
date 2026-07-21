import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function ReviewModal({ isOpen, onClose, book }) {
  const [text, setText] = useState("");

  const handleSubmit = e => {
    e.preventDefault();
    if (!text.trim()) return;
    const nickname = "익명의 독자";
    const newComment = {
      id: `comment-${Date.now()}`,
      user: nickname,
      text: text.trim(),
      date: new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\s/g, ""),
    };

    const cached = localStorage.getItem("sangsang_books");
    if (cached) {
      try {
        const booksList = JSON.parse(cached);
        const updated = booksList.map(b => {
          if (b.id === book.id) {
            return { ...b, comments: [newComment, ...b.comments], commentsCount: (b.commentsCount || b.comments.length) + 1 };
          }
          return b;
        });
        localStorage.setItem("sangsang_books", JSON.stringify(updated));
        book.comments = [newComment, ...book.comments];
        book.commentsCount = (book.commentsCount || 0) + 1;
      } catch (err) {
        console.error("Local storage error in completion review", err);
      }
    }

    alert(`'${book.title}'에 대한 사색 가득한 댓글이 정상 등록되었습니다.`);
    setText("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[#110F24]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 15 }}
            className="bg-[#fcfaf5] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-black/10 flex flex-col relative select-text"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-black/5 pb-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-neutral-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <h3 className="font-serif font-bold text-neutral-900 text-base">댓글 작성하기</h3>
              </div>
              <button onClick={onClose} className="p-1 hover:bg-black/5 text-neutral-400 hover:text-neutral-900 rounded-full transition">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <textarea
                  required
                  rows={4}
                  placeholder="이 작품을 다 읽으며 머금은 고유한 여운과 단상을 이곳에 남겨 서가에 흩뿌려 보셔요..."
                  value={text}
                  onChange={e => setText(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-xl p-3.5 text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 font-sans resize-none leading-relaxed"
                />
              </div>
              <div className="flex gap-2.5 pt-3">
               <button type="button" onClick={onClose} className="flex-1 border border-[#d4cdf2] text-[#7c769d] hover:bg-[#f3f0ff] hover:border-[#6b54e7] bg-white text-xs font-bold py-2.5 rounded-xl transition">
                취소
              </button>
                <button type="submit" className="flex-1 bg-[#6b54e7] hover:bg-[#6148e1] text-white text-xs font-bold py-2.5 rounded-xl transition shadow-sm">
                확인
                </button>
                
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}