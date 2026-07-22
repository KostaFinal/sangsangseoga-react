# 인프라 — CloudFront가 API 에러 응답을 index.html로 둔갑시키는 문제

관련 커밋: 없음(프론트 코드 수정 아님, AWS CloudFront 콘솔 설정 조치 필요 — 미해결)

## 증상

정지 계정(`SUSPENDED_MEMBER`)으로 로그인을 시도하면, 백엔드가 내려주는 "이용이 정지된 계정입니다. 고객센터에 문의해 주세요." 대신 프론트가 `요청 처리 중 문제가 발생했습니다`(`authService.js`의 `unwrap()` 폴백 문구)를 띄웠다.

## 원인 진단 과정

처음엔 `src/api/axios.js`의 401 인터셉터가 원인으로 의심됐다 — 로그인 401을 액세스 토큰 만료로 오인해 조용히 `/api/auth/token-refresh`를 시도하고, 그 실패로 원래 에러 메시지가 덮어써지는 시나리오. 실제로 이 부분에 버그가 있어서 `/api/auth/login`을 리프레시 재시도 예외 목록에 추가하는 수정을 커밋(`b6e82d4`)했다.

하지만 이후 브라우저 개발자 도구 Network 탭에서 실제 `POST /api/auth/login` 응답을 확인한 결과, 진짜 원인은 따로 있었다:

```
Status Code: 200 OK
content-type: text/html
server: AmazonS3
x-cache: Error from cloudfront
age: 267
etag, last-modified 존재
```

- `content-type: text/html` — 로그인 API인데 JSON이 아니라 HTML이 응답으로 옴
- `server: AmazonS3` — 백엔드가 아니라 **S3(프론트 정적 파일 오리진)** 가 응답을 준 것
- `x-cache: Error from cloudfront` — CloudFront가 오리진 에러를 가로채 자체 캐시로 응답
- `age`/`etag`/`last-modified` — 동적 API 응답이 아니라 **정적 파일(index.html) 캐시**의 특징

## 근본 원인

CloudFront에는 React Router의 SPA 라우팅(새로고침/딥링크 지원)을 위해 "403/404 응답 → `/index.html`을 200으로 대체 응답"하는 Custom Error Response 규칙이 걸려 있다. 이 규칙은 **배포(distribution) 전체 단위로만 설정 가능하고 오리진/비헤이비어별로 분리되지 않는다.**

그 결과, 백엔드(API 오리진)가 정지 계정 로그인에 대해 401/403 같은 에러 상태 코드를 내려줘도, CloudFront가 이 상태 코드를 SPA 폴백 규칙으로 가로채서 **프론트의 `index.html`을 200 OK로 대신 내려준다.** 프론트는 JSON을 기대하고 `res.data`를 파싱하려 하지만 실제로는 HTML 문자열이 오기 때문에, `authService.js`의 `unwrap()`이 `body.message`를 못 찾고 폴백 문구를 띄우게 된다.

**중요**: 이 문제는 로그인에 국한되지 않는다. Custom Error Response에 등록된 상태 코드(예: 403, 404)와 겹치는 모든 `/api/*` 에러 응답이 같은 방식으로 조용히 `index.html`로 둔갑할 수 있다. 즉 백엔드가 401 대신 403이나 404로 에러를 내려주는 다른 API들도 잠재적으로 같은 문제를 겪을 수 있다.

## 필요한 조치 (AWS 콘솔, 이 저장소 밖의 작업)

CloudFront의 "Custom error responses"(배포 전체 단위) 대신, **CloudFront Function(viewer request)** 으로 전환해서 요청 단계에서 분기하는 방식을 권장한다:

- 요청 경로가 `/api/`로 시작하지 **않고**, 확장자도 없는 경우에만 `/index.html`로 URI를 재작성
- `/api/*` 요청은 이 재작성 대상에서 완전히 제외 → 오리진(백엔드)이 반환하는 실제 상태 코드/바디가 그대로 클라이언트까지 전달됨

이 방식은 응답 상태 코드를 사후에 가로채는 게 아니라 요청 단계에서 분기하므로, API 에러 응답이 SPA 폴백에 절대 섞이지 않는다.

## 관련 문서
- [[domain-auth]] — 로그인 401 인터셉터 자체 버그(별개 원인, 이미 수정됨) 관련 내용은 여기 참고
