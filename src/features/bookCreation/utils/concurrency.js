// 배열을 앞에서부터 최대 limit개씩 동시에 처리한다. Promise.all처럼 전부 한꺼번에 쏘면
// (특히 페이지가 많은 에세이/시 번역) AI 서버에 요청이 몰려 일시적 과부하(503)가 날 수
// 있고, 완전히 순서대로 하나씩 하면(limit=1) 안전하지만 페이지가 많을수록 너무 느리다.
// 실측(11개 동시 요청 중 3개가 503)해서 3~4개는 안전한 걸 확인했다 — 그 중간값으로 처리해
// 안전과 속도를 같이 잡는다. 결과는 항상 입력 순서와 같은 순서로 반환된다.
export async function mapWithConcurrency(items, limit, fn) {
  const results = new Array(items.length);
  let nextIndex = 0;

  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await fn(items[index], index);
    }
  });

  await Promise.all(workers);
  return results;
}
