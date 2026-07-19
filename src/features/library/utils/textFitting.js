// 책을 "만들 때"(발행 전 미리보기 계산 시점) 본문을 리더 페이지 박스에 맞춰 미리 나눈다.
// 리더는 폰트 크기를 sm/base/lg로 바꿀 수 있는데(pageElements.jsx의 FONT_SCALE), 가장 큰
// lg(1.2배) 기준으로 안 넘치게 잘라 두면 base/sm에서는 더 여유가 생기니 항상 안전하다.
// 그래서 리더 쪽(.layout-page-text)은 스크롤이 필요 없고, 넘치는 내용은 그냥 다음
// book_page로 넘어간다.
const SAFETY_FONT_SCALE = 1.2;

// 영어 본문은 --font-serif(Literata, 웹폰트)로 렌더링되는데, 이 폰트가 아직 다운로드되기
// 전에 측정하면 브라우저가 대체 폰트(Georgia 등) 기준으로 폭을 재서 실제보다 짧게
// 나온다 - 그 상태로 "박스에 맞다"고 판단해 버리면, 정작 Literata가 로드된 뒤 다시
// 그려질 때는 넘칠 수 있다(한국어는 Literata에 한글 글리프가 없어 처음부터 대체
// 폰트를 쓰므로 이 문제가 없다). 측정 전에 폰트 로딩을 기다려서 이 어긋남을 없앤다.
export async function ensureFontsReady() {
  if (typeof document !== "undefined" && document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // 폰트 로딩 상태를 못 가져와도 측정 자체는 계속 진행한다.
    }
  }
}

let measurerEl = null;

function getMeasurer() {
  if (measurerEl && document.body.contains(measurerEl)) return measurerEl;
  const el = document.createElement("div");
  el.style.position = "fixed";
  el.style.visibility = "hidden";
  el.style.pointerEvents = "none";
  el.style.top = "-9999px";
  el.style.left = "-9999px";
  el.style.whiteSpace = "pre-wrap";
  el.style.boxSizing = "border-box";
  el.style.padding = "8px 10px"; // .layout-page-text와 동일
  document.body.appendChild(el);
  measurerEl = el;
  return el;
}

function measureHeight(html, { width, fontSize, lineHeight, fontFamily }) {
  const el = getMeasurer();
  el.style.width = `${width}px`;
  el.style.fontSize = `${fontSize}px`;
  el.style.lineHeight = String(lineHeight);
  el.style.fontFamily = fontFamily || "";
  el.innerHTML = html;
  return el.scrollHeight;
}

// prefixHtml(있으면 첫 조각에만 붙는 제목 등) + body(줄글)를 maxHeight 안에 들어가는
// 만큼씩 잘라 여러 조각으로 나눈다. 단어/음절 중간에서 끊기지 않게 직전 공백까지 되돌린다.
function splitBody(body, prefixHtml, maxHeight, styleOpts) {
  const fragments = [];
  let remaining = String(body || "").trim();
  let first = true;
  let guard = 0;

  if (!remaining) return [""];

  while (guard < 300) {
    guard++;
    const prefix = first ? prefixHtml || "" : "";

    if (measureHeight(prefix + remaining, styleOpts) <= maxHeight) {
      fragments.push(remaining);
      break;
    }

    let lo = 0;
    let hi = remaining.length;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      const h = measureHeight(prefix + remaining.slice(0, mid), styleOpts);
      if (h <= maxHeight) lo = mid;
      else hi = mid - 1;
    }

    let cut = lo;
    if (cut <= 0) {
      // 박스가 극단적으로 작아도(예: 제목이 너무 길어 첫 조각에 본문이 한 글자도 못 들어갈 때)
      // 무한루프에 빠지지 않도록 최소 1글자는 진행한다.
      cut = 1;
    } else {
      const tail = remaining.slice(0, cut);
      const boundary = tail.search(/\s+\S*$/);
      if (boundary > 0) cut = boundary;
    }

    fragments.push(remaining.slice(0, cut).trim());
    remaining = remaining.slice(cut).trim();
    first = false;

    if (!remaining) break;
  }

  return fragments.length ? fragments : [""];
}

/**
 * text를 리더 페이지의 box(x,y,w,h)에 맞춰 여러 페이지 분량의 순수 텍스트 조각으로 나눈다.
 * - titleHtml을 주면 그 HTML은 "첫 조각"에만 같이 포함해서 측정한다(제목+본문이 한 박스를
 *   같이 쓰는 시 페이지용). 반환값 자체는 title을 빼고 순수 본문만 담는다.
 * - box는 mapBookPages.js에서 실제 리더가 그 텍스트를 그리는 좌표와 반드시 같아야 한다.
 */
export function splitTextToFitBox(text, { x = 0, y = 0, w, h, fontSize = 17, lineHeight = 1.85, fontFamily = "serif", titleHtml = "" } = {}) {
  // 620 = pageElements.jsx의 PAGE_HEIGHT. 렌더링 쪽 높이 캡 공식과 반드시 같아야 한다.
  const maxHeight = Math.max(0, Math.min(h * SAFETY_FONT_SCALE, 620 - y - 10));
  const styleOpts = {
    width: w,
    fontSize: fontSize * SAFETY_FONT_SCALE,
    lineHeight,
    fontFamily: fontFamily === "serif" ? "var(--font-serif)" : fontFamily === "sans" ? "var(--font-sans)" : undefined,
  };

  return splitBody(text, titleHtml, maxHeight, styleOpts);
}
