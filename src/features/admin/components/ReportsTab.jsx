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
  return (
    <div className="space-y-6 animate-in fade-in duration-200 text-left">
      {/* Secondary Report Type Selector Tabs */}
      <div className="flex border-b border-[#E6E2FC]/60">
        {[
          { id: 'books', name: '도서 신고 심의', count: reportedBooks.filter(r => r.status === 'pending').length, icon: BookOpen },
          { id: 'comments', name: '댓글 신고 심의', count: reportedComments.filter(r => r.status === 'pending').length, icon: MessageSquare },
          { id: 'authors', name: '작가 계정 신고', count: reportedAuthors.filter(r => r.status === 'pending').length, icon: User }
        ].map((sTab) => {
          const Icon = sTab.icon;
          return (
            <button
              key={sTab.id}
              onClick={() => {
                setReportSubTab(sTab.id);
                setSelectedReport(null);
              }}
              className={`py-3.5 px-6 text-xs font-bold transition-all relative shrink-0 cursor-pointer flex items-center gap-1.5 ${
                reportSubTab === sTab.id 
                  ? 'text-[#6B54E7] border-b-2 border-[#6B54E7] font-extrabold' 
                  : 'text-[#7C769D] hover:text-[#2F2D59]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{sTab.name}</span>
              {sTab.count > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-rose-500 text-white font-mono text-[9px] font-bold rounded-full">
                  {sTab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Policy Notice Box */}
      <div className="p-4 bg-[#110F24] rounded-2xl text-white text-xs leading-relaxed flex items-start gap-3 shadow-xs">
        <AlertCircle className="w-4 h-4 text-[#835AF1] mt-0.5 shrink-0 animate-pulse" />
        <div>
          <p className="font-extrabold text-[11px] tracking-wide text-white">
            중복 신고 제한 및 정밀 심사 안내
          </p>
          <p className="text-[#B9B0DC] text-[10.5px] mt-1 leading-normal text-left">
            무분별한 중복 신고를 방지하기 위해 동일 대상에 대해서는 계정당 1회만 카운트됩니다. 리스트의 신고 카드를 클릭하시면 상세한 신고 내용 검토 및 반려/제재 조치를 즉시 이행할 수 있습니다.
          </p>
        </div>
      </div>

      {/* Reports List Block (Instead of a broken table layout) */}
      <div className="space-y-4">
        {(() => {
          const currentList = reportSubTab === 'books' ? reportedBooks : 
                              reportSubTab === 'comments' ? reportedComments : reportedAuthors;
          
          if (currentList.length === 0) {
            return (
              <div className="py-20 text-center text-[#7C769D] border border-dashed border-[#E6E2FC] bg-white rounded-3xl font-bold text-xs">
                <Flag className="w-8 h-8 mx-auto text-[#E6E2FC] mb-2.5" />
                접수된 신고 내역이 없습니다.
              </div>
            );
          }

          return [...currentList]
            .sort((a, b) => b.reportCount - a.reportCount)
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
                    <div className="flex flex-wrap items-center gap-2 text-[10px]">
                      {/* Classification Badge */}
                      <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-black tracking-tight border ${
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
                        <h4 className="text-sm font-black text-[#110F24] leading-snug group-hover:text-[#6B54E7] transition-colors">
                          도서: 《{item.title}》
                        </h4>
                      )}
                      {reportSubTab === 'comments' && (
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-[#110F24] bg-[#FAF9FF] p-3 rounded-xl border border-[#E6E2FC]/40 leading-relaxed italic block break-words">
                            “ {item.title} ”
                          </p>
                          <span className="text-[10px] text-[#7C769D] block pl-1">
                            출처 도서: 《{item.sourceBook}》
                          </span>
                        </div>
                      )}
                      {reportSubTab === 'authors' && (
                        <h4 className="text-sm font-black text-[#110F24] leading-snug group-hover:text-[#6B54E7] transition-colors">
                          작가 계정: {item.title}
                        </h4>
                      )}
                    </div>

                    {/* Reporter statement summary */}
                    <div className="text-xs text-[#7C769D] leading-relaxed pl-1">
                      <span className="font-extrabold text-[#2F2D59]">신고사유:</span> {item.reason}
                    </div>
                  </div>

                  {/* Right content: Accused party, counts, status & Action */}
                  <div className="flex flex-wrap md:flex-nowrap items-center justify-between md:justify-end gap-4 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-3.5 md:pt-0 border-[#E6E2FC]/40">
                    
                    {/* Accused User Profile Info */}
                    <div className="text-left md:text-right space-y-0.5">
                      <span className="text-[10px] text-[#7C769D] block font-bold">피신고자</span>
                      <span className="text-xs font-black text-[#2F2D59]">{item.author}</span>
                      <span className="text-[10px] text-[#7C769D] font-mono block">{item.authorEmail}</span>
                    </div>

                    {/* Stats */}
                    <div className="bg-rose-50 border border-rose-100 rounded-2xl px-3.5 py-1.5 text-center shrink-0">
                      <span className="text-[10px] text-[#7C769D] block font-bold leading-none mb-0.5">누적 신고</span>
                      <span className="text-rose-600 font-mono font-black text-xs leading-none">
                        {item.reportCount}건
                      </span>
                    </div>

                    {/* Status badge */}
                    <div className="shrink-0 min-w-[70px] text-center">
                      <span className={`inline-block w-full px-2.5 py-1 rounded-full text-[10px] font-bold border ${
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
