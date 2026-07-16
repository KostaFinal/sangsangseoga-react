import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { StickyNote, Trash2, Check } from "lucide-react";
import { getMemo, addMemo, updateMemo, deleteMemo } from "@/src/api/memoApi";

const DEFAULT_POS = { x: 0, y: 0 };

export default function MemoStickyNote({ isOpen, bookId, pageKey, memos, setMemos, onMemoExistenceChange, }) {
  const [memoInput, setMemoInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [pos, setPos] = useState(DEFAULT_POS);
  const dragState = useRef(null);

  // 페이지 변경 시 API로 메모 조회. 이 페이지에 저장된 위치가 있으면 그 위치를, 없으면 기본 위치로 초기화한다.
  useEffect(() => {
    if (!bookId || pageKey === undefined || pageKey === null) {
      return;
    }

    let cancelled = false;

    // 다른 페이지의 메모가 잠깐 보이지 않도록 초기화
    setMemoInput("");
    setIsEditing(false);
    setPos(DEFAULT_POS);

    getMemo(bookId, pageKey)
      .then(res => {
        if (cancelled) return;

        const data = res.data?.data;
        const content =
          typeof data?.content === "string"
            ? data.content
            : "";

        const hasMemo = content.trim().length > 0;

        if (hasMemo) {
          setMemos(prev => ({
            ...prev,
            [pageKey]: content,
          }));

          setMemoInput(content);
        } else {
          setMemos(prev => {
            const updated = { ...prev };
            delete updated[pageKey];
            return updated;
          });

          setMemoInput("");
        }

        setPos(
          data?.posX != null && data?.posY != null
            ? {
              x: Number(data.posX),
              y: Number(data.posY),
            }
            : DEFAULT_POS
        );

        // 저장된 메모가 있으면 열고, 없으면 숨긴다.
        onMemoExistenceChange?.(hasMemo);
      })
      .catch(err => {
        if (cancelled) return;

        console.error("메모 조회 실패", err);

        const cachedMemo = memos[pageKey];
        const hasCachedMemo =
          typeof cachedMemo === "string" &&
          cachedMemo.trim().length > 0;

        setMemoInput(hasCachedMemo ? cachedMemo : "");
        setPos(DEFAULT_POS);

        onMemoExistenceChange?.(hasCachedMemo);
      });

    return () => {
      cancelled = true;
    };
  }, [bookId, pageKey]);

  const handleSave = async () => {
    const trimmedMemo = memoInput.trim();

    // 빈 내용을 저장하지 않는다.
    if (!trimmedMemo) {
      if (memos[pageKey]) {
        await handleDelete();
      } else {
        setMemoInput("");
        setIsEditing(false);
        onMemoExistenceChange?.(false);
      }

      return;
    }

    try {
      const existing = memos[pageKey];

      if (existing) {
        await updateMemo(
          bookId,
          pageKey,
          trimmedMemo,
          pos.x,
          pos.y
        );
      } else {
        await addMemo(
          bookId,
          pageKey,
          trimmedMemo,
          pos.x,
          pos.y
        );
      }

      setMemos(prev => ({
        ...prev,
        [pageKey]: trimmedMemo,
      }));

      setMemoInput(trimmedMemo);
      setIsEditing(false);
      onMemoExistenceChange?.(true);
    } catch (err) {
      console.error("메모 저장 실패", err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMemo(bookId, pageKey);
      setMemos(prev => {
        const updated = { ...prev };
        delete updated[pageKey];
        return updated;
      });
      setMemoInput("");
      setIsEditing(false);
      onMemoExistenceChange?.(false);
    } catch (err) {
      console.error("메모 삭제 실패", err);
    }
  };

  // 메모지 드래그 이동 (탭 부분을 손잡이로 사용)
  const handleDragStart = e => {
    const point = e.touches ? e.touches[0] : e;
    dragState.current = { startX: point.clientX, startY: point.clientY, origX: pos.x, origY: pos.y };
    window.addEventListener("mousemove", handleDragMove);
    window.addEventListener("mouseup", handleDragEnd);
    window.addEventListener("touchmove", handleDragMove);
    window.addEventListener("touchend", handleDragEnd);
  };
  const handleDragMove = e => {
    if (!dragState.current) return;
    const point = e.touches ? e.touches[0] : e;
    const dx = point.clientX - dragState.current.startX;
    const dy = point.clientY - dragState.current.startY;
    setPos({ x: dragState.current.origX + dx, y: dragState.current.origY + dy });
  };
  const handleDragEnd = () => {
    dragState.current = null;
    window.removeEventListener("mousemove", handleDragMove);
    window.removeEventListener("mouseup", handleDragEnd);
    window.removeEventListener("touchmove", handleDragMove);
    window.removeEventListener("touchend", handleDragEnd);
    setPos(current => {
      const existing = memos[pageKey];
      if (existing) {
        updateMemo(bookId, pageKey, existing, current.x, current.y).catch(err => console.error("메모 위치 저장 실패", err));
      }
      return current;
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="absolute right-4 bottom-4 md:right-6 md:bottom-6 z-30"
          style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -4, y: 15 }}
            animate={{ opacity: 1, scale: 1, rotate: 2, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, rotate: -4, y: 15 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-[190px] sm:w-[230px] bg-[#fef9c3] p-4.5 rounded-sm shadow-[0_12px_24px_rgba(0,0,0,0.08),inset_0_2px_4px_rgba(255,255,255,0.6)] border border-yellow-200 select-text font-gowun text-xs md:text-sm text-yellow-950 flex flex-col"
          >
            <div
              onMouseDown={handleDragStart}
              onTouchStart={handleDragStart}
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-14 h-5 bg-white/40 backdrop-blur-[1px] border border-white/20 shadow-xs rounded-sm origin-center cursor-grab active:cursor-grabbing"
              title="드래그해서 메모 위치를 옮길 수 있어요"
            />

            <div className="flex justify-between text-xs font-mono font-bold tracking-widest text-[#5a2e0a] mb-2 mt-1 uppercase select-none">
              <span className="flex items-center gap-1">
                <StickyNote className="w-3 h-3" />
                사색 한 줄 메모
              </span>
              <span>NOTE</span>
            </div>

            <div className="flex-1 min-h-[50px] flex flex-col justify-center">
              {isEditing ? (
                <textarea
                  autoFocus
                  value={memoInput}
                  onChange={e => setMemoInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSave();
                    }
                  }}
                  className="w-full bg-transparent border-b border-[#a16207]/30 focus:border-[#a16207] focus:outline-none resize-none font-gowun text-xs text-yellow-950 leading-normal"
                  placeholder="가슴 깊은 울림을 남겨보세요..."
                  rows={2}
                />
              ) : (
                <p
                  onClick={() => setIsEditing(true)}
                  className="cursor-pointer hover:bg-yellow-105/30 p-1 rounded transition-colors text-pretty leading-relaxed text-[#5a2e0a] font-bold font-gowun text-xs"
                  title="클릭하여 메모 수정"
                >
                  {memos[pageKey] || "여기를 터치해 가슴 속 사색을 고이고이 적어보셔요..."}
                </p>
              )}
            </div>

            <div className="flex justify-between items-center mt-2 pt-2 border-t border-[#854d0e]/10 select-none">
              {memos[pageKey] ? (
                <button onClick={handleDelete} className="p-1 text-[#854d0e]/80 hover:text-red-600 transition" title="메모 지우기">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div />
              )}

              {isEditing ? (
                <button onClick={handleSave} className="flex items-center gap-1 bg-[#854d0e] hover:bg-[#713f12] text-white text-[9px] font-bold px-2 py-1 rounded transition shadow-sm">
                  <Check className="w-3 h-3" /> 저장
                </button>
              ) : (
                <button onClick={() => setIsEditing(true)} className="text-xs font-bold text-[#854d0e] hover:text-[#5a2e0a] hover:bg-[#854d0e]/5 px-2 py-1 rounded">
                  수정하기 →
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
