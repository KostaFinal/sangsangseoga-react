import React from "react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

// Import CSS
import "../styles/member5-base.css";
import "../fairy-tale/pages/FairyTalePagesMerged.css";
import "../novel/pages/NovelPagesMerged.css";

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
  FairyTaleBookEditorPage,
  FairyTaleCompletePage
} from "../fairy-tale";

// Import Novel Pages
import {
  NovelStudioPage,
  NovelAuthorMeetingPage,
  NovelScenarioBuilderPage,
  NovelScenarioDetailPage,
  NovelSettingConfirmPage,
  NovelWritingEditorPage,
  NovelCoverSelectPage,
  NovelCompletePage,
  NovelScenarioSelectPage
} from "../novel";

// Import Book Editor Page directly
import { FairytaleEditorView } from "../book-editor";

export default function MemberCreationRoutes({ initialGenre }) {
  const initialEntry = initialGenre === "novel" ? "/bookmaker/novel/setup" : "/fairy-tale/setup";

  return (
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        {/* Fairy Tale Routes */}
        <Route path="/" element={<FairyTaleSetupPage />} />
        <Route path="/fairy-tale/setup" element={<FairyTaleSetupPage />} />
        <Route path="/fairy-tale/setting" element={<FairyTaleSettingWizardPage />} />
        <Route path="/fairy-tale/builder" element={<FairyTaleChoiceBuilderPage />} />
        <Route path="/fairy-tale/free-setting" element={<FairyTaleFreeSettingPage />} />
        <Route path="/fairy-tale/chat" element={<FairyTaleChatWritingPage />} />
        <Route path="/fairy-tale/studio" element={<FairyTaleCoCreationStudioPage />} />
        <Route path="/fairy-tale/confirm" element={<FairyTaleConfirmPage />} />
        <Route path="/fairy-tale/images" element={<FairyTaleImageDesignPage />} />
        <Route path="/fairy-tale/editor2" element={<FairyTaleBookEditorPage />} />
        <Route path="/fairy-tale/complete" element={<FairyTaleCompletePage />} />

        <Route path="/fairy-tale/editor" element={<FairytaleEditorView bookType="INFO" />} />

        {/* Novel Routes */}
        <Route path="/bookmaker/novel/setup" element={<NovelStudioPage />} />
        <Route path="/bookmaker/novel/chat" element={<NovelAuthorMeetingPage />} />
        <Route path="/bookmaker/novel/builder" element={<NovelScenarioBuilderPage />} />
        <Route path="/bookmaker/novel/detail" element={<NovelScenarioDetailPage />} />
        <Route path="/bookmaker/novel/confirm" element={<NovelSettingConfirmPage />} />
        <Route path="/bookmaker/novel/editor" element={<NovelWritingEditorPage />} />
        <Route path="/bookmaker/novel/cover" element={<NovelCoverSelectPage />} />
        <Route path="/bookmaker/novel/complete" element={<NovelCompletePage />} />
        <Route path="/bookmaker/novel/quick" element={<NovelScenarioSelectPage />} />
      </Routes>
    </MemoryRouter>
  );
}
