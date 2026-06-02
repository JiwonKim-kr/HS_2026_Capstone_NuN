# Prompt-U API Specification v2.0

본 문서는 **Prompt-U (개인화 AI 프롬프트 제너레이터)** 의 프론트엔드(Next.js App Router)와 백엔드(Next.js Route Handlers + Supabase) 간 통신 규약입니다.

> 기준: `feat-multimodal-prompt` 브랜치 / 2026-06-02. 별도의 MCP 서버(`mcp-server/`)는 외부 AI 클라이언트가 API 키로 접속하는 독립 채널이며 본 문서 범위 밖입니다(§5 참고).

---

## 1. 기본 정보 (General Info)

* **아키텍처**: 프론트엔드와 API 모두 Next.js App Router(`client/`)에서 제공됩니다. 구버전의 별도 Express 프록시 서버는 제거되었습니다(`server/`에는 더 이상 소스가 없습니다).
* **Base Path**: `/api`
* **Content-Type**: `application/json`
* **인증**: **Supabase 세션 쿠키 기반.** 각 Route Handler는 `getAuthenticatedUser()`로 세션을 검증하며, `userId`는 세션에서 추출합니다(요청 바디로 받지 않음). 미인증 시 `401 { "success": false, "error": "Unauthorized" }`.
* **공통 응답 형태**: 성공은 `{ "success": true, "data": ... }`, 실패는 `{ "success": false, "error": ... }`.
  * ⚠️ 현재 `error` 필드 형태가 엔드포인트마다 **객체(`{ code, message }`)** 와 **문자열** 로 혼재합니다(§4). 향후 통일 권장.

---

## 2. 프롬프트 엔드포인트

### 2.1. 프롬프트 후보군 생성

초안에서 타겟 모달리티(`text`/`image`/`video`/`music`)를 **자동 감지**하고, 사용자 선호 가중치를 결합해 후보를 **최대 3개** 생성합니다.

* **URL**: `POST /api/prompts/generate`
* **인증**: 필요
* **Request Body**:
```json
{
  "originalInput": "string (필수, 사용자가 입력한 초안)",
  "language": "ko | en (옵션, 기본값 ko)",
  "context": {
    "domain": "string (옵션: 업무/창작 등 목적)"
  }
}
```
* **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "requestId": "uuid (서버 생성)",
    "candidates": [
      {
        "candidateId": "string",
        "logId": "uuid (저장된 prompt_logs 행 ID)",
        "content": "최적화된 프롬프트 본문",
        "metadata": {
          "tone": "string (옵션, LLM 생성 — 레거시 필드)",
          "format": "string (옵션, LLM 생성 — 레거시 필드)",
          "length": "string (옵션, LLM 생성 — 레거시 필드)",
          "targetModality": "text | image | video | music",
          "variant": "exact | variant_a | variant_b",
          "tierDescription": "string (예: '격식체 · 전공자 어휘')",
          "appliedTiers": { "<차원>": 1 }
        }
      }
    ]
  }
}
```
* **비고**:
  * 후보는 보통 3개(`exact`, `variant_a`, `variant_b`)지만, 모델 응답에 따라 1~3개로 조정될 수 있습니다(후보 개수 가드).
  * `appliedTiers`의 키는 모달리티별로 다릅니다 — `text`: tone/level/density/creativity, `image`: style/detail/lighting/color, `video`: camera/pacing/realism/mood, `music`: tempo/energy/instrumentation/genre.
  * `targetModality`/`variant`/`tierDescription`/`appliedTiers`는 서버가 주입하며, `content`/`tone`/`format`/`length`만 LLM이 생성합니다.
* **오류**:
  * `400 { "success": false, "error": { "code": "INVALID_INPUT", "message": "..." } }`
  * `401 { "success": false, "error": "Unauthorized" }`
  * `429 { "success": false, "error": { "code": "DAILY_LIMIT_EXCEEDED", "message": "...", "dailyCount": 10, "limit": 10 } }` — 일일 생성 한도(기본 10회) 초과. 관리자(`is_admin`)는 무제한.
  * `500 { "success": false, "error": { "code": "AI_SERVICE_ERROR", "message": "...", "details": "(개발 환경에서만)" } }`

---

### 2.2. 피드백 전송 (좋아요 + 가중치 학습)

후보의 좋아요 상태를 기록하고, **처음 좋아요일 때만** 해당 후보의 tier를 사용자 선호 가중치에 반영합니다. (구버전 `/api/prompts/select`를 대체합니다.)

* **URL**: `POST /api/prompts/feedback`
* **인증**: 필요
* **Request Body**:
```json
{
  "historyId": "uuid (prompt_logs 행 ID = 생성 응답의 logId)",
  "appliedTiers": { "<차원>": 1 },
  "targetModality": "text | image | video | music (옵션, 기본 text)",
  "targetLikeStatus": true
}
```
* **Response (200 OK)**: `{ "success": true, "data": { "success": true } }`
* **동작**:
  * `is_liked`를 `targetLikeStatus`로 갱신.
  * `targetLikeStatus=true`이고 아직 미반영(`is_weight_applied=false`)이면, 각 차원 카테고리(`prefKey` 규칙)에 대해 `새 점수 = (기존 점수 + tier 대표점수) / 2`로 upsert 후 `is_weight_applied=true`로 표시.
  * 좋아요 해제나 이미 반영된 건은 플래그만 갱신(가중치 중복 반영 방지).
* **오류**: `400`(필수 필드 누락/형식 오류), `401`, `500 { "success": false, "error": "문자열" }`

---

### 2.3. 히스토리 목록 조회

* **URL**: `GET /api/prompts/history`
* **인증**: 필요
* **Response (200 OK)**: 세션 단위로 중복 제거된 최신순 목록.
```json
{
  "success": true,
  "data": [
    { "sessionId": "uuid", "title": "초안 원문", "createdAt": "2026-06-02T..." }
  ]
}
```
* **오류**: `401`, `500`

---

### 2.4. 히스토리 상세 조회

* **URL**: `GET /api/prompts/history/detail/{sessionId}`
* **인증**: 필요
* **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "title": "초안 원문",
    "date": "2026.06.02",
    "originalPrompt": "초안 원문",
    "candidates": [
      {
        "candidateId": "exact | variant_a | variant_b",
        "logId": "uuid",
        "content": "프롬프트 본문",
        "metadata": { "targetModality": "text", "variant": "exact", "appliedTiers": {} },
        "isLiked": false
      }
    ]
  }
}
```
* **오류**: `400`(sessionId 누락), `401`, `404`(세션 없음), `500`

