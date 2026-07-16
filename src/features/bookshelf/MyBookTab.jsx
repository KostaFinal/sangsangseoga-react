import { Sparkles, ChevronRight } from 'lucide-react';

export default function MyBookTab({ filteredBooks,
  onOpenViewer,
  onDeleteBook,
  onOpenDetail }) {

  const myBooks = filteredBooks.filter(
    (b) => b.isMyWrittenBook
  );

  return (
    <div className="space-y-4 bg-transparent text-navy-purple">
      <div className="flex justify-between items-center select-none header-wrap">
        <div>
          <h3 className="text-xl font-black text-navy-purple">내가 쓴 책</h3>
        </div>


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
                내가 쓴 책
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
                  type="button"
                  onClick={() => onOpenDetail(book)}
                  className="px-3.5 py-2 bg-lavender-bg hover:bg-lavender-card text-brand-purple font-bold text-xs rounded-full cursor-pointer transition-all flex items-center justify-center gap-1 border border-lavender-border"
                >
                  상세 & 수정 🔍
                </button>

                <button
                  type="button"
                  onClick={() => onOpenViewer(book.bookId || book.id)}
                  className="flex-grow py-2 bg-brand-purple hover:bg-brand-dark text-white font-bold text-xs rounded-full cursor-pointer transition-all flex items-center justify-center gap-1 shadow-sm"
                >
                  읽어보기
                  <ChevronRight className="w-3 h-3" />
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    const confirmed = window.confirm(
                      `"${book.title}" 책을 삭제하시겠습니까?\n삭제 후 내가 쓴 책 목록에서 보이지 않습니다.`
                    );

                    if (!confirmed) return;

                    try {
                      await onDeleteBook(book.bookId || book.id);
                    } catch (error) {
                      console.error("책 삭제 실패", error);
                      alert("책 삭제에 실패했습니다.");
                    }
                  }}
                  className="px-3 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs rounded-full cursor-pointer transition-all"
                >
                  삭제
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
    </div>
  );
}
