import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Flag,
  BarChart3,
  History,
  ChevronRight,
} from 'lucide-react';
import { useAdminState } from '../hooks/useAdminState';
import { MemberTab } from './MemberTab';
import { ReportsTab } from './ReportsTab';
import { ReportDetailModal } from './ReportDetailModal';
import { TokensTab } from './TokensTab';
import { ActionLogsTab } from './ActionLogsTab';
import { Toast } from '../../../shared/components/Toast';

const TAB_TO_PATH = { member: 'members', reports: 'reports', tokens: 'tokens', actionLogs: 'action-logs' };

export const AdminView = ({ initialTab = 'member' }) => {
  const navigate = useNavigate();
  const {
    activeTab,
    setActiveTab,

    // 공용 에러/성공 피드백
    toast,
    clearToast,

    // Member states
    users,
    memberSearchQuery,
    setMemberSearchQuery,
    memberStatusFilter,
    setMemberStatusFilter,
    memberPage,
    memberTotalCount,
    memberHasNext,
    memberPageSize,
    memberStatusCounts,
    goToMemberPage,
    selectedUser,
    setSelectedUser,
    userModalOpen,
    setUserModalOpen,
    suspensionReasonText,
    setSuspensionReasonText,
    handleUpdateUserStatus,

    // Reports states
    reportSubTab,
    setReportSubTab,
    reportStatusFilter,
    setReportStatusFilter,
    reportModalOpen,
    setReportModalOpen,
    reportRejectReason,
    setReportRejectReason,
    selectedReport,
    setSelectedReport,
    reportedBooks,
    reportedComments,
    reportedAuthors,
    reportPage,
    reportTotalCount,
    reportHasNext,
    reportPageSize,
    goToReportPage,
    handleResolveReport,

    // Action logs states
    actionLogs,
    actionLogPage,
    actionLogTotalCount,
    actionLogHasNext,
    actionLogPageSize,
    actionLogActionTypeFilter,
    setActionLogActionTypeFilter,
    goToActionLogPage,

    // Tokens states
    tokenTrendUnit,
    setTokenTrendUnit,
    tokenSortPeriod,
    setTokenSortPeriod,
    tokenSearchQuery,
    setTokenSearchQuery,
    selectedTokenUser,
    setSelectedTokenUser,
    currentTrends,
    searchedTokenUsages,
    memberTokenTimelineLogs,
    tokenSummary,
  } = useAdminState(initialTab);

  // 탭 클릭 시 주소창도 함께 갱신 (딥링크는 initialTab으로 진입 시 이미 반영됨)
  useEffect(() => {
    navigate(`/admin/${TAB_TO_PATH[activeTab] || 'members'}`, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  return (
    <div id="admin-main-view" className="min-h-screen bg-[#FAF9FF] flex flex-col font-sans text-[#2F2D59] selection:bg-[#6B54E7] selection:text-white pb-20">

      {/* 2. Unified Layout Grid */}
      <div className="w-full px-6 pt-6 pb-8 sm:px-10 lg:px-16">
        <h2 className="text-2xl font-black text-[#110F24] tracking-tight mb-5">관리자 페이지</h2>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side Unified Navigation Bar (3 Cols) */}
          <aside className="lg:col-span-3 space-y-6 w-full">
            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-[#E6E2FC]/60 text-left">
              <div className="mb-5 border-b border-[#E6E2FC]/40 pb-4">
                <span className="text-[11px] font-mono tracking-widest text-[#7C769D] uppercase font-black block">Administrator</span>
                <h1 className="text-xl font-black text-[#110F24] tracking-tight mt-1">관리 메뉴</h1>
              </div>

              <nav className="space-y-2">
                {[
                  { id: 'member', name: '작가 계정 관리', icon: Users, desc: '계정 상태 변경' },
                  { id: 'reports', name: '신고 관리', icon: Flag, desc: '신고 심사' },
                  { id: 'tokens', name: 'AI 사용량 관리', icon: BarChart3, desc: 'AI 사용량 분석' },
                  { id: 'actionLogs', name: '처리 이력', icon: History, desc: '관리자 조치 로그' }
                ].map((tab) => {
                  const IconComp = tab.icon;
                  const isSelected = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setSelectedUser(null);
                        setSelectedReport(null);
                      }}
                      className={`w-full text-left px-4 py-3.5 rounded-2xl transition-all flex items-center justify-between cursor-pointer group ${
                        isSelected
                          ? 'bg-[#6B54E7] text-white shadow-lg shadow-[#6B54E7]/25 hover:opacity-95'
                          : 'text-[#7C769D] hover:bg-[#E6E2FC]/15 hover:text-[#2F2D59]'
                      }`}
                    >
                      <div className="flex items-center space-x-3 text-left">
                        <div className={`p-1.5 rounded-xl transition-all ${isSelected ? 'bg-white/15 text-white' : 'bg-[#FAF9FF] text-[#6B54E7] group-hover:bg-[#E6E2FC]/30'}`}>
                          <IconComp className="w-4 h-4 shrink-0" />
                        </div>
                        <div>
                          <span className="text-sm font-black block">{tab.name}</span>
                          <span className={`text-xs block ${isSelected ? 'text-[#B9B0DC]' : 'text-[#7C769D]'}`}>{tab.desc}</span>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'translate-x-1 text-white' : 'text-[#B9B0DC] group-hover:translate-x-0.5'}`} />
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Right Content Sheet (9 Cols) */}
          <main className="lg:col-span-9 space-y-6 w-full">
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-[#E6E2FC]/60 text-left">
              <div className="border-b border-[#E6E2FC]/40 pb-3.5 mb-4 text-left">
                <h2 className="text-xl font-black text-[#110F24] tracking-tight">
                  {activeTab === 'member' && '작가 계정 관리'}
                  {activeTab === 'reports' && '신고 관리'}
                  {activeTab === 'tokens' && 'AI 사용량 관리'}
                  {activeTab === 'actionLogs' && '처리 이력'}
                </h2>
                <p className="text-sm text-[#7C769D] mt-1 leading-relaxed">
                  {activeTab === 'member' && '작가 계정 상태와 가입 승인을 관리합니다.'}
                  {activeTab === 'reports' && '접수된 도서, 댓글, 작가 신고를 심사합니다.'}
                  {activeTab === 'tokens' && 'AI 텍스트/이미지 생성 사용량을 확인합니다.'}
                  {activeTab === 'actionLogs' && '관리자가 처리한 신고 조치 이력을 최신순으로 확인합니다.'}
                </p>
              </div>

              {/* Sub tab routes */}
              {activeTab === 'member' && (
                <MemberTab
                  memberSearchQuery={memberSearchQuery}
                  setMemberSearchQuery={setMemberSearchQuery}
                  memberStatusFilter={memberStatusFilter}
                  setMemberStatusFilter={setMemberStatusFilter}
                  memberPage={memberPage}
                  memberTotalCount={memberTotalCount}
                  memberHasNext={memberHasNext}
                  memberPageSize={memberPageSize}
                  memberStatusCounts={memberStatusCounts}
                  goToMemberPage={goToMemberPage}
                  selectedUser={selectedUser}
                  setSelectedUser={setSelectedUser}
                  userModalOpen={userModalOpen}
                  setUserModalOpen={setUserModalOpen}
                  suspensionReasonText={suspensionReasonText}
                  setSuspensionReasonText={setSuspensionReasonText}
                  users={users}
                  handleUpdateUserStatus={handleUpdateUserStatus}
                />
              )}

              {activeTab === 'reports' && (
                <ReportsTab
                  reportSubTab={reportSubTab}
                  setReportSubTab={setReportSubTab}
                  reportStatusFilter={reportStatusFilter}
                  setReportStatusFilter={setReportStatusFilter}
                  selectedReport={selectedReport}
                  setSelectedReport={setSelectedReport}
                  setReportModalOpen={setReportModalOpen}
                  reportedBooks={reportedBooks}
                  reportedComments={reportedComments}
                  reportedAuthors={reportedAuthors}
                  reportPage={reportPage}
                  reportTotalCount={reportTotalCount}
                  reportHasNext={reportHasNext}
                  reportPageSize={reportPageSize}
                  goToReportPage={goToReportPage}
                />
              )}

              {activeTab === 'tokens' && (
                <TokensTab
                  tokenTrendUnit={tokenTrendUnit}
                  setTokenTrendUnit={setTokenTrendUnit}
                  tokenSortPeriod={tokenSortPeriod}
                  setTokenSortPeriod={setTokenSortPeriod}
                  tokenSearchQuery={tokenSearchQuery}
                  setTokenSearchQuery={setTokenSearchQuery}
                  selectedTokenUser={selectedTokenUser}
                  setSelectedTokenUser={setSelectedTokenUser}
                  currentTrends={currentTrends}
                  searchedTokenUsages={searchedTokenUsages}
                  memberTokenTimelineLogs={memberTokenTimelineLogs}
                  tokenSummary={tokenSummary}
                />
              )}

              {activeTab === 'actionLogs' && (
                <ActionLogsTab
                  actionLogs={actionLogs}
                  actionLogPage={actionLogPage}
                  actionLogTotalCount={actionLogTotalCount}
                  actionLogHasNext={actionLogHasNext}
                  actionLogPageSize={actionLogPageSize}
                  actionLogActionTypeFilter={actionLogActionTypeFilter}
                  setActionLogActionTypeFilter={setActionLogActionTypeFilter}
                  goToActionLogPage={goToActionLogPage}
                />
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Reports Details Review Popup Modal */}
      <ReportDetailModal
        reportSubTab={reportSubTab}
        reportModalOpen={reportModalOpen}
        setReportModalOpen={setReportModalOpen}
        selectedReport={selectedReport}
        setSelectedReport={setSelectedReport}
        reportRejectReason={reportRejectReason}
        setReportRejectReason={setReportRejectReason}
        handleResolveReport={handleResolveReport}
      />

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={clearToast} />
      )}
    </div>
  );
};
