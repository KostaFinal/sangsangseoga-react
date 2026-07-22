import { useEffect, useRef, useState } from 'react';

// 시/에세이처럼 실제 라우트 이동 없이 "step1/step2/step3"를 내부 state로만 전환하는
// 만들기 화면들이 공용으로 쓰는 이탈 가드.
// - 브라우저 새로고침/탭 닫기 → beforeunload 경고
// - 브라우저 "뒤로가기" 버튼 → 실제로 view가 바뀌기 전에 확인 모달을 띄우고, 취소하면 그대로 남아있게 함
//   (기존엔 popstate를 그냥 받아서 확인 없이 바로 view를 바꿔버리는 버그가 있었음)
// - 화면 안의 "이전" 버튼(requestViewChange) → 같은 확인 모달
//
// shouldGuard(from, to): from에서 to로 이동할 때 확인이 필요하면 true.
export default function useCreationExitGuard({
  currentView,
  setCurrentView,
  isGuardedView,
  shouldGuard,
  onConfirmLeave,
}) {
  const [showExitModal, setShowExitModal] = useState(false);
  const [pendingView, setPendingView] = useState(null);
  const historyReadyRef = useRef(false);
  const isPopNavigationRef = useRef(false);
  const currentViewRef = useRef(currentView);

  useEffect(() => {
    currentViewRef.current = currentView;
  }, [currentView]);

  useEffect(() => {
    window.history.replaceState({ view: currentViewRef.current }, '', window.location.href);
    historyReadyRef.current = true;

    const handlePopState = (event) => {
      const from = currentViewRef.current;
      const to = event.state?.view || from;
      if (to === from) return;

      if (shouldGuard(from, to)) {
        // 확인하기 전엔 실제로 이동하지 않도록, 브라우저가 이미 물러난 히스토리 위치를 다시 앞으로 되돌려 놓는다.
        window.history.pushState({ view: from }, '', window.location.href);
        setPendingView(to);
        setShowExitModal(true);
        return;
      }

      isPopNavigationRef.current = true;
      setShowExitModal(false);
      setPendingView(null);
      setCurrentView(to);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (!historyReadyRef.current) return;
    if (isPopNavigationRef.current) {
      isPopNavigationRef.current = false;
      return;
    }

    window.history.pushState({ view: currentView }, '', window.location.href);
  }, [currentView]);

  useEffect(() => {
    if (!isGuardedView(currentView)) return undefined;

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentView, isGuardedView]);

  const requestViewChange = (nextView) => {
    if (nextView === currentView) return;

    if (shouldGuard(currentView, nextView)) {
      setPendingView(nextView);
      setShowExitModal(true);
      return;
    }

    setCurrentView(nextView);
  };

  const confirmLeave = () => {
    const target = pendingView;
    setShowExitModal(false);
    setPendingView(null);
    if (!target) return;
    onConfirmLeave?.(target);
    setCurrentView(target);
  };

  const cancelLeave = () => {
    setShowExitModal(false);
    setPendingView(null);
  };

  return { showExitModal, pendingView, requestViewChange, confirmLeave, cancelLeave };
}
