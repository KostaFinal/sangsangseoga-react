/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Routes, Route, Navigate, useNavigate, useParams, useLocation } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { AuthorProfileView, SearchAuthorView } from "./features/authors";
import { LoginView } from './features/auth/components/LoginView';
import { SignupView } from './features/auth/components/SignupView';
import { MainDashboard } from './features/dashboard/components/MainDashboard';
import { PaymentView } from './features/subscription/components/PaymentView';
import { SubscriptionView } from './features/subscription/components/SubscriptionView';
import { AdminView } from './features/admin/components/AdminView';
import { ProfileEditView } from './features/profile/components/ProfileEditView';
import { PasswordResetView } from './features/auth/components/PasswordResetView';
import { BookCreationRouter } from './features/bookCreation';
import { LEGACY_BOOK_CREATION_REDIRECTS } from './features/bookCreation/routes/MemberCreationRoutes';

import { SocialAuthGateway } from './features/auth/components/SocialAuthGateway';
import { GuardianConsentView } from './features/auth/components/GuardianConsentView';
import { AppShell } from './shared/components/AppShell';
import { AuthProvider, useAuth } from './shared/context/AuthContext';
import { ProtectedRoute, GuestOnlyRoute, AdminRoute } from './shared/routes/guards';
import { CommonShowcaseView } from './shared/components/CommonShowcaseView';
import { ErrorPage404 } from './shared/components/ErrorPage404';
import { ErrorPage500 } from './shared/components/ErrorPage500';
import FriendsLibraryView from './features/library/components/FriendsLibraryView';
import BookReaderPage from './features/library/components/BookReaderPage';
import {
  MyLibraryLayout,
  MyLibraryBookshelfRoute,
  MyLibraryWishlistRoute,
  MyLibraryReadingRoute,
  MyLibraryFinishedRoute,
  MyLibraryStatsRoute,
  MyLibraryCalendarRoute,
  MyLibraryAiChatRoute,
  MyLibraryAllBooksRoute,
  MyLibrarySavedAuthorsRoute,
  MyLibraryReportsRoute,
  MyLibraryReaderRoute,
} from './shared/components/MyLibraryLayout';

function ForbiddenPanel() {
  const { handleLogout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
      <div className="w-16 h-16 rounded-2xl bg-[#F3F0FF] border border-[#E6E2FC] flex items-center justify-center mb-6">
        <ShieldAlert className="w-7 h-7 text-[#6B54E7]" />
      </div>

      <div className="space-y-3 max-w-md mx-auto mb-8">
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#2F2D59]">관리자 권한이 필요합니다</h2>
        <p className="text-xs sm:text-sm text-[#7C769D] leading-relaxed">
          이 페이지는 관리자 계정으로 로그인해야 접근할 수 있습니다.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => navigate('/')}
          className="px-5 py-3 bg-[#FAF9FF] hover:bg-[#E6E2FC]/40 text-[#6B54E7] border border-[#E6E2FC] text-xs sm:text-sm font-bold rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>홈으로</span>
        </button>
        <button
          onClick={async () => { await handleLogout(); navigate('/login'); }}
          className="px-5 py-3 bg-[#6B54E7] hover:bg-[#5b45d6] text-white text-xs sm:text-sm font-bold rounded-2xl shadow-lg shadow-[#6B54E7]/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
        >
          관리자로 로그인
        </button>
      </div>
    </div>
  );
}

function LoginRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setCurrentUser, setIsAuthenticated, refreshSubscriptionStatus, refreshUsage } = useAuth();
  return (
    <LoginView
      onSuccess={(userInfo) => {
        setCurrentUser(userInfo);
        setIsAuthenticated(true);
        refreshSubscriptionStatus();
        refreshUsage();
        const from = location.state?.from;
        navigate(from ? `${from.pathname}${from.search || ''}` : '/', { replace: true });
      }}
      onNavigateToSignup={() => navigate('/signup')}
      onNavigateToPasswordReset={() => navigate('/password-reset')}
    />
  );
}

