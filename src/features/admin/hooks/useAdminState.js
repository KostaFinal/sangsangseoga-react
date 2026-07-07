import { useState, useEffect, useMemo } from 'react';
import { adminService } from '../services/adminService';

/**
 * Custom Hook: useAdminState
 * 
 * 어드민 전용 종합 상태 관리 커스텀 훅입니다.
 * UI 관심사와 비즈니스 로직(데이터 패칭, 필터링, 상태 업데이트 등)을 완전히 분리하여 설계하였습니다.
 * 타 부서 및 팀원이 쉽게 페이지를 연동하고 상태를 주입할 수 있도록 인터페이스가 추상화되어 있습니다.
 */
export const useAdminState = (initialTab = 'member') => {
  // 메인 탭 전환 상태: 'member' | 'reports' | 'tokens'
  const [activeTab, setActiveTab] = useState(initialTab);

  // ==========================================
  // [1] 작가 계정 관리 (Member Tab State)
  // ==========================================
  const [users, setUsers] = useState([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [memberStatusFilter, setMemberStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [suspensionReasonText, setSuspensionReasonText] = useState('운영 정책 위반 의심 (저작권 침해 또는 욕설 도배)');

  // ==========================================
  // [2] 통합 신고 심의 (Reports Tab State)
  // ==========================================
  const [reportSubTab, setReportSubTab] = useState('books'); // 'books' | 'comments' | 'authors'
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportRejectReason, setReportRejectReason] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportedBooks, setReportedBooks] = useState([]);
  const [reportedComments, setReportedComments] = useState([]);
  const [reportedAuthors, setReportedAuthors] = useState([]);

  // ==========================================
  // [3] AI 리소스 관리 (Tokens Tab State)
  // ==========================================
  const [tokenTrendUnit, setTokenTrendUnit] = useState('daily'); // 'daily' | 'monthly'
  const [tokenSortPeriod, setTokenSortPeriod] = useState('7d');
  const [tokenSearchQuery, setTokenSearchQuery] = useState('');
  const [selectedTokenUser, setSelectedTokenUser] = useState(null);
  const [currentTrends, setCurrentTrends] = useState([]);
  const [tokenUsages, setTokenUsages] = useState([]);
  const [activeTimeline, setActiveTimeline] = useState([]);

  // ------------------------------------------
  // API 데이터 로드 (Data Fetching Life Cycle)
  // ------------------------------------------
  const loadInitialData = async () => {
    try {
      // 1. 회원 전체 정보 조회
      const fetchedUsers = await adminService.getUsers();
      setUsers(fetchedUsers);

      // 2. 모든 카테고리별 신고 목록 조회
      const booksRep = await adminService.getReports('books');
      const commentsRep = await adminService.getReports('comments');
      const authorsRep = await adminService.getReports('authors');
      setReportedBooks(booksRep);
      setReportedComments(commentsRep);
      setReportedAuthors(authorsRep);

      // 3. AI 사용량 회원별 통계 조회
      const fetchedTokenUsages = await adminService.getTokenUsages();
      setTokenUsages(fetchedTokenUsages);
    } catch (err) {
      // TODO: 백엔드 에러 바인딩 및 얼럿 브릿지
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // 토큰 트렌드 그래프 정보 로드 (일간/월간 변경 감지 시 재호출)
  useEffect(() => {
    const fetchTrends = async () => {
      const data = await adminService.getTokenTrends(tokenTrendUnit);
      setCurrentTrends(data);
    };
    fetchTrends();
  }, [tokenTrendUnit]);

  // 특정 회원의 상세 AI 타임라인 정보 로드 (조사 대상 사용자 클릭 시 감지)
  useEffect(() => {
    const fetchTimeline = async () => {
      if (!selectedTokenUser) {
        setActiveTimeline([]);
        return;
      }
      const data = await adminService.getMemberTokenTimeline(selectedTokenUser);
      setActiveTimeline(data);
    };
    fetchTimeline();
  }, [selectedTokenUser]);

  // ------------------------------------------
  // 비즈니스 액션 처리 (Business Action Handlers)
  // ------------------------------------------

  /**
   * 작가 계정 자격 조정 (정상 복구, 정지, 탈퇴 상태 전이)
   */
  const handleUpdateUserStatus = async (userId, targetStatus) => {
    try {
      await adminService.updateUserStatus(userId, targetStatus, suspensionReasonText);
      
      // 상태 반영을 위해 로컬 컴포넌트 데이터 갱신
      const updatedUsers = await adminService.getUsers();
      setUsers(updatedUsers);

      if (selectedUser?.id === userId) {
        setSelectedUser(prev => prev ? { ...prev, status: targetStatus } : null);
      }
      
      setSuspensionReasonText('운영 정책 위반 의심 (저작권 침해 또는 욕설 도배)');
    } catch (err) {
      // TODO: 백엔드 상태 갱신 에러 처리
    }
  };

  /**
   * 신고 사안 이행 및 종결 심사
   */
  const handleResolveReport = async (reportId, actionType) => {
    try {
      const finalReason = reportRejectReason.trim() || '관리자 권한 직접 검토 통과';
      await adminService.resolveReport(reportSubTab, reportId, actionType, finalReason);
      
      // 관련 상태가 속한 리스트 갱신
      if (reportSubTab === 'books') {
        const refreshed = await adminService.getReports('books');
        setReportedBooks(refreshed);
      } else if (reportSubTab === 'comments') {
        const refreshed = await adminService.getReports('comments');
        setReportedComments(refreshed);
      } else if (reportSubTab === 'authors') {
        const refreshed = await adminService.getReports('authors');
        setReportedAuthors(refreshed);

        // 만약 작가 본인 정지 승인이면 해당 회원 자격도 동반 전이
        if (actionType === 'execute') {
          const targetRep = reportedAuthors.find(r => r.id === reportId);
          if (targetRep) {
            await adminService.updateUserStatus(targetRep.targetId, 'suspended', finalReason);
            const updatedUsers = await adminService.getUsers();
            setUsers(updatedUsers);
          }
        }
      }

      setReportRejectReason('');
      setReportModalOpen(false);
      setSelectedReport(null);
    } catch (err) {
      // TODO: 백엔드 신고처리 거부 핸들링
    }
  };

  // ------------------------------------------
  // 데이터 가공 및 필터링 (Memoized Filter Logics)
  // ------------------------------------------

  // 검색어 및 필터링 상태가 조합된 회원 목록
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesQuery = 
        user.nickname.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(memberSearchQuery.toLowerCase());
      
      if (memberStatusFilter === 'all') return matchesQuery;
      return matchesQuery && user.status === memberStatusFilter;
    });
  }, [users, memberSearchQuery, memberStatusFilter]);

  // 검색어 필터링이 적용된 AI 토큰 사용량 목록
  const searchedTokenUsages = useMemo(() => {
    return tokenUsages.filter(usage =>
      usage.nickname.toLowerCase().includes(tokenSearchQuery.toLowerCase())
    );
  }, [tokenUsages, tokenSearchQuery]);

  // 가상 타임라인 로그 매핑 (통합 컴포넌트 바인딩용 헬퍼 객체)
  const memberTokenTimelineLogs = useMemo(() => {
    if (!selectedTokenUser) return {};
    return {
      [selectedTokenUser]: activeTimeline
    };
  }, [selectedTokenUser, activeTimeline]);

  return {
    activeTab,
    setActiveTab,

    // 회원 관리 인터페이스
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

    // 신고 관리 인터페이스
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

    // AI 리소스 토큰 인터페이스
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
  };
};
