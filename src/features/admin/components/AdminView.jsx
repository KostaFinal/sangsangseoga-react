import React from 'react';
import { 
  Users, 
  Flag, 
  BarChart3, 
  ChevronRight, 
  Activity,
  ArrowLeft,
  LogOut,
  ShieldCheck,
  LayoutDashboard
} from 'lucide-react';
import { useAdminState } from '../hooks/useAdminState';
import { MemberTab } from './MemberTab';
import { ReportsTab } from './ReportsTab';
import { ReportDetailModal } from './ReportDetailModal';
import { TokensTab } from './TokensTab';

export const AdminView = ({ onNavigateHome }) => {
  const {
    activeTab,
    setActiveTab,
    
    // Member states
    users,
    memberSearchQuery,
    setMemberSearchQuery,
    memberStatusFilter,
    setMemberStatusFilter,
    selectedUser,
    setSelectedUser,
    userModalOpen,
    setUserModalOpen,
    suspensionReasonText,
    setSuspensionReasonText,
    filteredUsers,
    handleUpdateUserStatus,

    // Reports states
    reportSubTab,
    setReportSubTab,
    reportModalOpen,
    setReportModalOpen,
    reportRejectReason,
    setReportRejectReason,
    selectedReport,
    setSelectedReport,
    reportedBooks,
    reportedComments,
    reportedAuthors,
    handleResolveReport,

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
  } = useAdminState();

  return (
    <div id="admin-main-view" className="min-h-screen bg-[#FAF9FF] flex flex-col font-sans text-[#2F2D59] selection:bg-[#6B54E7] selection:text-white pb-20 relative overflow-x-hidden">
      
      {/* Upper Unified Admin Status Banner */}
      <div className="bg-white/80 backdrop-blur-md border-b border-[#E6E2FC]/50 py-3.5 px-4 sm:px-6 sticky top-0 z-40">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            <span className="text-xs font-black text-[#110F24] tracking-wider uppercase">상상서가 어드민 센터</span>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 text-xs font-black text-[#7C769D] hover:text-[#6B54E7] transition-all bg-[#FAF9FF] hover:bg-[#E6E2FC]/30 border border-[#E6E2FC] px-3.5 py-1.5 rounded-xl cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>로그아웃</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Background Ambient Glows */}
      <div className="absolute top-10 left-1/4 w-[600px] h-[600px] bg-[#E6E2FC]/30 rounded-full filter blur-[130px] pointer-events-none"></div>
      <div className="absolute top-40 right-1/4 w-[500px] h-[500px] bg-[#EDF5FF]/40 rounded-full filter blur-[110px] pointer-events-none"></div>

      {/* 1. Header Hero Panel (Slate Dark theme) */}
      <div className="relative w-full bg-[#110F24] text-white overflow-hidden rounded-b-[2.5rem] shadow-xl border-b border-[#2F2D59]/30 z-10 px-4 py-8 sm:py-12 sm:px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(107,84,231,0.2),transparent)] pointer-events-none"></div>
        
        <div className="w-full space-y-6 sm:space-y-8 relative z-10">
          
          {/* Back button and Tag */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white/90 text-xs font-bold transition-all border border-white/5 active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>메인 화면으로</span>
            </button>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-[#6B54E7]/30 text-[#B9B0DC] rounded-full text-xs font-semibold border border-[#6B54E7]/40">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>최고 관리자 콘솔</span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="text-left space-y-2 max-w-2xl">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                <LayoutDashboard className="w-8 h-8 text-[#835AF1] shrink-0" />
                <span>종합 관리자 콘솔</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#B9B0DC] leading-relaxed">
                작가 계정의 자격을 제어하고, 접수된 신고를 심사하며, AI 생성 리소스 소모 추세를 실시간으로 모니터링합니다.
              </p>
            </div>

            {/* Quick security status card with glowing effect */}
            <div className="relative w-full lg:w-auto flex items-center gap-6 bg-white/[0.04] backdrop-blur-md px-6 py-5 rounded-2xl border border-white/10 shrink-0 text-left">
              <div className="absolute -top-3 -right-3 w-12 h-12 bg-[#6B54E7]/30 rounded-full filter blur-md"></div>
              
              <div className="space-y-1">
                <span className="text-[10px] text-[#B9B0DC] block tracking-wider font-bold uppercase">시스템 상태</span>
                <span className="text-sm sm:text-base font-black flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>안정</span>
                </span>
              </div>
              
              <div className="h-10 w-[1px] bg-white/10"></div>
              
              <div className="space-y-1">
                <span className="text-[10px] text-[#B9B0DC] block tracking-wider font-bold uppercase">대기 중인 신고</span>
                <span className="text-sm sm:text-base font-extrabold text-white block font-mono">
                  {reportedBooks.filter(r => r.status === 'pending').length +
                   reportedComments.filter(r => r.status === 'pending').length +
                   reportedAuthors.filter(r => r.status === 'pending').length} 건
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 2. Unified Layout Grid */}
      <div className="w-full px-4 py-8 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side Unified Navigation Bar (3 Cols) */}
          <aside className="lg:col-span-3 space-y-6 w-full">
            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-[#E6E2FC]/60 text-left">
              <div className="mb-5 border-b border-[#E6E2FC]/40 pb-4">
                <span className="text-[9px] font-mono tracking-widest text-[#7C769D] uppercase font-black block">Administrator</span>
                <h1 className="text-lg font-black text-[#110F24] tracking-tight mt-1">중앙 통제실</h1>
              </div>

              <nav className="space-y-2">
                {[
                  { id: 'member', name: '작가 계정 관리', icon: Users, desc: '계정 상태 복구 및 일시 정지' },
                  { id: 'reports', name: '신고 사안 심의', icon: Flag, desc: '도서/댓글/작가 정밀 심사' },
                  { id: 'tokens', name: 'AI 리소스 관리', icon: BarChart3, desc: '글자/이미지 생성 추이 분석' }
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
                          <span className="text-xs font-black block">{tab.name}</span>
                          <span className={`text-[9px] block ${isSelected ? 'text-[#B9B0DC]' : 'text-[#7C769D]'}`}>{tab.desc}</span>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'translate-x-1 text-white' : 'text-[#B9B0DC] group-hover:translate-x-0.5'}`} />
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Quick Stats Panel */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-[#E6E2FC]/60 text-left space-y-4">
              <h3 className="text-[10px] font-black text-[#7C769D] uppercase tracking-widest flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#6B54E7] animate-pulse" />
                <span>소속 창작실 통계</span>
              </h3>
              
              <div className="space-y-3 pt-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#7C769D] font-bold">전체 작가 계정</span>
                  <span className="font-black text-[#110F24] font-mono">1,248 명</span>
                </div>
                
                <div className="flex justify-between items-center text-xs">
                  <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 정상 작가
                  </span>
                  <span className="font-black text-emerald-600 font-mono">1,210 명</span>
                </div>
                
                <div className="flex justify-between items-center text-xs">
                  <span className="text-amber-500 font-extrabold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> 승인 대기
                  </span>
                  <span className="font-black text-amber-500 font-mono">19 명</span>
                </div>
                
                <div className="flex justify-between items-center text-xs">
                  <span className="text-rose-500 font-extrabold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span> 활동 제한
                  </span>
                  <span className="font-black text-rose-500 font-mono">11 명</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Content Sheet (9 Cols) */}
          <main className="lg:col-span-9 space-y-6 w-full">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-[#E6E2FC]/60 text-left">
              <div className="border-b border-[#E6E2FC]/40 pb-5 mb-6 text-left">
                <h2 className="text-xl font-black text-[#110F24] tracking-tight">
                  {activeTab === 'member' && '작가 계정 관리'}
                  {activeTab === 'reports' && '신고 사안 심의'}
                  {activeTab === 'tokens' && 'AI 리소스 관리'}
                </h2>
                <p className="text-xs text-[#7C769D] mt-1 leading-relaxed">
                  {activeTab === 'member' && '작가 계정의 자격, 상태, 가입 승인 등을 관리합니다.'}
                  {activeTab === 'reports' && '접수된 도서, 댓글, 작가 등의 유해성 및 신고 사안을 심사합니다.'}
                  {activeTab === 'tokens' && '사용자들의 AI 텍스트 및 이미지 생성 사용량을 실시간 파악합니다.'}
                </p>
              </div>

              {/* Sub tab routes */}
              {activeTab === 'member' && (
                <MemberTab
                  memberSearchQuery={memberSearchQuery}
                  setMemberSearchQuery={setMemberSearchQuery}
                  memberStatusFilter={memberStatusFilter}
                  setMemberStatusFilter={setMemberStatusFilter}
                  selectedUser={selectedUser}
                  setSelectedUser={setSelectedUser}
                  userModalOpen={userModalOpen}
                  setUserModalOpen={setUserModalOpen}
                  suspensionReasonText={suspensionReasonText}
                  setSuspensionReasonText={setSuspensionReasonText}
                  filteredUsers={filteredUsers}
                  handleUpdateUserStatus={handleUpdateUserStatus}
                />
              )}

              {activeTab === 'reports' && (
                <ReportsTab
                  reportSubTab={reportSubTab}
                  setReportSubTab={setReportSubTab}
                  selectedReport={selectedReport}
                  setSelectedReport={setSelectedReport}
                  setReportModalOpen={setReportModalOpen}
                  reportedBooks={reportedBooks}
                  reportedComments={reportedComments}
                  reportedAuthors={reportedAuthors}
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
                  users={users}
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
    </div>
  );
};