function SignupRoute() {
  const navigate = useNavigate();
  const { setIsAuthenticated, refreshSubscriptionStatus, refreshUsage } = useAuth();
  return (
    <SignupView
      onSuccess={({ pendingGuardianConsent } = {}) => {
        if (pendingGuardianConsent) {
          // 보호자 동의가 완료되기 전까지는 로그인 상태로 만들지 않고 로그인 화면으로 안내
          navigate('/login');
          return;
        }
        setIsAuthenticated(true);
        refreshSubscriptionStatus();
        refreshUsage();
        navigate('/');
      }}
      onNavigateToLogin={() => navigate('/login')}
    />
  );
}

function SocialAuthRoute() {
  const { provider } = useParams();
  // 이 라우트는 팝업 창 안에서만 렌더된다 — 결과를 opener(로그인 화면)에게 postMessage로
  // 전달하고 팝업을 닫는다. 실제 로그인 상태 반영은 opener 쪽(useLoginState)에서 처리.
  const postResultAndClose = (payload) => {
    if (window.opener) {
      window.opener.postMessage({ type: 'SOCIAL_AUTH_RESULT', payload }, window.location.origin);
    }
    window.close();
  };
  return (
    <SocialAuthGateway
      selectedProvider={provider}
      onNavigateToLogin={() => window.close()}
      onSuccess={(result) => postResultAndClose(result)}
    />
  );
}

function SubscriptionRoute() {
  const navigate = useNavigate();
  const { isAuthenticated, isPremium, isSubscriptionCanceled, benefitEndDate, currentPlanType, usage, refreshSubscriptionStatus, refreshUsage } = useAuth();
  return (
    <SubscriptionView
      isAuthenticated={isAuthenticated}
      onSelectPlan={(planType, price) => {
        navigate('/subscription/payment', { state: { subType: planType, price } });
      }}
      onNavigateHome={() => navigate('/')}
      onCancelSubscription={() => {
        refreshSubscriptionStatus();
        refreshUsage();
      }}
      onResumeSubscription={() => {
        refreshSubscriptionStatus();
        refreshUsage();
      }}
      onPlanChanged={() => {
        refreshSubscriptionStatus();
        refreshUsage();
      }}
      isPremium={isPremium}
      isSubscriptionCanceled={isSubscriptionCanceled}
      benefitEndDate={benefitEndDate}
      currentPlanType={currentPlanType}
      usage={usage}
    />
  );
}

function PaymentRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshSubscriptionStatus, refreshUsage } = useAuth();
  const paymentParams = location.state || { subType: 'monthly', price: 9900 };
  return (
    <PaymentView
      paymentParams={paymentParams}
      onPaymentSuccess={() => {
        refreshSubscriptionStatus();
        refreshUsage();
        navigate('/subscription');
      }}
      onNavigateBack={() => navigate('/subscription')}
    />
  );
}

function ProfileEditRoute() {
  const navigate = useNavigate();
  const { currentUser, isPremium, setCurrentUser, handleLogout: logoutFromServer } = useAuth();
  return (
    <ProfileEditView
      currentUser={{ ...currentUser, isSubscribed: isPremium }}
      onNavigateHome={() => navigate('/')}
      onUpdateProfile={(updates) => setCurrentUser(prev => ({ ...prev, ...updates }))}
      onLogout={async () => { await logoutFromServer(); navigate('/login'); }}
    />
  );
}

function PasswordResetRoute() {
  const navigate = useNavigate();
  return <PasswordResetView onNavigateToLogin={() => navigate('/login')} />;
}

function ErrorPage404Route() {
  const navigate = useNavigate();
  return <ErrorPage404 onNavigateToHome={() => navigate('/')} />;
}

function ErrorPage500Route() {
  const navigate = useNavigate();
  return <ErrorPage500 onReload={() => navigate('/__dev/showcase')} />;
}

function CommonShowcaseRoute() {
  const navigate = useNavigate();
  return <CommonShowcaseView onNavigate={(screen) => navigate(`/${screen.replace('error', '')}`)} />;
}

