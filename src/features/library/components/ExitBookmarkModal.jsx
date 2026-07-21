import { Bookmark, X } from "lucide-react";

export default function ExitBookmarkModal({
  show,
  hasBookmark,
  currentPage,
  savedPage,
  saving,
  onContinueReading,
  onKeepAndExit,
  onSaveAndExit,
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#110F24]/60 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-[#6b54e7]" />
            <h2 className="text-lg font-bold text-black">
              {hasBookmark
                ? "이어 읽기 위치를 변경할까요?"
                : "이어 읽기 위치를 저장해주세요"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onContinueReading}
            disabled={saving}
            className="rounded-full p-1 text-black/50 hover:bg-black/5"
            aria-label="모달 닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {hasBookmark ? (
          <p className="mt-4 text-sm leading-6 text-black/70">
            현재 읽고 있는 페이지는{" "}
            <strong>{currentPage}페이지</strong>입니다.
            <br />
            새 위치를 저장하지 않으면 다음에도 기존 책갈피인{" "}
            <strong>{savedPage}페이지</strong>부터 시작합니다.
          </p>
        ) : (
          <p className="mt-4 text-sm leading-6 text-black/70">
            이 책에는 아직 저장된 책갈피가 없습니다.
            <br />
            현재 <strong>{currentPage}페이지</strong>를 저장해야
            뷰어에서 나갈 수 있습니다.
          </p>
        )}

        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={onSaveAndExit}
            disabled={saving}
            className="w-full rounded-xl bg-[#6b54e7] px-4 py-3 text-sm font-bold text-white hover:bg-[#5f47d6] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "저장 중..."
              : hasBookmark
                ? "현재 위치 저장 후 나가기"
                : "책갈피 저장 후 나가기"}
          </button>

          {hasBookmark && (
            <button
              type="button"
              onClick={onKeepAndExit}
              disabled={saving}
              className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm font-bold text-black hover:bg-black/5"
            >
              기존 책갈피 유지하고 나가기
            </button>
          )}

          <button
            type="button"
            onClick={onContinueReading}
            disabled={saving}
            className="w-full rounded-xl px-4 py-3 text-sm font-bold text-black/60 hover:bg-black/5"
          >
            계속 읽기
          </button>
        </div>
      </div>
    </div>
  );
}