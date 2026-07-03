import React from "react";
import { MemoryRouter, Navigate, Routes, Route } from "react-router-dom";

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

export default function MemberCreationRoutes({ initialGenre }) {
  const initialEntry = initialGenre === "novel" ? NOVEL.STUDIO : FAIRY_TALE.SETUP;

  return (
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        {/* Fairy Tale Routes */}
        <Route path="/" element={<FairyTaleSetupPage />} />
        <Route path={FAIRY_TALE.SETUP} element={<FairyTaleSetupPage />} />
        <Route path={FAIRY_TALE.SETTING} element={<FairyTaleSettingWizardPage />} />
        <Route path={FAIRY_TALE.BUILDER} element={<FairyTaleChoiceBuilderPage />} />
        <Route path={FAIRY_TALE.FREE_SETTING} element={<FairyTaleFreeSettingPage />} />
        <Route path={FAIRY_TALE.CHAT} element={<FairyTaleChatWritingPage />} />
        <Route path={FAIRY_TALE.STUDIO} element={<FairyTaleCoCreationStudioPage />} />
        <Route path={FAIRY_TALE.CONFIRM} element={<FairyTaleConfirmPage />} />
        <Route path={FAIRY_TALE.IMAGES} element={<FairyTaleImageDesignPage />} />
        <Route path={FAIRY_TALE.EDITOR} element={<FairytaleEditorView bookType="INFO" />} />
        <Route path={FAIRY_TALE.COMPLETE} element={<FairyTaleCompletePage />} />

        {/* Fairy Tale Legacy Redirects */}
        <Route path="/fairy-tale/setup" element={redirectTo(FAIRY_TALE.SETUP)} />
        <Route path="/fairy-tale/setting" element={redirectTo(FAIRY_TALE.SETTING)} />
        <Route path="/fairy-tale/builder" element={redirectTo(FAIRY_TALE.BUILDER)} />
        <Route path="/fairy-tale/free-setting" element={redirectTo(FAIRY_TALE.FREE_SETTING)} />
        <Route path="/fairy-tale/chat" element={redirectTo(FAIRY_TALE.CHAT)} />
        <Route path="/fairy-tale/studio" element={redirectTo(FAIRY_TALE.STUDIO)} />
        <Route path="/fairy-tale/confirm" element={redirectTo(FAIRY_TALE.CONFIRM)} />
        <Route path="/fairy-tale/images" element={redirectTo(FAIRY_TALE.IMAGES)} />
        <Route path="/fairy-tale/editor" element={redirectTo(FAIRY_TALE.EDITOR)} />
        <Route path="/fairy-tale/editor2" element={redirectTo(FAIRY_TALE.EDITOR)} />
        <Route path="/fairy-tale/complete" element={redirectTo(FAIRY_TALE.COMPLETE)} />

        {/* Novel Routes */}
        <Route path={NOVEL.STUDIO} element={<NovelStudioPage />} />
        <Route path={NOVEL.CHAT} element={<NovelAuthorMeetingPage />} />
        <Route path={NOVEL.BUILDER} element={<NovelScenarioBuilderPage />} />
        <Route path={NOVEL.QUICK} element={<NovelScenarioSelectPage />} />
        <Route path={NOVEL.CONFIRM} element={<NovelSettingConfirmPage />} />
        <Route path={NOVEL.EDITOR} element={<NovelWritingEditorPage />} />
        <Route path={NOVEL.COVER} element={<NovelCoverSelectPage />} />
        <Route path={NOVEL.COMPLETE} element={<NovelCompletePage />} />

        {/* Novel Legacy Redirects */}
        <Route path="/bookmaker/novel/setup" element={redirectTo(NOVEL.STUDIO)} />
        <Route path="/bookmaker/novel/chat" element={redirectTo(NOVEL.CHAT)} />
        <Route path="/bookmaker/novel/builder" element={redirectTo(NOVEL.BUILDER)} />
        <Route path="/bookmaker/novel/quick" element={redirectTo(NOVEL.QUICK)} />
        <Route path="/bookmaker/novel/detail" element={redirectTo(NOVEL.CONFIRM)} />
        <Route path="/bookmaker/novel/confirm" element={redirectTo(NOVEL.CONFIRM)} />
        <Route path="/bookmaker/novel/editor" element={redirectTo(NOVEL.EDITOR)} />
        <Route path="/bookmaker/novel/cover" element={redirectTo(NOVEL.COVER)} />
        <Route path="/bookmaker/novel/complete" element={redirectTo(NOVEL.COMPLETE)} />
        <Route path="/novel/studio" element={redirectTo(NOVEL.STUDIO)} />
        <Route path="/novel/chat" element={redirectTo(NOVEL.CHAT)} />
        <Route path="/novel/builder" element={redirectTo(NOVEL.BUILDER)} />
        <Route path="/novel/quick" element={redirectTo(NOVEL.QUICK)} />
        <Route path="/novel/confirm" element={redirectTo(NOVEL.CONFIRM)} />
        <Route path="/novel/editor" element={redirectTo(NOVEL.EDITOR)} />
        <Route path="/novel/cover" element={redirectTo(NOVEL.COVER)} />
        <Route path="/novel/complete" element={redirectTo(NOVEL.COMPLETE)} />
      </Routes>
    </MemoryRouter>
  );
}