function AppInner() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route element={<GuestOnlyRoute />}>
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/signup" element={<SignupRoute />} />
          <Route path="/password-reset" element={<PasswordResetRoute />} />
          <Route path="/login/social/:provider" element={<SocialAuthRoute />} />
        </Route>

        {/* 이메일 링크로 접근 — 로그인 여부와 무관하게 토큰 자체가 자격증명 */}
        <Route path="/guardian-consent/:consentId" element={<GuardianConsentView />} />

        {/* 둘러보기는 비로그인도 가능 — 로그인이 필요한 액션은 클릭 시점에 /login으로 유도 */}
        <Route index element={<MainDashboard />} />
        <Route path="friends" element={<FriendsLibraryView />} />
        <Route path="friends/:bookId" element={<FriendsLibraryView />} />
        <Route path="authors" element={<SearchAuthorView />} />
        <Route path="authors/:authorName" element={<AuthorProfileView />} />
        <Route path="subscription" element={<SubscriptionRoute />} />

        {/* 각 장르의 첫 설정 화면은 비로그인도 볼 수 있음 — 다음 단계로 넘어가는(실제 생성 시작)
            시점에 각 장르의 setup 훅에서 requireAuth로 로그인 유도 */}
        <Route path="create/poem" element={<BookCreationRouter key="poem" initialGenre="poem" />} />
        <Route path="create/essay" element={<BookCreationRouter key="essay" initialGenre="essay" />} />
        <Route path="create/nonfiction" element={<BookCreationRouter key="nonfiction" initialGenre="nonfiction" />} />
        <Route path="create/fairy-tale/*" element={<BookCreationRouter key="fairy-tale" initialGenre="fairy-tale" />} />
        <Route path="create/novel/*" element={<BookCreationRouter key="novel" initialGenre="novel" />} />
        {LEGACY_BOOK_CREATION_REDIRECTS.map(({ path, to }) => (
          <Route key={path} path={path} element={<Navigate to={to} replace />} />
        ))}

        <Route element={<ProtectedRoute />}>
          <Route path="books/:bookId/read" element={<BookReaderPage />} />

          <Route path="library" element={<MyLibraryLayout />}>
            <Route index element={<MyLibraryBookshelfRoute />} />
            <Route path="all-books" element={<MyLibraryAllBooksRoute />} />
            <Route path="reading" element={<MyLibraryReadingRoute />} />
            <Route path="finished" element={<MyLibraryFinishedRoute />} />
            <Route path="wishlist" element={<MyLibraryWishlistRoute />} />
            <Route path="saved-authors" element={<MyLibrarySavedAuthorsRoute />} />
            <Route path="reports" element={<MyLibraryReportsRoute />} />
            <Route path="stats" element={<MyLibraryStatsRoute />} />
            <Route path="calendar" element={<MyLibraryCalendarRoute />} />
            <Route path="ai-chat" element={<MyLibraryAiChatRoute />} />
            <Route path="read/:bookId" element={<MyLibraryReaderRoute />} />
          </Route>

          <Route path="subscription/payment" element={<PaymentRoute />} />
          <Route path="profile/edit" element={<ProfileEditRoute />} />

          <Route element={<AdminRoute forbidden={<ForbiddenPanel />} />}>
            <Route path="admin" element={<AdminView key="member" initialTab="member" />} />
            <Route path="admin/members" element={<AdminView key="member" initialTab="member" />} />
            <Route path="admin/reports" element={<AdminView key="reports" initialTab="reports" />} />
            <Route path="admin/tokens" element={<AdminView key="tokens" initialTab="tokens" />} />
            <Route path="admin/action-logs" element={<AdminView key="actionLogs" initialTab="actionLogs" />} />
          </Route>
        </Route>

        <Route path="404" element={<ErrorPage404Route />} />
        <Route path="500" element={<ErrorPage500Route />} />
        {import.meta.env.DEV && <Route path="__dev/showcase" element={<CommonShowcaseRoute />} />}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
