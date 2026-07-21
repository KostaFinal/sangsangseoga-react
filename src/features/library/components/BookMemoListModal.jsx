import { useEffect, useState } from "react";
import { StickyNote, X } from "lucide-react";
import { getMemosByBook } from "@/src/api/memoApi";

export default function BookMemoListModal({
  book,
  onClose,
  onSelectMemo,
}) {
  const [memos, setMemos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const bookId = book?.bookId || book?.id;

    if (!bookId) {
      setMemos([]);
      return;
    }

    let cancelled = false;

    const loadMemos = async () => {
      try {
        setLoading(true);

        const res = await getMemosByBook(bookId, 1, 20);
        const data = res.data?.data?.content || [];

        if (cancelled) return;

        const validMemos = Array.isArray(data)
          ? data.filter(
            memo =>
              typeof memo.content === "string" &&
              memo.content.trim().length > 0
          )
          : [];

        setMemos(validMemos);
      } catch (err) {
        if (cancelled) return;

        console.error("책 메모 목록 조회 실패", err);
        setMemos([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadMemos();

    return () => {
      cancelled = true;
    };
  }, [book?.bookId, book?.id]);

  if (!book) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#110F24]/60 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
        onClick={event => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <StickyNote className="h-5 w-5 text-brand-purple" />

              <h2 className="text-lg font-bold text-navy-purple">
                메모 목록
              </h2>
            </div>

            <p className="mt-1 text-sm text-purple-gray-text">
              {book.title}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-black/50 hover:bg-black/5"
            aria-label="메모 목록 닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 max-h-[420px] space-y-2 overflow-y-auto pr-1">
          {loading ? (
            <div className="py-12 text-center text-sm text-purple-gray-text">
              메모를 불러오는 중입니다.
            </div>
          ) : memos.length === 0 ? (
            <div className="py-12 text-center text-sm text-purple-gray-text">
              작성한 메모가 없습니다.
            </div>
          ) : (
            memos.map(memo => {
              const pageNo = Number(memo.pageNo);
              const displayPage = pageNo + 1;

              return (
                <button
                  key={memo.id ?? `${book.bookId || book.id}-${pageNo}`}
                  type="button"
                  onClick={() => onSelectMemo(book, pageNo)}
                  className="w-full rounded-xl border border-lavender-border p-4 text-left transition hover:border-brand-purple/50 hover:bg-brand-purple/5"
                >
                  <span className="text-xs font-bold text-brand-purple">
                    {displayPage}페이지
                  </span>

                  <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-navy-purple">
                    {memo.content}
                  </p>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}