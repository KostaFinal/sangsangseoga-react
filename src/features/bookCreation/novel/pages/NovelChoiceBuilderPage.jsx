import scenarioBg from "../../assets/scenario-bg.png";
import { useNovelChoiceBuilder } from "../hooks/useNovelChoiceBuilder";

function NovelChoiceBuilderPage() {
  const {
    steps,
    selections,
    setSelections,
    currentIndex,
    currentStep,
    handleNext,
  } = useNovelChoiceBuilder();
  return (
    <div className="novel-choice-page">
      <img className="novel-choice-bg" src={scenarioBg} alt="" aria-hidden="true" />
      <div className="novel-choice-overlay" />

      <main className="novel-choice-shell">
        <p className="eyebrow">CHOICE MODE</p>
        <h1>선택만으로 소설 설정 만들기</h1>
        <p>직접 수정 없이 버튼 선택만으로 설정을 완성합니다.</p>

        <section className="novel-choice-panel">
          <h2>{currentIndex + 1}단계. {currentStep.label} 선택</h2>
          <div className="novel-choice-options">
            {currentStep.options.map((option) => (
              <button
                type="button"
                key={option}
                className={selections[currentStep.key] === option ? "selected" : ""}
                onClick={() => setSelections((prev) => ({ ...prev, [currentStep.key]: option }))}
              >
                {option}
              </button>
            ))}
          </div>
        </section>

        <aside className="novel-choice-summary">
          {steps.map((step) => (
            <div key={step.key}>
              <span>{step.label}</span>
              <strong>{selections[step.key]}</strong>
            </div>
          ))}
        </aside>

        <button type="button" className="novel-choice-next" onClick={handleNext}>
          {currentIndex < steps.length - 1 ? "다음 선택 →" : "설정 확정하기 →"}
        </button>
      </main>
    </div>
  );
}

export default NovelChoiceBuilderPage;



