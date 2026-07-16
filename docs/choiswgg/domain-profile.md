# 내 정보 수정(Profile) 도메인

관련 커밋: `e0b8d68`, `054caec`(미push)

## 1. 실 API 연동 + 레이아웃 컴팩트화 (`e0b8d68`)

프로필 조회/저장, 닉네임 중복 확인, 비밀번호 변경, 보호자 이메일 변경, 연결된 자녀 목록 조회, 보호자 동의 철회를 전부 더미 데이터에서 실 API로 교체. 일부 엔드포인트는 이 시점 BE에 아직 없어 404가 예상되는 채로 우선 연동. 미성년자 여부/보호자 이메일 하드코딩 더미도 제거해서 "보호자 동의" 탭이 해당 계정에만 뜨도록 함.

레이아웃은 전체 여백을 줄이고 프로필 사진을 필명 입력 왼쪽으로 옮겨 정리.

## 2. 프로필 사진 업로드 실 연동 + 자기소개 추가 + 저장 버튼 분리 (`054caec`)

### 2-1. 프로필 사진 업로드 — base64 임시 처리 → 실 업로드 API
`handleProfileImageFileChange`가 `FileReader.readAsDataURL`로 이미지를 base64로 바꿔 그대로 `profileImageUrl`에 저장하던 임시 처리를, BE의 `POST /api/members/me/profile-image`(multipart/form-data)로 실제 업로드 후 반환 URL을 저장하는 흐름으로 교체.

```js
// src/api/memberApi.js
export const uploadProfileImage = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/api/members/me/profile-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
```

### 2-2. 자기소개(introduction) 조회/수정 추가
`member` 테이블의 `introduction` 컬럼을 필명 아래에 노출. BE가 처음엔 `PUT /api/members/me` 요청에서 `introduction`을 받으면서도 응답(`MemberMeResponseDto`)엔 안 내려줘서 "저장은 되는데 새로고침하면 안 보이는" 상태였는데, 요청해서 응답에도 포함되도록 수정됨.

### 2-3. 저장 버튼을 폼 단위로 분리
필명/자기소개/프로필사진/비밀번호가 폼 하나·버튼 하나였는데, 비밀번호를 안 바꿔도 새 비밀번호란이 비어있으면 항상 같이 검증되는 게 불편해서 완전히 분리.

```js
// src/features/profile/hooks/useProfileState.js
const handleSaveBasicInfo = async (e) => { ... }; // 필명/자기소개/프로필사진/보호자 이메일
const handleSavePassword = async (e) => { ... };  // 비밀번호만
```

"기본 정보 저장"/"비밀번호 변경" 카드와 버튼을 독립된 `<form>` 두 개로 분리. 하단 중복 "취소" 버튼은 상단 "홈으로" 버튼과 기능이 겹쳐 제거.

### 2-4. 회원 탈퇴 — 실제로는 소프트 삭제
탈퇴 모달에 "출간한 작품 처리 방법"(비공개 보관/즉시 영구 삭제) 라디오가 있었는데, BE의 `WithdrawRequestDto`엔 `password` 필드뿐이라 이 값(`bookPolicy`) 자체를 안 받는다. 실 탈퇴 회원 데이터를 보면 이메일/닉네임은 그대로 남고 `status`만 `DELETED`로 바뀌는 소프트 삭제였다.

```json
{
  "memberId": 65,
  "email": "withdrawn@sangsang.com",
  "nickname": "탈퇴테스트",
  "status": "DELETED",
  "withdrawnAt": "2026-07-08T09:00:00"
}
```

라디오 버튼 제거, "영구 삭제"/"복구 불가" 문구를 "계정 비활성화 + 데이터 보존(복구는 고객센터 문의)"로 정정. `withdrawMember(password)`도 `bookPolicy` 파라미터 제거. (실 `DELETE /api/members/me` 호출은 테스트 계정이 진짜 탈퇴되는 걸 피하려고 실행 안 하고, 기존 탈퇴 회원 데이터 조회로만 검증)

## 관련 문서
- [[domain-auth]] — 보호자 동의 승인/거절이 이 화면의 "보호자 동의" 탭에서 이뤄짐
- [[domain-admin-ai-usage-and-reports]] — 회원의 `PENDING`(보호자 동의 대기) 상태를 관리자가 아니라 여기서만 처리해야 하는 이유
