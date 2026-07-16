import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, History, ExternalLink } from 'lucide-react';

const ACTION_TYPE_BADGE = {
  BOOK_HIDE: 'bg-rose-50 text-rose-800 border-rose-200',
  COMMENT_DELETE: 'bg-rose-50 text-rose-800 border-rose-200',
  AUTHOR_SUSPEND: 'bg-rose-50 text-rose-800 border-rose-200',
  REPORT_REJECT: 'bg-[#FAF9FF] text-[#7C769D] border-[#E6E2FC]',
};

// actionType이 targetType을 함축한다(BOOK_HIDE<->BOOK 등, REPORT_REJECT만 대상 무관)
// 이므로 targetType/actionType을 독립된 두 축으로 필터링하면 "댓글 신고인데 작가 정지" 같은
// 실제로 존재할 수 없는 조합도 선택 가능해져 신고 관리 탭과 다르게 혼란을 줌 → 단일 축으로 통합
const ACTION_TYPE_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'BOOK_HIDE', label: '도서' },
  { value: 'COMMENT_DELETE', label: '댓글' },
  { value: 'AUTHOR_SUSPEND', label: '작가' },
  { value: 'REPORT_REJECT', label: '신고 반려' },
];

const pillClassName = (isSelected) => `inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-bold shrink-0 transition-all cursor-pointer ${
  isSelected
    ? 'bg-[#6B54E7] text-white shadow-sm'
    : 'bg-[#FAF9FF] text-[#7C769D] hover:bg-[#E6E2FC]/40 hover:text-[#2F2D59]'
}`;

export const ActionLogsTab = ({
  actionLogs,
  actionLogPage,
  actionLogTotalCount,
  actionLogHasNext,
  actionLogPageSize,
  actionLogActionTypeFilter,
  setActionLogActionTypeFilter,
  goToActionLogPage,
}) => {
  const totalPages = Math.max(1, Math.ceil(actionLogTotalCount / actionLogPageSize));
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-in fade-in duration-200 text-left">
      {/* Action Type Filter Tabs (조치 종류 = 신고 대상 종류를 함축하므로 단일 축) */}
      <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
        {ACTION_TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setActionLogActionTypeFilter(opt.value)}
            className={pillClassName(actionLogActionTypeFilter === opt.value)}
          >
            <span>{opt.label}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between px-1">
        <span className="text-sm font-bold text-[#7C769D]">총 {actionLogTotalCount}건</span>
      </div>

      <div className="bg-white rounded-2xl border border-[#E6E2FC]/60 shadow-xs overflow-hidden text-left">
        <div className="overflow-x-auto hide-scrollbar">
          <table className="w-full text-sm">
            <thead className="bg-[#FAF9FF] text-[#7C769D] border-b border-[#E6E2FC]/50 text-xs font-extrabold uppercase tracking-widest">
              <tr>
                <th className="py-4 px-6 text-left font-gowun">처리 시각</th>
                <th className="py-4 px-4 text-left">처리 관리자</th>
                <th className="py-4 px-4 text-center">신고 대상</th>
                <th className="py-4 px-4 text-center">조치</th>
                <th className="py-4 px-6 text-left">처리 사유</th>
                <th className="py-4 px-4 text-center">확인</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E2FC]/30">
              {actionLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-[#7C769D] font-bold">
                    <History className="w-8 h-8 mx-auto text-[#E6E2FC] mb-2.5" />
                    처리 이력이 없습니다.
                  </td>
                </tr>
              ) : (
                actionLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FAF9FF]/60 transition-colors">
                    <td className="py-4 px-6 text-[#7C769D] font-gowun whitespace-nowrap">{log.date}</td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-[#2F2D59]">{log.adminNickname}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-[#2F2D59] font-semibold">{log.targetTypeLabel}</span>
                      <span className="text-[#7C769D] font-gowun text-xs ml-1">#{log.targetId}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        ACTION_TYPE_BADGE[log.actionType] || 'bg-[#FAF9FF] text-[#7C769D] border-[#E6E2FC]'
                      }`}>
                        {log.actionTypeLabel}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-[#2F2D59] leading-relaxed">{log.actionReason}</td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => log.targetPath && navigate(log.targetPath)}
                        disabled={!log.targetPath}
                        title={log.targetPath ? '신고 대상으로 이동' : '대상 정보를 불러오는 중입니다'}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold border border-[#E6E2FC] text-[#6B54E7] bg-white hover:bg-[#FAF9FF] disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>신고 대상 확인</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {actionLogTotalCount > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#E6E2FC]/50">
            <span className="text-sm text-[#7C769D] font-semibold">
              {actionLogPage + 1} / {totalPages} 페이지
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => goToActionLogPage(actionLogPage - 1)}
                disabled={actionLogPage === 0}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E6E2FC] text-[#7C769D] hover:border-[#6B54E7] hover:text-[#6B54E7] disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => goToActionLogPage(actionLogPage + 1)}
                disabled={!actionLogHasNext}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E6E2FC] text-[#7C769D] hover:border-[#6B54E7] hover:text-[#6B54E7] disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
