import React from "react";
import { Navigate, Routes, Route } from "react-router-dom";

// Import CSS
import "../styles/member5-base.css";
import "../fairy-tale/pages/FairyTalePagesMerged.css";
import "../novel/pages/NovelPagesMerged.css";
import "../styles/member5-layout-fix.css";

// Import Fairy-Tale Pages
import {
  FairyTaleSetupPage,
  FairyTaleSettingWizardPage,
  FairyTaleChoiceBuilderPage,
  FairyTaleFreeSettingPage,
  FairyTaleChatWritingPage,
  FairyTaleCoCreationStudioPage,
  FairyTaleConfirmPage,
  FairyTaleImageDesignPage,
  FairyTaleCompletePage
} from "../fairy-tale";

// Import Novel Pages
import {
  NovelStudioPage,
  NovelAuthorMeetingPage,
  NovelScenarioBuilderPage,
  NovelSettingConfirmPage,
  NovelWritingEditorPage,
  NovelCoverSelectPage,
  NovelCompletePage,
  NovelScenarioSelectPage
} from "../novel";

// Import Book Editor Page directly
import { FairytaleEditorView } from "../book-editor";
import { BOOK_CREATION_ROUTES } from "./bookCreationRoutePaths";

const { FAIRY_TALE, NOVEL } = BOOK_CREATION_ROUTES;

const redirectTo = (to) => <Navigate to={to} replace />;

/**
 * App.jsx의 최상단 <Routes>가 이미 "create/fairy-tale/*" 또는 "create/novel/*"로
 * 와일드카드 매칭을 마친 상태에서 렌더되는 하위 <Routes>이기 때문에, 여기서는
 * BOOK_CREATION_ROUTES의 절대경로가 아니라 마지막 세그먼트만(상대경로) 써야 매칭된다.
 * (절대경로를 그대로 쓰면 이 중첩 위치에서는 매칭되지 않는 것을 확인함.)
 * fairy-tale/novel 세그먼트가 서로 겹치므로(둘 다 "studio" 등) initialGenre로 분기해서
 * 항상 한쪽 장르의 라우트만 선언한다.
 */
export default function MemberCreationRoutes({ initialGenre }) {
  if (initialGenre === "novel") {
    return (
      <Routes>
        <Route index element={<Navigate to="studio" replace />} />
        <Route path="studio" element={<NovelStudioPage />} />
        <Route path="chat" element={<NovelAuthorMeetingPage />} />
        <Route path="builder" element={<NovelScenarioBuilderPage />} />
        <Route path="quick" element={<NovelScenarioSelectPage />} />
        <Route path="confirm" element={<NovelSettingConfirmPage />} />
        <Route path="editor" element={<NovelWritingEditorPage />} />
        <Route path="cover" element={<NovelCoverSelectPage />} />
        <Route path="complete" element={<NovelCompletePage />} />
        <Route path="*" element={<Navigate to={NOVEL.STUDIO} replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route index element={<Navigate to="setup" replace />} />
      <Route path="setup" element={<FairyTaleSetupPage />} />
      <Route path="setting" element={<FairyTaleSettingWizardPage />} />
      <Route path="builder" element={<FairyTaleChoiceBuilderPage />} />
      <Route path="free-setting" element={<FairyTaleFreeSettingPage />} />
      <Route path="chat" element={<FairyTaleChatWritingPage />} />
      <Route path="studio" element={<FairyTaleCoCreationStudioPage />} />
      <Route path="confirm" element={<FairyTaleConfirmPage />} />
      <Route path="images" element={<FairyTaleImageDesignPage />} />
      <Route path="editor" element={<FairytaleEditorView bookType="INFO" />} />
      <Route path="complete" element={<FairyTaleCompletePage />} />
      <Route path="*" element={<Navigate to={FAIRY_TALE.SETUP} replace />} />
    </Routes>
  );
}

// 과거 경로 체계(레거시 링크) 리다이렉트 — 절대경로라서 최상단 App.jsx의 라우트 트리에
// 직접 등록해야 함(중첩된 <Routes>에서는 절대경로가 매칭되지 않음). App.jsx에서 이 배열을 가져다 씀.
export const LEGACY_BOOK_CREATION_REDIRECTS = [
  { path: "/fairy-tale/setup", to: FAIRY_TALE.SETUP },
  { path: "/fairy-tale/setting", to: FAIRY_TALE.SETTING },
  { path: "/fairy-tale/builder", to: FAIRY_TALE.BUILDER },
  { path: "/fairy-tale/free-setting", to: FAIRY_TALE.FREE_SETTING },
  { path: "/fairy-tale/chat", to: FAIRY_TALE.CHAT },
  { path: "/fairy-tale/studio", to: FAIRY_TALE.STUDIO },
  { path: "/fairy-tale/confirm", to: FAIRY_TALE.CONFIRM },
  { path: "/fairy-tale/images", to: FAIRY_TALE.IMAGES },
  { path: "/fairy-tale/editor", to: FAIRY_TALE.EDITOR },
  { path: "/fairy-tale/editor2", to: FAIRY_TALE.EDITOR },
  { path: "/fairy-tale/complete", to: FAIRY_TALE.COMPLETE },
  { path: "/bookmaker/novel/setup", to: NOVEL.STUDIO },
  { path: "/bookmaker/novel/chat", to: NOVEL.CHAT },
  { path: "/bookmaker/novel/builder", to: NOVEL.BUILDER },
  { path: "/bookmaker/novel/quick", to: NOVEL.QUICK },
  { path: "/bookmaker/novel/detail", to: NOVEL.CONFIRM },
  { path: "/bookmaker/novel/confirm", to: NOVEL.CONFIRM },
  { path: "/bookmaker/novel/editor", to: NOVEL.EDITOR },
  { path: "/bookmaker/novel/cover", to: NOVEL.COVER },
  { path: "/bookmaker/novel/complete", to: NOVEL.COMPLETE },
  { path: "/novel/studio", to: NOVEL.STUDIO },
  { path: "/novel/chat", to: NOVEL.CHAT },
  { path: "/novel/builder", to: NOVEL.BUILDER },
  { path: "/novel/quick", to: NOVEL.QUICK },
  { path: "/novel/confirm", to: NOVEL.CONFIRM },
  { path: "/novel/editor", to: NOVEL.EDITOR },
  { path: "/novel/cover", to: NOVEL.COVER },
  { path: "/novel/complete", to: NOVEL.COMPLETE },
];
