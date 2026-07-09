/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Routes, Route, Navigate, useNavigate, useParams, useLocation } from 'react-router-dom';
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
  MyLibraryReaderRoute,
} from './shared/components/MyLibraryLayout';

function ForbiddenPanel() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="max-w-md mx-auto my-20 p-8 bg-white border border-neutral-200 rounded-2xl text-left shadow-2xl font-mono text-xs">
      <div className="flex items-center text-neutral-900 font-extrabold gap-2 text-sm mb-4 uppercase">
        <span className="w-2.5 h-2.5 rounded-full bg-black animate-pulse"></span>
        🚨 [403 Forbidden] Access Denied
      </div>
      <p className="text-neutral-900 font-black leading-relaxed mb-3">
        Spring Security 권한 부족 오류 (ACCESS_DENIED)
      </p>
      <div className="bg-neutral-950 text-neutral-300 p-4 leading-loose mb-5 rounded-xl font-sans text-[11px]">
        <p><span className="text-neutral-500">필요 권한 (Required):</span> <code className="text-white font-mono font-bold">ROLE_ADMIN</code></p>
        <p><span className="text-neutral-500">현재 계정 (Authenticated):</span> <span className="text-neutral-200">{currentUser.nickname} ({currentUser.email})</span></p>
        <p><span className="text-neutral-500">부여된 권한 (Granted Authority):</span> <span className="text-red-400 font-mono font-bold">{currentUser.role || 'NONE'}</span></p>
      </div>
      <p className="text-neutral-500 mb-6 font-sans text-[11.5px] leading-relaxed">
        해당 API 및 관리자 통제 패널은 최고 관리자 권한을 승인받은 세션만 인가용 토큰을 통해 접속할 수 있습니다. 메인 화면으로 귀가하시거나 어드민 전용 포털을 통해 로그인해 주십시오.
      </p>
      <div className="flex gap-2 font-sans">
        <button
          onClick={() => navigate('/')}
          className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl font-bold text-xs transition-all cursor-pointer"
        >
          메인 대시보드 대피
        </button>
        <button
          onClick={() => navigate('/login')}
          className="flex-1 py-3 bg-black hover:bg-neutral-900 text-white rounded-xl font-bold text-xs transition-all cursor-pointer"
        >
          기존 세션 로그아웃 후 어드민 로그인
        </button>
      </div>
    </div>
  );
}

function LoginRoute() {
  const navigate = useNavigate();
  const { setCurrentUser, setIsAuthenticated, refreshSubscriptionStatus, refreshUsage } = useAuth();
  return (
    <LoginView
      onSuccess={(userInfo) => {
        setCurrentUser(userInfo);
        setIsAuthenticated(true);
        refreshSubscriptionStatus();
        refreshUsage();
        navigate('/');
      }}
      onNavigateToSignup={() => navigate('/signup')}
      onNavigateToPasswordReset={() => navigate('/password-reset')}
      onNavigateToSocial={(provider) => navigate(`/login/social/${provider}`)}
    />
  );
}

function SignupRoute() {
  const navigate = useNavigate();
  const { setIsAuthenticated, refreshSubscriptionStatus, refreshUsage } = useAuth();
  return (
    <SignupView
      onSuccess={() => {
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
  const navigate = useNavigate();
  const { provider } = useParams();
  const { setCurrentUser, setIsAuthenticated, refreshSubscriptionStatus, refreshUsage } = useAuth();
  return (
    <SocialAuthGateway
      selectedProvider={provider}
      onNavigateToLogin={() => navigate('/login')}
      onSuccess={() => {
        setCurrentUser({
          email: 'social.writer@sangsang.com',
          role: 'USER',
          nickname: '소셜 작가'
        });
        setIsAuthenticated(true);
        refreshSubscriptionStatus();
        refreshUsage();
        navigate('/');
      }}
    />
  );
}

function SubscriptionRoute() {
  const navigate = useNavigate();
  const { isPremium, isSubscriptionCanceled, benefitEndDate, currentPlanType, usage, refreshSubscriptionStatus, refreshUsage } = useAuth();
  return (
    <SubscriptionView
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

        <Route element={<ProtectedRoute />}>
          <Route index element={<MainDashboard />} />
          <Route path="friends" element={<FriendsLibraryView />} />
          <Route path="friends/:bookId" element={<FriendsLibraryView />} />
          <Route path="authors" element={<SearchAuthorView />} />
          <Route path="authors/:authorName" element={<AuthorProfileView />} />
          <Route path="books/:bookId/read" element={<BookReaderPage />} />

          <Route path="library" element={<MyLibraryLayout />}>
            <Route index element={<MyLibraryBookshelfRoute />} />
            <Route path="all-books" element={<MyLibraryAllBooksRoute />} />
            <Route path="reading" element={<MyLibraryReadingRoute />} />
            <Route path="finished" element={<MyLibraryFinishedRoute />} />
            <Route path="wishlist" element={<MyLibraryWishlistRoute />} />
            <Route path="saved-authors" element={<MyLibrarySavedAuthorsRoute />} />
            <Route path="stats" element={<MyLibraryStatsRoute />} />
            <Route path="calendar" element={<MyLibraryCalendarRoute />} />
            <Route path="ai-chat" element={<MyLibraryAiChatRoute />} />
            <Route path="read/:bookId" element={<MyLibraryReaderRoute />} />
          </Route>

          <Route path="subscription" element={<SubscriptionRoute />} />
          <Route path="subscription/payment" element={<PaymentRoute />} />
          <Route path="profile/edit" element={<ProfileEditRoute />} />

          <Route path="create/poem" element={<BookCreationRouter key="poem" initialGenre="poem" />} />
          <Route path="create/essay" element={<BookCreationRouter key="essay" initialGenre="essay" />} />
          <Route path="create/nonfiction" element={<BookCreationRouter key="nonfiction" initialGenre="nonfiction" />} />
          <Route path="create/fairy-tale/*" element={<BookCreationRouter key="fairy-tale" initialGenre="fairy-tale" />} />
          <Route path="create/novel/*" element={<BookCreationRouter key="novel" initialGenre="novel" />} />
          {LEGACY_BOOK_CREATION_REDIRECTS.map(({ path, to }) => (
            <Route key={path} path={path} element={<Navigate to={to} replace />} />
          ))}

          <Route element={<AdminRoute forbidden={<ForbiddenPanel />} />}>
            <Route path="admin" element={<AdminView initialTab="member" />} />
            <Route path="admin/members" element={<AdminView initialTab="member" />} />
            <Route path="admin/reports" element={<AdminView initialTab="reports" />} />
            <Route path="admin/tokens" element={<AdminView initialTab="tokens" />} />
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
