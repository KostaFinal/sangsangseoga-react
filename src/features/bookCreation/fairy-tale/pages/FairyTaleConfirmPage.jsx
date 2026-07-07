import fairyBg from "../../assets/fairy-bg.png";
import { useFairyTaleConfirm } from "../hooks/useFairyTaleConfirm";

function FairyTaleConfirmPage() {
  const { rows, getValue, isFreeMode, handlePrev, handleGoImages } = useFairyTaleConfirm();

  return (
    <div
      className="choice-builder-page fairy-confirm-page"
      style={{ "--choice-bg": `url(${fairyBg})` }}
    >
      <main className="choice-main">
        <section className="choice-title-section">
          <span className="choice-kicker">SETTING CONFIRM</span>
          <h1>동화 설정을 확인해요</h1>
          <p>고른 내용이 맞는지 확인하고 다음 단계로 넘어가요.</p>
        </section>

        <section className="choice-content-layout">
          <aside className="choice-summary-panel">
            <div className="summary-header">
              <span>📋</span>
              <div>
                <h2>동화 설정 확인</h2>
                <p>아래 내용으로 동화를 만들어요.</p>
              </div>
            </div>

            <div className="summary-list">
              {rows.map(([label, key]) => {
                const value = getValue(key);
                const isFilled = value !== "미정";

                return (
                  <div key={key} className={`summary-item ${isFilled ? "filled" : ""}`}>
                    <div>
                      <span>{label}</span>
                      <strong>{value}</strong>
                    </div>

                    <em>{isFilled ? "완료" : "미정"}</em>
                  </div>
                );
              })}
            </div>

            <div
              className="choice-question-actions"
              style={{ gridTemplateColumns: "1fr 1.3fr" }}
            >
              <button type="button" className="choice-sub-btn" onClick={handlePrev}>
                ← 이전으로
              </button>

              <button type="button" className="choice-main-btn" onClick={handleGoImages}>
                {isFreeMode ? "AI 선생님과 이야기 쓰러 가기 →" : "공동창작실로 이동하기 →"}
              </button>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

export default FairyTaleConfirmPage;

