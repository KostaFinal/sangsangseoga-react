import novelstudiobg from "../../assets/novelstudiobg.png";
import { useNovelStudio } from "../hooks/useNovelStudio";

export default function NovelStudioPage() {
  const {
    writerLevels,
    workModes,
    writerLevel,
    setWriterLevel,
    workMode,
    setWorkMode,
    canStart,
    activeScene,
    handleStart,
  } = useNovelStudio();

  return (
    <div
      className="novel-studio-page"
      style={{ "--novel-studio-bg": `url(${novelstudiobg})` }}
    >
      <main className="novel-main">
        <section className="novel-hero">
          <div className="stage-light" />

          <div className="hero-copy">
            <h1>소설 스튜디오</h1>
            <p>당신의 이야기가 한 편의 소설이 됩니다.</p>
          </div>
        </section>

        <section className="novel-setup">
          <div className="scene-tabs">
            <div className={`scene-tab ${activeScene === 1 ? "active" : ""}`}>
              <small>SCENE 01</small>
              <strong>작가 수준</strong>
            </div>

            <div
              className={`scene-tab ${activeScene === 2 ? "active" : ""} ${
                writerLevel ? "ready" : ""
              }`}
            >
              <small>SCENE 02</small>
              <strong>작업 방식</strong>
            </div>

            <div
              className={`scene-tab ${activeScene === 3 ? "active" : ""} ${
                canStart ? "ready" : ""
              }`}
            >
              <small>SCENE 03</small>
              <strong>시작</strong>
            </div>
          </div>

          <div className="setup-panel">
            <div className="section-title">
              <div>
                <h2>1단계. 작가 수준 선택</h2>
                <p>현재 작가에게 맞는 수준을 선택해 보세요.</p>
              </div>
            </div>

            <div className="writer-level-grid">
              {writerLevels.map((level) => (
                <button
                  type="button"
                  key={level.id}
                  className={`writer-level-card ${
                    writerLevel === level.id ? "selected" : ""
                  }`}
                  onClick={() => setWriterLevel(level.id)}
                >
                  <div className="writer-card-visual">
                    <span>{level.icon}</span>
                  </div>

                  <div className="writer-card-body">
                    <h3>{level.title}</h3>
                    <p>{level.desc}</p>

                    <ul>
                      {level.points.map((point) => (
                        <li key={point}>ㆍ{point}</li>
                      ))}
                    </ul>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="setup-panel mode-panel">
            <div className="section-title">
              <div>
                <h2>2단계. 작업 방식 선택</h2>
                <p>소설을 만드는 방식을 선택해 보세요.</p>
              </div>
            </div>

            <div className="work-mode-grid">
              {workModes.map((mode) => (
                <button
                  type="button"
                  key={mode.id}
                  className={`work-mode-card ${
                    workMode === mode.id ? "selected" : ""
                  }`}
                  onClick={() => setWorkMode(mode.id)}
                >
                  <div className="mode-icon">{mode.icon}</div>

                  <h3>{mode.title}</h3>
                  <p>{mode.desc}</p>

                  <span>{mode.tag}</span>
                  <b>선택</b>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            className={`start-novel-btn ${canStart ? "enabled" : "disabled"}`}
            onClick={handleStart}
            disabled={!canStart}
          >
            AI 편집자와 소설 만들기 시작
          </button>
        </section>
      </main>
    </div>
  );
}
