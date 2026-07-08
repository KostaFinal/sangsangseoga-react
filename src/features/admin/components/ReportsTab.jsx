import React from 'react';
import { AlertCircle, MessageSquare, BookOpen, User, Flag, ChevronRight, Calendar } from 'lucide-react';

export const ReportsTab = ({
  reportSubTab,
  setReportSubTab,
  selectedReport,
  setSelectedReport,
  setReportModalOpen,
  reportedBooks,
  reportedComments,
  reportedAuthors
}) => {
  const currentList = reportSubTab === 'books' ? reportedBooks :
    reportSubTab === 'comments' ? reportedComments : reportedAuthors;

  return (
    <div className="space-y-6 animate-in fade-in duration-200 text-left">
      {/* Secondary Report Type Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
        {[
          { id: 'books', name: '도서 신고', count: reportedBooks.filter(r => r.status === 'pending').length, icon: BookOpen },
          { id: 'comments', name: '댓글 신고', count: reportedComments.filter(r => r.status === 'pending').length, icon: MessageSquare },
          { id: 'authors', name: '작가 신고', count: reportedAuthors.filter(r => r.status === 'pending').length, icon: User }
        ].map((sTab) => {
          const Icon = sTab.icon;
          const isSelected = reportSubTab === sTab.id;
          return (
            <button
              key={sTab.id}
              onClick={() => {
                setReportSubTab(sTab.id);
                setSelectedReport(null);
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-bold shrink-0 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#6B54E7] text-white shadow-sm'
                  : 'bg-[#FAF9FF] text-[#7C769D] hover:bg-[#E6E2FC]/40 hover:text-[#2F2D59]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{sTab.name}</span>
              <span className={`font-mono font-black ${isSelected ? 'text-white/90' : 'text-[#6B54E7]'}`}>
                {sTab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Reports List Block (Instead of a broken table layout) */}
      <div className="flex items-center justify-between px-1 gap-3">
        <span className="text-sm font-bold text-[#7C769D]">총 {currentList.length}건</span>
        <span className="inline-flex items-center gap-1 text-xs text-[#7C769D]">
          <AlertCircle className="w-3.5 h-3.5 text-[#B9B0DC] shrink-0" />
          동일 대상 신고는 계정당 1회만 집계됩니다.
        </span>
      </div>
      <div className="space-y-4">
        {(() => {
          if (currentList.length === 0) {
            return (
              <div className="py-20 text-center text-[#7C769D] border border-dashed border-[#E6E2FC] bg-white rounded-3xl font-bold text-sm">
                <Flag className="w-8 h-8 mx-auto text-[#E6E2FC] mb-2.5" />
                접수된 신고 내역이 없습니다.
              </div>
            );
          }

          return [...currentList]
            .sort((a, b) => {
              const pendingDiff = (b.status === 'pending' ? 1 : 0) - (a.status === 'pending' ? 1 : 0);
              return pendingDiff !== 0 ? pendingDiff : new Date(b.createdAt) - new Date(a.createdAt);
            })
            .map((item) => {
              const isSelected = selectedReport?.id === item.id;
              return (
                <div 
                  key={item.id}
                  onClick={() => {
                    setSelectedReport(item);
                    setReportModalOpen(true);
                  }}
                  className={`bg-white rounded-2xl border transition-all p-5 text-left flex flex-col md:flex-row justify-between items-start md:items-center gap-5 cursor-pointer relative group ${
                    isSelected 
                      ? 'border-[#6B54E7] ring-1 ring-[#6B54E7]/30 shadow-md bg-[#FAF9FF]/20' 
                      : 'border-[#E6E2FC]/80 hover:border-[#6B54E7]/50 hover:shadow-sm'
                  }`}
                >
                  {/* Left content: Category, Title, Source */}
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {/* Classification Badge */}
                      <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-black tracking-tight border ${
                        item.category === '스팸' ? 'bg-red-50 text-red-700 border-red-200' :
                        item.category === '욕설' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        item.category === '음란' ? 'bg-pink-50 text-pink-700 border-pink-200' :
                        'bg-[#FAF9FF] text-[#7C769D] border-[#E6E2FC]'
                      }`}>
                        {item.category || '기타'}
                      </span>
                      
                      {/* Date */}
                      <span className="flex items-center gap-1 text-[#7C769D] font-medium font-mono">
                        <Calendar className="w-3.5 h-3.5 text-[#B9B0DC]" />
                        {item.date}
                      </span>
                    </div>

                    {/* Title or Content */}
                    <div>
                      {reportSubTab === 'books' && (
                        <h4 className="text-base font-black text-[#110F24] leading-snug group-hover:text-[#6B54E7] transition-colors">
                          도서: 《{item.title}》
                        </h4>
                      )}
                      {reportSubTab === 'comments' && (
                        <p className="text-sm font-bold text-[#110F24] bg-[#FAF9FF] p-3 rounded-xl border border-[#E6E2FC]/40 leading-relaxed block break-words">
                          {item.title}
                        </p>
                      )}
                      {reportSubTab === 'authors' && (
                        <h4 className="text-base font-black text-[#110F24] leading-snug group-hover:text-[#6B54E7] transition-colors">
                          작가 계정: {item.title}
                        </h4>
                      )}
                    </div>

                    {/* Reporter statement summary */}
                    <div className="text-sm text-[#7C769D] leading-relaxed pl-1">
                      <span className="font-extrabold text-[#2F2D59]">신고사유:</span> {item.reason}
                    </div>
                  </div>

                  {/* Right content: Reporter, status & Action */}
                  <div className="flex flex-wrap md:flex-nowrap items-center justify-between md:justify-end gap-4 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-3.5 md:pt-0 border-[#E6E2FC]/40">

                    {/* Reporter Info */}
                    <div className="text-left md:text-right space-y-0.5">
                      <span className="text-xs text-[#7C769D] block font-bold">신고자</span>
                      <span className="text-sm font-black text-[#2F2D59]">{item.reporterNickname}</span>
                    </div>

                    {/* Status badge */}
                    <div className="shrink-0 min-w-[70px] text-center">
                      <span className={`inline-block w-full px-2.5 py-1 rounded-full text-xs font-bold border ${
                        item.status === 'pending' ? 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse' :
                        item.status === 'hidden' ? 'bg-[#110F24] text-white border-transparent' :
                        'bg-[#FAF9FF] text-[#7C769D] border-[#E6E2FC]'
                      }`}>
                        {item.status === 'pending' ? '심사 대기' :
                         item.status === 'hidden' ? '숨김/제한 완료' : '반려'}
                      </span>
                    </div>

                    {/* Click Indicator Arrow */}
                    <div className="hidden md:block text-[#B9B0DC] group-hover:text-[#6B54E7] transition-all">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              );
            })
        })()}
      </div>
    </div>
  );
};
