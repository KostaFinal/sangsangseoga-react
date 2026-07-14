import React from 'react';
import { Search, ShieldAlert, ChevronLeft, ChevronRight } from 'lucide-react';
import { ADMIN_AVATAR } from '../../../shared/data';

export const MemberTab = ({
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
  users,
  handleUpdateUserStatus
}) => {
  const totalPages = Math.max(1, Math.ceil(memberTotalCount / memberPageSize));
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Search and status filter (counts shown inline on each filter pill) */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-white px-5 py-4.5 border border-[#E6E2FC]/60 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
          {[
            { key: 'all', label: '전체', count: memberStatusCounts.all },
            { key: 'active', label: '활동 중', count: memberStatusCounts.active },
            { key: 'pending', label: '승인 대기', count: memberStatusCounts.pending },
            { key: 'suspended', label: '정지', count: memberStatusCounts.suspended },
            { key: 'deleted', label: '탈퇴', count: memberStatusCounts.deleted }
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setMemberStatusFilter(filter.key)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-bold shrink-0 transition-all cursor-pointer ${
                memberStatusFilter === filter.key
                  ? 'bg-[#6B54E7] text-white shadow-sm'
                  : 'bg-[#FAF9FF] text-[#7C769D] hover:bg-[#E6E2FC]/40 hover:text-[#2F2D59]'
              }`}
            >
              <span>{filter.label}</span>
              <span className={`font-mono font-black ${memberStatusFilter === filter.key ? 'text-white/90' : 'text-[#6B54E7]'}`}>
                {filter.count.toLocaleString()}
              </span>
            </button>
          ))}
        </div>

        <div className="flex-grow max-w-md relative text-left">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7C769D] w-4 h-4" />
          <input
            type="text"
            value={memberSearchQuery}
            onChange={(e) => setMemberSearchQuery(e.target.value)}
            placeholder="작가명 또는 이메일 검색..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#FAF9FF] rounded-xl text-sm border border-[#E6E2FC] focus:bg-white focus:border-[#6B54E7] focus:outline-none transition-all placeholder:text-[#B9B0DC] text-[#2F2D59]"
          />
        </div>
      </div>

      {/* Table of Members */}
      <div className="flex items-center justify-between px-1">
        <span className="text-sm font-bold text-[#7C769D]">총 {memberTotalCount}명</span>
      </div>
      <div className="bg-white rounded-2xl border border-[#E6E2FC]/60 shadow-xs overflow-hidden text-left">
        <div className="overflow-x-auto hide-scrollbar">
          <table className="w-full text-sm">
            <thead className="bg-[#FAF9FF] text-[#7C769D] border-b border-[#E6E2FC]/50 text-xs font-extrabold uppercase tracking-widest">
              <tr>
                <th className="py-4 px-6 text-left">작가명 / 이메일</th>
                <th className="py-4 px-4 text-center">요금제</th>
                <th className="py-4 px-4 text-center font-mono">가입일</th>
                <th className="py-4 px-6 text-center">상태</th>
                <th className="py-4 px-6 text-center">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E2FC]/30">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-[#7C769D] font-bold">일치하는 작가가 없습니다.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-[#FAF9FF]/60 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <img
                          src={ADMIN_AVATAR}
                          alt="User Avatar"
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-full border border-[#E6E2FC] object-cover"
                        />
                        <div>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setUserModalOpen(true);
                            }}
                            className="font-bold text-[#2F2D59] hover:underline hover:text-[#6B54E7] block text-left"
                          >
                            {user.nickname}
                          </button>
                          <span className="text-xs text-[#7C769D] font-mono block mt-0.5">{user.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center font-bold">
                      <span className={`text-sm font-bold ${user.plan === 'PREMIUM' ? 'text-[#6B54E7] font-extrabold' : 'text-[#7C769D]'}`}>
                        {user.planLabel}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center text-[#7C769D] font-mono">
                      {user.joinDate}
                    </td>

                    <td className="py-4 px-6 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        user.status === 'active' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                        user.status === 'pending' ? 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse' :
                        user.status === 'suspended' ? 'bg-rose-50 text-rose-800 border-rose-200 font-bold' :
                        'bg-[#FAF9FF] text-[#7C769D] border-[#E6E2FC]'
                      }`}>
                        {user.status === 'active' ? '활동 중' :
                         user.status === 'pending' ? '승인 대기' :
                         user.status === 'suspended' ? '정지' : '탈퇴'}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        {user.status === 'active' ? (
                          <button
                            onClick={() => handleUpdateUserStatus(user.id, 'suspended')}
                            className="p-1 px-3 bg-[#110F24] text-white font-bold hover:bg-black text-xs rounded-lg transition-all cursor-pointer"
                          >
                            정지
                          </button>
                        ) : user.status === 'pending' ? (
                          <span className="text-xs font-bold text-[#7C769D]">보호자 동의 대기 중</span>
                        ) : (
                          <button
                            onClick={() => handleUpdateUserStatus(user.id, 'active')}
                            className="p-1 px-3 bg-[#6B54E7] text-white font-bold hover:bg-[#5b45d6] text-xs rounded-lg transition-all cursor-pointer"
                          >
                            정상 복원
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {memberTotalCount > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#E6E2FC]/50">
            <span className="text-sm text-[#7C769D] font-semibold">
              {memberPage + 1} / {totalPages} 페이지
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => goToMemberPage(memberPage - 1)}
                disabled={memberPage === 0}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E6E2FC] text-[#7C769D] hover:border-[#6B54E7] hover:text-[#6B54E7] disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => goToMemberPage(memberPage + 1)}
                disabled={!memberHasNext}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E6E2FC] text-[#7C769D] hover:border-[#6B54E7] hover:text-[#6B54E7] disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Modal */}
      {userModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#110F24]/60 backdrop-blur-xs">
          <div className="bg-white border border-[#E6E2FC] max-w-lg w-full text-left p-6 space-y-6 relative rounded-2xl shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#E6E2FC]/50 pb-4">
              <div>
                <span className="text-xs font-mono tracking-widest text-[#7C769D] uppercase font-black block">ADMIN PANEL</span>
                <h3 className="text-lg font-black text-[#110F24] mt-0.5">작가 상세 정보</h3>
              </div>
              <button
                onClick={() => setUserModalOpen(false)}
                className="text-sm text-[#7C769D] hover:text-[#110F24] font-black uppercase bg-[#FAF9FF] hover:bg-[#E6E2FC]/30 border border-[#E6E2FC]/50 px-3 py-1.5 rounded-lg cursor-pointer"
              >
                닫기
              </button>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-[#FAF9FF] border border-[#E6E2FC]/40 rounded-xl">
              <img
                src={ADMIN_AVATAR}
                alt="Big User Profile"
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-full border border-[#E6E2FC] object-cover"
              />
              <div className="space-y-1 text-left">
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-[#110F24] text-base">{selectedUser.nickname}</h4>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    selectedUser.status === 'active' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                    selectedUser.status === 'pending' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                    'bg-rose-50 text-rose-800 border-rose-200'
                  }`}>
                    {selectedUser.status === 'active' ? '정상 활동' :
                     selectedUser.status === 'pending' ? '승인 대기' :
                     selectedUser.status === 'suspended' ? '정지' : '탈퇴'}
                  </span>
                </div>
                <p className="text-sm text-[#7C769D] font-mono">{selectedUser.email}</p>
              </div>
            </div>

            {/* Comprehensive Meta-Data Metrics Grid */}
            <div className="grid grid-cols-2 gap-3.5 bg-[#FAF9FF] p-4 border border-[#E6E2FC]/40 rounded-xl text-sm">
              <div>
                <span className="text-[#7C769D] block font-bold text-xs">가입일</span>
                <p className="font-semibold text-[#2F2D59] mt-0.5 font-mono">{selectedUser.joinDate}</p>
              </div>
              <div>
                <span className="text-[#7C769D] block font-bold text-xs">요금제</span>
                <p className="font-black text-[#6B54E7] mt-0.5">{selectedUser.planLabel}</p>
              </div>
              {selectedUser.status === 'deleted' && selectedUser.withdrawnAt && (
                <div className="border-t pt-2 border-[#E6E2FC]/30 col-span-2">
                  <span className="text-[#7C769D] block font-bold text-xs">탈퇴일</span>
                  <p className="font-mono text-[#2F2D59] mt-0.5">{selectedUser.withdrawnAt}</p>
                </div>
              )}
            </div>

            {/* Strict Membership suspension clause display (No refund guarantee) */}
            <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl text-xs leading-relaxed text-rose-800 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-700 shrink-0" />
              <span>정지해도 구독은 자동 해지되지 않습니다. 유료 회원은 별도 확인이 필요합니다.</span>
            </div>

            {selectedUser.status === 'pending' ? (
              <div className="p-3.5 bg-[#FAF9FF] border border-[#E6E2FC] rounded-xl text-xs leading-relaxed text-[#7C769D]">
                만 14세 미만 회원의 보호자 이메일 동의 대기 상태입니다. 보호자가 이메일로 받은 링크에서 직접 승인/거절하며, 관리자가 대신 승인할 수 없습니다.
              </div>
            ) : (
              <div className="space-y-2 pt-1 text-left">
                <label className="block text-xs font-black text-[#7C769D] uppercase tracking-wider">변경 사유</label>
                <input
                  type="text"
                  value={suspensionReasonText}
                  onChange={(e) => setSuspensionReasonText(e.target.value)}
                  placeholder="상태를 변경하는 상세 사유를 입력해 주세요."
                  className="w-full px-4 py-2.5 bg-[#FAF9FF] text-sm text-[#2F2D59] border border-[#E6E2FC] focus:border-[#6B54E7] focus:bg-white focus:outline-none rounded-xl"
                />
              </div>
            )}

            {selectedUser.status !== 'pending' && (
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#E6E2FC]/40 font-sans">
              {selectedUser.status === 'active' ? (
                <>
                  <button
                    onClick={() => {
                      handleUpdateUserStatus(selectedUser.id, 'suspended');
                      setUserModalOpen(false);
                    }}
                    className="py-3 bg-[#110F24] hover:bg-black text-white text-sm font-black text-center rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    정지 처리
                  </button>
                  <button
                    onClick={() => {
                      handleUpdateUserStatus(selectedUser.id, 'deleted');
                      setUserModalOpen(false);
                    }}
                    className="py-3 bg-rose-600 hover:bg-rose-750 text-white text-sm font-black text-center rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    탈퇴 처리
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    handleUpdateUserStatus(selectedUser.id, 'active');
                    setUserModalOpen(false);
                  }}
                  className="col-span-2 py-3 bg-[#6B54E7] hover:bg-[#5b45d6] text-white text-sm font-black text-center rounded-xl transition-all cursor-pointer shadow-md shadow-[#6B54E7]/15 active:scale-95"
                >
                  정상 복원
                </button>
              )}
            </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
