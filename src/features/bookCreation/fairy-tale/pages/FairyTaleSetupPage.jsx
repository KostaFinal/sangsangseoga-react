import fairyBg from "../../assets/fairy-bg.png";

import FairyHeader from "../components/setup/FairyHeader";
import FairyHero from "../components/setup/FairyHero";
import InteractionModeSection from "../components/setup/InteractionModeSection";
import SetupSummaryBox from "../components/setup/SetupSummaryBox";
import StepIndicator from "../components/setup/StepIndicator";
import WriterLevelSection from "../components/setup/WriterLevelSection";
import { useFairyTaleSetup } from "../hooks/useFairyTaleSetup";

export default function FairyTaleSetupPage() {
  const {
    writerLevels,
    interactionModes,
    writerLevel,
    setWriterLevel,
    interactionMode,
    setInteractionMode,
    isReady,
    handleStart,
    getWriterLevelLabel,
    getInteractionModeLabel,
  } = useFairyTaleSetup();

  return (
    <div
      className="fairy-page-container"
      style={{ "--fairy-bg": `url(${fairyBg})` }}
    >
      <div className="fairy-bg-overlay"></div>

      <FairyHeader />

      <main className="fairy-main">
        <FairyHero />

        <section className="setup-panel">
          <div className="setup-card">
            <StepIndicator
              writerLevel={writerLevel}
              interactionMode={interactionMode}
              isReady={isReady}
            />

            <WriterLevelSection
              writerLevels={writerLevels}
              writerLevel={writerLevel}
              onSelectWriterLevel={setWriterLevel}
            />

            <InteractionModeSection
              interactionModes={interactionModes}
              interactionMode={interactionMode}
              onSelectInteractionMode={setInteractionMode}
            />

            <SetupSummaryBox
              isReady={isReady}
              writerLevel={writerLevel}
              interactionMode={interactionMode}
              getWriterLevelLabel={getWriterLevelLabel}
              getInteractionModeLabel={getInteractionModeLabel}
              onStart={handleStart}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
