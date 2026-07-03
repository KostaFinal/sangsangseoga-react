import React, { useState } from 'react';
import { ConfirmModal } from './ConfirmModal';
import { Toast } from './Toast';
import { SkeletonLoading } from './SkeletonLoading';
import { NetworkError } from './NetworkError';
import { ErrorPage404 } from './ErrorPage404';
import { ErrorPage500 } from './ErrorPage500';
import {
  Layers,
  AlertTriangle,
  CheckCircle,
  Info,
  FileQuestion,
  ServerCrash,
  Play
} from 'lucide-react';

export const CommonShowcaseView = ({ onNavigate }) => {
  // Confirm Modal States
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState('primary');
  const [confirmTitle, setConfirmTitle] = useState('저장 확인');
  const [confirmMessage, setConfirmMessage] = useState('변경한 설정을 저장하시겠습니까?');

  // Toast States
  const [activeToast, setActiveToast] = useState(null); // { message, type }

  // Skeleton States
  const [skeletonType, setSkeletonType] = useState('card');
  const [skeletonCount, setSkeletonCount] = useState(4);

  // Network Error state mock
  const [networkLogs, setNetworkLogs] = useState([]);

  const showToast = (message, type) => {
    setActiveToast({ message, type, id: Date.now() });
  };

  const handleConfirmAction = () => {
    showToast(`"${confirmTitle}" 처리가 정상적으로 완료되었습니다.`, 'success');
  };

  const handleNetworkRetry = () => {
    showToast('네트워크 상태를 확인하고 서버와 재연결되었습니다.', 'success');
    setNetworkLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] 재연결 성공`]);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-10 font-sans text-left min-h-screen">
      {/* Header section */}
      <div className="border-b border-[#E6E2FC] pb-6 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F3F0FF] rounded-full text-xs font-bold text-[#6B54E7]">
          <Layers className="w-3.5 h-3.5" />
          <span>공통 컴포넌트 쇼케이스</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#2F2D59]">
          공통 컴포넌트 체험관
        </h1>
        <p className="text-xs sm:text-sm text-[#7C769D]">
          애플리케이션 전반에서 사용되는 확인 모달, 토스트 알림, 스켈레톤 로딩, 에러 안내 페이지를 직접 확인하고 테스트할 수 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column - Modals and Toast controls */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 1. Confirm Modal Demo */}
          <div className="bg-white rounded-3xl p-6 border border-[#E6E2FC]/60 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6B54E7]"></span>
              <h2 className="text-base font-extrabold text-[#2F2D59]">1. 확인 모달 (Confirm Modal)</h2>
            </div>
            <p className="text-xs text-[#7C769D]">
              사용자의 중요한 행동을 진행하기 전 한 번 더 동의를 구하는 확인창입니다.
            </p>

            <div className="flex flex-wrap gap-2.5 pt-1">
              <button
                onClick={() => {
                  setConfirmType('primary');
                  setConfirmTitle('저장 확인');
                  setConfirmMessage('지금까지 작성한 소설 내용을 안전하게 저장하시겠습니까?');
                  setIsConfirmOpen(true);
                }}
                className="px-4 py-2.5 bg-[#F3F0FF] hover:bg-[#E6E2FC] text-[#6B54E7] text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Info className="w-3.5 h-3.5" />
                <span>저장 확인 모달</span>
              </button>

              <button
                onClick={() => {
                  setConfirmType('success');
                  setConfirmTitle('출판 진행');
                  setConfirmMessage('작성하신 소설 원고를 오프라인 실물 책으로 출판 신청하시겠습니까?');
                  setIsConfirmOpen(true);
                }}
                className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>출판 신청 모달</span>
              </button>

              <button
                onClick={() => {
                  setConfirmType('danger');
                  setConfirmTitle('회원 탈퇴');
                  setConfirmMessage('정말로 상상서가 회원 탈퇴를 진행하시겠습니까? 작성 중인 소설과 보유한 생성권이 모두 삭제됩니다.');
                  setIsConfirmOpen(true);
                }}
                className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-500 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>회원 탈퇴 모달</span>
              </button>
            </div>
          </div>

          {/* 2. Toast Notice Demo */}
          <div className="bg-white rounded-3xl p-6 border border-[#E6E2FC]/60 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6B54E7]"></span>
              <h2 className="text-base font-extrabold text-[#2F2D59]">2. 알림 메시지 (Toast Notice)</h2>
            </div>
            <p className="text-xs text-[#7C769D]">
              화면 상단 중앙에 임시로 표시되었다가 자동으로 소멸하는 피드백 안내 메시지입니다.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <button
                onClick={() => showToast('안전하게 저장되었습니다.', 'success')}
                className="py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl cursor-pointer text-center"
              >
                성공 알림
              </button>
              <button
                onClick={() => showToast('입력값이 너무 짧거나 올바르지 않습니다.', 'error')}
                className="py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl cursor-pointer text-center"
              >
                오류 알림
              </button>
              <button
                onClick={() => showToast('생성권이 1회 차감됩니다.', 'warning')}
                className="py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold rounded-xl cursor-pointer text-center"
              >
                경고 알림
              </button>
              <button
                onClick={() => showToast('새로운 소설 추천이 도착했습니다.', 'info')}
                className="py-2.5 bg-[#FAF9FF] hover:bg-[#F3F0FF] text-[#6B54E7] text-xs font-bold rounded-xl cursor-pointer text-center"
              >
                정보 알림
              </button>
            </div>
          </div>

          {/* 3. Skeleton Loader Demo */}
          <div className="bg-white rounded-3xl p-6 border border-[#E6E2FC]/60 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6B54E7]"></span>
                <h2 className="text-base font-extrabold text-[#2F2D59]">3. 스켈레톤 로딩 (Skeleton)</h2>
              </div>
              <div className="flex gap-1 bg-[#F3F0FF] p-0.5 rounded-lg text-[10px] font-bold">
                {['card', 'list', 'text'].map(t => (
                  <button
                    key={t}
                    onClick={() => { setSkeletonType(t); setSkeletonCount(t === 'card' ? 4 : 2); }}
                    className={`px-2.5 py-1 rounded-md capitalize cursor-pointer ${skeletonType === t ? 'bg-[#6B54E7] text-white' : 'text-[#7C769D]'}`}
                  >
                    {t === 'card' ? '카드형' : t === 'list' ? '리스트형' : '텍스트형'}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs text-[#7C769D]">
              데이터를 불러오는 대기 시간 동안 보여주는 임시 화면 영역 레이아웃입니다.
            </p>

            <div className="pt-2">
              <SkeletonLoading type={skeletonType} count={skeletonCount} />
            </div>
          </div>

          {/* 4. Network Error Handler Demo */}
          <div className="bg-white rounded-3xl p-6 border border-[#E6E2FC]/60 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
              <h2 className="text-base font-extrabold text-[#2F2D59]">4. 네트워크 에러 안내</h2>
            </div>
            <p className="text-xs text-[#7C769D]">
              무선 인터넷 또는 와이파이 연결이 일시 지연되었을 때 노출되는 안내 컴포넌트입니다.
            </p>

            <div className="p-1 rounded-3xl bg-neutral-50/50">
              <NetworkError 
                message="데이터를 불러오던 중 네트워크 연결 상태를 확인하지 못했습니다." 
                onRetry={handleNetworkRetry} 
              />
            </div>
            
            {networkLogs.length > 0 && (
              <div className="text-[10px] font-mono text-neutral-400 bg-neutral-900 text-neutral-100 p-2.5 rounded-xl space-y-1 leading-normal text-left">
                <span className="text-emerald-400 font-bold">▶ 재시도 이력:</span>
                {networkLogs.map((log, i) => <div key={i}>{log}</div>)}
              </div>
            )}
          </div>

        </div>

        {/* Right column - Full Screen Pages */}
        <div className="space-y-8">

          {/* 6. Static Error Pages Navigation */}
          <div className="bg-white rounded-3xl p-6 border border-[#E6E2FC]/60 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span>
              <h2 className="text-base font-extrabold text-[#2F2D59]">5. 전체 화면 에러 페이지</h2>
            </div>
            <p className="text-xs text-[#7C769D]">
              주소 오류나 시스템 에러 시 사용자에게 노출되는 안내 화면입니다.
            </p>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => onNavigate('error404')}
                className="w-full py-3 bg-neutral-50 hover:bg-neutral-100 text-neutral-800 text-xs font-bold rounded-xl flex items-center justify-between px-4 cursor-pointer transition-all border border-neutral-150"
              >
                <div className="flex items-center gap-2">
                  <FileQuestion className="w-4 h-4 text-[#6B54E7]" />
                  <span>404 에러 화면 (페이지 없음)</span>
                </div>
                <Play className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              <button
                onClick={() => onNavigate('error500')}
                className="w-full py-3 bg-red-50/30 hover:bg-red-50 text-neutral-850 text-xs font-bold rounded-xl flex items-center justify-between px-4 cursor-pointer transition-all border border-red-100"
              >
                <div className="flex items-center gap-2">
                  <ServerCrash className="w-4 h-4 text-red-500" />
                  <span>500 에러 화면 (서버 실패)</span>
                </div>
                <Play className="w-3.5 h-3.5 text-neutral-400" />
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Global Confirm Modal implementation */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmAction}
        title={confirmTitle}
        message={confirmMessage}
        type={confirmType}
        confirmText="확인"
        cancelText="취소"
      />

      {/* Global Toast implementation */}
      {activeToast && (
        <Toast
          key={activeToast.id}
          message={activeToast.message}
          type={activeToast.type}
          onClose={() => setActiveToast(null)}
        />
      )}
    </div>
  );
};