---

### 2.5. 히스토리 삭제

* **URL**: `DELETE /api/prompts/history/{sessionId}`
* **인증**: 필요 (본인 세션만 삭제 가능)
* **Response (200 OK)**: `{ "success": true }`
* **오류**: `400`(sessionId 누락), `401`, `404`(세션 없음), `500`

---

## 3. MCP 키 엔드포인트

외부 MCP 서버 접속용 개인 API 키 관리. 모두 인증 필요.

* **`GET /api/mcp-keys`** → `{ "success": true, "data": [ { "id", "key_prefix", "label", "created_at", "last_used_at" } ] }`
* **`POST /api/mcp-keys`** (Body 옵션 `{ "label": "string" }`) → `{ "success": true, "data": { "id", "key_prefix", "label", "created_at", "last_used_at", "rawKey": "ptu_..." } }`
  * **`rawKey`는 생성 시 한 번만 반환**되며, 서버에는 SHA-256 해시(`key_hash`)와 접두사(`key_prefix`)만 저장됩니다.
* **`DELETE /api/mcp-keys/{id}`** → `{ "success": true }` (본인 키만 삭제)

---

## 4. 공통 에러 응답 (Error Handling)

| Status | `error` 형태 | 설명 |
| :--- | :--- | :--- |
| `400` | `{ code: "INVALID_INPUT", message }` (generate) / 문자열 (그 외) | 요청 형식 오류 (Zod 검증 등) |
| `401` | `"Unauthorized"` | Supabase 세션 미인증 |
| `404` | 문자열 | 리소스 없음 (히스토리 세션) |
| `429` | `{ code: "DAILY_LIMIT_EXCEEDED", message, dailyCount, limit }` | 일일 생성 한도 초과 |
| `500` | `{ code: "AI_SERVICE_ERROR", ... }` (generate) / 문자열 (그 외) | 서버 / AI / DB 오류 |

**에러 응답 예시**:
```json
{
  "success": false,
  "error": { "code": "INVALID_INPUT", "message": "originalInput: 초안 내용을 입력해주세요." }
}
```

> 참고: `error` 필드가 엔드포인트마다 객체/문자열로 혼재합니다. 클라이언트는 두 형태를 모두 처리해야 하며, 향후 `{ code, message }` 객체로 통일하는 것을 권장합니다.

---

## 5. 별도 MCP 서버 (범위 밖, 참고)

`mcp-server/`는 외부 AI 클라이언트(Claude 등)가 접속하는 독립 실행 서버입니다. 위 쿠키 세션이 아니라 **§3에서 발급한 개인 API 키**로 인증합니다(`verifyApiKey`). 프롬프트 생성·피드백 로직(`aiService`/`feedbackService`)은 `client` 사본과 동일하게 유지됩니다.
