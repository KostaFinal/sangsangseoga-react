import scenarioBg from "../../assets/scenario-bg.png";
import { useNovelScenarioSelect } from "../hooks/useNovelScenarioSelect";

function NovelScenarioSelectPage() {
  const {
    scenarios,
    filters,
    selectedScenarioId,
    setSelectedScenarioId,
    selectedScenario,
    selectedFilters,
    handleStart,
    handleFilterSelect,
  } = useNovelScenarioSelect();
  return (
    <div className="novel-scenario-page">
      <img
        className="novel-scenario-bg"
        src={scenarioBg}
        alt=""
        aria-hidden="true"
      />

      <div className="novel-scenario-dim" />

      <header className="scenario-header">
        <div className="scenario-brand">
          <span className="brand-icon">🎬</span>
          <strong>소설 스튜디오</strong>
        </div>

        <nav className="scenario-nav">
          <button type="button">프로젝트</button>
          <button type="button">세계관 설정</button>
          <button type="button">캐릭터</button>
          <button type="button">자료실</button>
          <button type="button">요금제</button>
          <button type="button">가이드</button>
        </nav>

        <div className="scenario-user">
          <button type="button" className="premium-button">
            👑 프리미엄
          </button>
          <button type="button" className="bell-button">
            🔔
          </button>
          <button type="button" className="profile-button">
            작가의 서재 ▾
          </button>
        </div>
      </header>

      <main className="scenario-main">
        <section className="scenario-title-section">
          <p className="eyebrow">작가 회의실 → 시나리오 선택 모드</p>
          <h1>시나리오를 선택해보세요</h1>
          <p>
            준비된 시나리오 중 마음에 드는 방향을 선택하면, 다음 단계에서
            세부 설정을 조정할 수 있어요.
          </p>

          <div className="scenario-progress">
            <div className="progress-step active">
              <span>1</span>
              <strong>시나리오 탐색</strong>
            </div>
            <em>››</em>
            <div className="progress-step">
              <span>2</span>
              <strong>세부 수정</strong>
            </div>
            <em>››</em>
            <div className="progress-step">
              <span>3</span>
              <strong>설정 확정</strong>
            </div>
            <em>››</em>
            <div className="progress-step">
              <span>4</span>
              <strong>집필 시작</strong>
            </div>
          </div>
        </section>

        <section className="scenario-board">
          <aside className="filter-panel">
            <h2>필터 / 조건</h2>

            <FilterGroup
              title="장르"
              filterName="genre"
              items={filters.genre}
              selectedValue={selectedFilters.genre}
              onSelect={handleFilterSelect}
            />

            <FilterGroup
              title="분위기"
              filterName="mood"
              items={filters.mood}
              selectedValue={selectedFilters.mood}
              onSelect={handleFilterSelect}
            />

            <FilterGroup
              title="주인공 유형"
              filterName="protagonist"
              items={filters.protagonist}
              selectedValue={selectedFilters.protagonist}
              onSelect={handleFilterSelect}
            />

            <FilterGroup
              title="배경"
              filterName="background"
              items={filters.background}
              selectedValue={selectedFilters.background}
              onSelect={handleFilterSelect}
            />

            <FilterGroup
              title="결말 느낌"
              filterName="ending"
              items={filters.ending}
              selectedValue={selectedFilters.ending}
              onSelect={handleFilterSelect}
            />
          </aside>

          <section className="scenario-list-panel">
            <div className="panel-title-row">
              <h2>시나리오 카드 목록</h2>
              <span>{scenarios.length}개의 추천안</span>
            </div>

            <div className="scenario-card-list">
              {scenarios.map((scenario) => (
                <button
                  key={scenario.id}
                  type="button"
                  className={`scenario-card ${selectedScenarioId === scenario.id ? "selected" : ""
                    }`}
                  onClick={() => setSelectedScenarioId(scenario.id)}
                >
                  <div className="scenario-card-top">
                    <span>SCENARIO {scenario.id}</span>
                    {selectedScenarioId === scenario.id && <em>선택됨</em>}
                  </div>

                  <h3>{scenario.title}</h3>

                  <dl>
                    <div>
                      <dt>장르</dt>
                      <dd>{scenario.genre}</dd>
                    </div>
                    <div>
                      <dt>분위기</dt>
                      <dd>{scenario.mood}</dd>
                    </div>
                    <div>
                      <dt>이야기 씨앗</dt>
                      <dd>{scenario.seed}</dd>
                    </div>
                    <div>
                      <dt>갈등</dt>
                      <dd>{scenario.conflict}</dd>
                    </div>
                  </dl>
                </button>
              ))}
            </div>
          </section>

          <aside className="summary-panel">
            <h2>선택 요약</h2>

            <div className="summary-box">
              <p className="summary-label">선택한 시나리오</p>
              <h3>{selectedScenario?.title}</h3>
            </div>

            <SummaryItem label="이야기 씨앗" value={selectedScenario?.seed} />
            <SummaryItem label="장르" value={selectedScenario?.genre} />
            <SummaryItem label="주인공" value={selectedScenario?.protagonist} />
            <SummaryItem label="갈등" value={selectedScenario?.conflict} />

            <button type="button" className="scenario-start-btn" onClick={handleStart}>
              세부 수정으로 이동 →
            </button>
          </aside>
        </section>
      </main>
    </div>
  );
}

function FilterGroup({ title, filterName, items, selectedValue, onSelect }) {
  return (
    <div className="filter-group">
      <h3>{title}</h3>

      <div className="filter-chip-wrap">
        {items.map((item) => (
          <button
            key={item}
            type="button"
            className={selectedValue === item ? "active" : ""}
            onClick={() => onSelect(filterName, item)}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div className="summary-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default NovelScenarioSelectPage;



