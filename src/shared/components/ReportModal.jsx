import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

// value는 백엔드 ReportReason enum(SPAM/ABUSE/SEXUAL/OTHER)과 일치해야 함
const REASONS = [
  { value: "SPAM", label: "스팸 / 광고" },
  { value: "ABUSE", label: "욕설 / 혐오 표현" },
  { value: "SEXUAL", label: "음란물 / 불법 콘텐츠" },
  { value: "OTHER", label: "기타" },
];

export default function ReportModal({ isOpen, onClose, targetLabel, onSubmit }) {
  const [reason, setReason] = useState(REASONS[0].value);
  const [detail, setDetail] = useState("");

  const handleSubmit = e => {
    e.preventDefault();
    onSubmit({ reason, detail: detail.trim() });
    setReason(REASONS[0].value);
    setDetail("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[#110F24]/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 select-none"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 15 }}
            className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#d4cdf2] flex flex-col relative select-text"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#d4cdf2]/60 pb-3">
              <h3 className="font-serif font-bold text-neutral-900 text-base">신고하기</h3>
              <button onClick={onClose} className="p-1 hover:bg-[#e6e2fc]/60 text-neutral-400 hover:text-neutral-900 rounded-full transition">
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-500 mt-3">
              {targetLabel}을(를) 신고합니다. 신고된 내용은 운영 정책에 따라 검토됩니다.
            </p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-mono font-bold text-neutral-500 uppercase tracking-wider mb-2">신고 사유</label>
                <div className="space-y-1.5">
                  {REASONS.map(r => (
                    <label key={r.value} className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer">
                      <input type="radio" name="report-reason" value={r.value} checked={reason === r.value} onChange={() => setReason(r.value)} className="accent-[#6b54e7]" />
                      {r.label}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-mono font-bold text-neutral-500 uppercase tracking-wider mb-1.5">상세 내용 (선택)</label>
                <textarea
                  rows={3}
                  placeholder="신고 사유에 대한 추가 설명이 있다면 적어주세요."
                  value={detail}
                  onChange={e => setDetail(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#6b54e7]/50 focus:border-[#6b54e7] font-sans resize-none leading-relaxed"
                />
              </div>
              <div className="flex gap-2.5 pt-1">
                <button type="button" onClick={onClose} className="flex-1 border border-[#d4cdf2] hover:bg-[#f3f0ff] text-[#7c769d] text-xs font-bold py-2.5 rounded-xl transition">
                  취소
                </button>
                <button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2.5 rounded-xl transition shadow-sm">
                  신고 제출
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
