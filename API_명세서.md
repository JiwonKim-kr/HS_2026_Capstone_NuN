# 🚀 Prompt-U API Specification v1.0

본 문서는 **Prompt-U (개인화 AI 프롬프트 제너레이터)** 프로젝트의 프론트엔드(Next.js)와 백엔드(Node.js) 간 데이터 통신 규약을 정의한 명세서입니다.

## 1. 기본 정보 (General Info)
* **Base URL**: `https://api.prompt-u.com/v1` (배포 환경: Railway)
* **Content-Type**: `application/json`
* **Authentication**: `Authorization: Bearer <Supabase_JWT_Token>`

---

## 2. API Endpoints

### 2.1. 프롬프트 후보군 생성
**AI 모델이 사용자의 입력과 개인 선호 지표를 결합하여 다듬어진 프롬프트 후보군을 생성합니다.**

* **URL**: `/api/prompts/generate`
* **Method**: `POST`
* **Request Body**:
```json
{
  "userId": "uuid",
  "originalInput": "string (사용자가 입력한 초안 내용)",
  "context": {
    "domain": "string (옵션: 업무, 창작 등 목적)"
  }
}
```
* **Response (200 OK)**:
```json
{
  "requestId": "uuid (이번 생성 요청의 고유 ID)",
  "candidates": [
    {
      "candidateId": "1",
      "content": "다음 주 회의를 위한 보고서 목차를 개조식으로 명확하게 작성해 주세요.",
      "metadata": {
        "tone": "명확한",
        "format": "개조식",
        "length": "짧음"
      }
    },
    {
      "candidateId": "2",
      "content": "다음 주 회의 보고서에 들어갈 주요 목차를 상세하고 친근한 어조로 구성해 주시기 바랍니다.",
      "metadata": {
        "tone": "친근한",
        "format": "서술형",
        "length": "보통"
      }
    }
  ]
}
```

---

### 2.2. 최적 프롬프트 선택 및 피드백 전송 (가중치 업데이트)
**사용자가 선택한 프롬프트를 기록(`prompt_logs`)하고, 이를 긍정 피드백으로 인식하여 선호 지표 가중치(`user_preferences`)를 실시간 업데이트합니다.**

* **URL**: `/api/prompts/select`
* **Method**: `POST`
* **Request Body**:
```json
{
  "userId": "uuid",
  "requestId": "uuid",
  "chosenCandidateId": "string (선택된 후보의 ID)",
  "originalInput": "string",
  "chosenPrompt": "string (선택된 프롬프트 전문)",
  "chosenMetadata": {
    "tone": "string",
    "format": "string",
    "length": "string"
  },
  "allCandidates": [
    // 생성되었던 후보군 전체 배열 (로깅용)
  ] 
}
```
* **Response (200 OK)**:
```json
{
  "success": true,
  "message": "프롬프트 로그 저장 및 가중치 업데이트가 완료되었습니다.",
  "updatedPreferences": [
    { "category": "tone", "attribute": "명확한", "weightScore": 1.1 },
    { "category": "format", "attribute": "개조식", "weightScore": 1.2 }
  ]
}
```

---

### 2.3. 사용자 선호 지표 조회
**현재 데이터베이스에 구축된 사용자의 초기 및 누적 선호 지표 가중치를 조회합니다.**

* **URL**: `/api/users/:userId/preferences`
* **Method**: `GET`
* **Request Params**: URL Path Variable (`userId`)
* **Response (200 OK)**:
```json
{
  "userId": "uuid",
  "preferences": [
    {
      "category": "tone",
      "attribute": "전문적인",
      "weightScore": 1.1,
      "lastUpdated": "2026-04-01T15:30:00Z"
    },
    {
      "category": "format",
      "attribute": "개조식",
      "weightScore": 1.2,
      "lastUpdated": "2026-04-01T15:30:00Z"
    }
  ]
}
```

---

## 3. 공통 에러 응답 (Error Handling)
**Zod를 통한 데이터 검증 실패 또는 시스템 오류 시 반환되는 포맷입니다.**

| Status Code | Error Code | Description |
| :--- | :--- | :--- |
| `400` | `INVALID_INPUT` | 요청 데이터 형식이 올바르지 않음 (Zod Validation Error) |
| `401` | `UNAUTHORIZED` | 유효하지 않은 인증 토큰 (Supabase Auth 에러) |
| `500` | `AI_SERVICE_ERROR` | Claude 3.5 Sonnet API 통신 장애 또는 타임아웃 |
| `500` | `DB_ERROR` | Supabase 데이터베이스 쿼리 실행 실패 |

**에러 응답 예시**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "요청 본문의 'originalInput' 필드가 누락되었습니다."
  }
}
```
