import React from 'react';

export const ReportDetailModal = ({
  reportSubTab,
  reportModalOpen,
  setReportModalOpen,
  selectedReport,
  setSelectedReport,
  reportRejectReason,
  setReportRejectReason,
  handleResolveReport
}) => {
  if (!reportModalOpen || !selectedReport) return null;

  return (
    <div className="fixed inset-0 bg-[#110F24]/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans animate-in fade-in duration-150">
      <div className="bg-white border border-[#E6E2FC] max-w-lg w-full text-left p-6 space-y-6 relative rounded-2xl shadow-2xl">
        <div className="flex justify-between items-center border-b border-[#E6E2FC]/50 pb-4">
          <div>
            <span className="text-[9px] font-mono tracking-widest text-[#7C769D] uppercase font-black block">ADMIN PANEL</span>
            <h3 className="text-base font-black text-[#110F24] mt-0.5">신고 상세 내역</h3>
          </div>
          <button 
            onClick={() => {
              setReportModalOpen(false);
              setSelectedReport(null);
            }}
            className="text-xs text-[#7C769D] hover:text-[#110F24] font-black uppercase bg-[#FAF9FF] hover:bg-[#E6E2FC]/30 border border-[#E6E2FC]/50 px-3 py-1.5 rounded-lg cursor-pointer"
          >
            닫기
          </button>
        </div>

        {/* Targeted Content Spec Details */}
        <div className="bg-[#FAF9FF] p-4.5 border border-[#E6E2FC]/40 rounded-xl space-y-2.5">
          <div>
            <span className="text-[#7C769D] block text-[9px] font-bold uppercase">신고 대상</span>
            <p className="font-black text-sm text-[#110F24] leading-tight">
              {reportSubTab === 'books' && `도서: 《${selectedReport.title}》`}
              {reportSubTab === 'comments' && `댓글: “ ${selectedReport.title} ”`}
              {reportSubTab === 'authors' && `작가명: ${selectedReport.title}`}
            </p>
            {reportSubTab === 'comments' && (
              <p className="text-[10.5px] text-[#7C769D] font-medium mt-1">출처 도서: 《{selectedReport.sourceBook}》</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs pt-2.5 border-t border-[#E6E2FC]/30">
            <div>
              <span className="text-[#7C769D] text-[10px] block font-bold mb-1">신고 분류</span>
              <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-black border ${
                selectedReport.category === '스팸' ? 'bg-red-50 text-red-700 border-red-200' :
                selectedReport.category === '욕설' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                selectedReport.category === '음란' ? 'bg-pink-50 text-pink-700 border-pink-200' :
                'bg-[#FAF9FF] text-[#7C769D] border-[#E6E2FC]'
              }`}>
                {selectedReport.category || '기타'}
              </span>
            </div>
            <div>
              <span className="text-[#7C769D] text-[10px] block font-bold mb-1">피신고자</span>
              <p className="font-extrabold text-[#2F2D59]">{selectedReport.author}</p>
              <p className="text-[10px] text-[#7C769D] font-mono mt-0.5">{selectedReport.authorEmail}</p>
            </div>
            <div>
              <span className="text-[#7C769D] text-[10px] block font-bold mb-1">접수일</span>
              <p className="font-semibold text-[#2F2D59] font-mono">{selectedReport.date}</p>
            </div>
          </div>
        </div>

        {/* Informant Statement Spec */}
        <div className="space-y-2 bg-[#FAF9FF] p-4.5 border border-[#E6E2FC]/40 rounded-xl text-left">
          <span className="text-[10px] text-[#7C769D] block font-bold">상세 신고 사유</span>
          <p className="text-xs text-[#2F2D59] leading-relaxed font-semibold italic">
            “ {selectedReport.reason} ”
          </p>
          <div className="text-[10px] text-[#7C769D] border-t border-[#E6E2FC]/30 pt-1.5 mt-2 flex justify-between">
            <span>신고자: {selectedReport.reporter}</span>
            <span className="font-bold text-rose-500 shrink-0">누적 신고: {selectedReport.reportCount}회</span>
          </div>
        </div>

        {/* Resolution Fields */}
        {selectedReport.status === 'pending' ? (
          <div className="space-y-4">
            <div className="space-y-2 text-left">
              <label className="block text-[11px] font-black text-[#7C769D] uppercase tracking-wider">처리 사유 입력 (선택)</label>
              <input 
                type="text"
                value={reportRejectReason}
                onChange={(e) => setReportRejectReason(e.target.value)}
                placeholder="상세 처리 사유를 입력해 주세요."
                className="w-full px-4 py-2.5 bg-[#FAF9FF] text-xs text-[#2F2D59] border border-[#E6E2FC] focus:border-[#6B54E7] focus:bg-white focus:outline-none rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 font-sans">
              <button
                onClick={() => handleResolveReport(selectedReport.id, 'execute')}
                className="py-3 bg-rose-600 hover:bg-rose-750 text-white text-[11px] font-black text-center rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
              >
                {reportSubTab === 'books' && '도서 숨김'}
                {reportSubTab === 'comments' && '댓글 삭제'}
                {reportSubTab === 'authors' && '작가 정지'}
              </button>
              <button
                onClick={() => handleResolveReport(selectedReport.id, 'dismiss')}
                className="py-3 bg-[#110F24] hover:bg-black text-white text-[11px] font-black text-center rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
              >
                신고 반려
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#110F24] text-white p-4.5 text-center font-bold text-xs space-y-1.5 rounded-xl w-full text-left">
            <p className="text-emerald-400 font-extrabold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
              <span>처리가 종결된 신고 사안입니다.</span>
            </p>
            <p className="text-[10px] text-[#B9B0DC] mt-1">
              결과: <span className="font-extrabold text-white">{selectedReport.status === 'hidden' ? '제한 조치 완료' : '신고 반려 완료'}</span>
            </p>
            {selectedReport.resolvedReason && (
              <p className="text-[11px] text-[#B9B0DC] font-normal border-t border-white/10 pt-1.5 mt-1.5">
                <strong className="text-white block text-[10px] uppercase tracking-wider mb-0.5">상세 처리 사유:</strong>
                “ {selectedReport.resolvedReason} ”
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
