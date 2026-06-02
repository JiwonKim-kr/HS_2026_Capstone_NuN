# [Prompt-U] 가중치 및 시스템 프롬프트 구현 명세서 (Agent Injectable)

> **기준**: `feat-multimodal-prompt` 브랜치 / 2026-06-02.
> **단일 출처(Source of Truth)**: 전체 지시문 스니펫 문자열과 시스템 프롬프트 원문은 **코드**(`client/src/lib/services/aiService.ts`, 그리고 동일 사본 `mcp-server/src/lib/services/aiService.ts`)에 있습니다. 본 문서는 *구조·의미·흐름* 을 기술합니다. 스니펫/프롬프트를 바꿀 때는 코드를 수정한 뒤 본 문서의 표·요약을 함께 갱신하세요.

---

## 1. 코어 아키텍처 원칙 (Core Architecture Principles)

본 시스템의 AI 모델(`claude-haiku-4-5`)은 최종 결과물을 직접 만드는 것이 아니라, 타겟 AI(ChatGPT·Claude 또는 이미지/영상/음악 생성 AI)를 제어할 **프롬프트를 생성하는 컴파일러**로 동작합니다.

* **모달리티 자동 감지:** 초안을 먼저 분류기(Haiku)로 `text`/`image`/`video`/`music` 중 하나로 분류하고, 그 모달리티에 맞는 차원·스니펫·시스템 프롬프트를 적용합니다. (분류 실패 시 `text`로 폴백.)
* **역할의 분리 (Decoupling):**
    * **배경 맥락 (Background Context):** 직업·목적 등은 타겟 AI의 태도·지식 풀을 정하는 정적 배경으로만 작용합니다.
    * **직접 변수 (Direct Variable/Constraint):** 모달리티별 4개 가중치 차원은 출력 형태를 직접 조종합니다. 텍스트는 `<Constraints>` 태그 규칙으로, 미디어는 묘사 표현 자체로 주입됩니다.
* **변수 독립성 (Orthogonality):** 각 차원은 자기 영역만 제어(상호 배제). 예: 어휘 수준이 높다고 글이 길어지지 않음. (텍스트 시스템 프롬프트에 명시.)
* **토큰 최적화:** 중립(Tier 3) 차원은 스니펫을 빈 문자열(`""`)로 두어 지시문 주입을 생략합니다.
* **정적/동적 분리:** 역할·규칙(정적 system)과 사용자 데이터·제약(동적 prompt)을 분리해 구조적 명료성·유지보수성을 확보합니다.
* **모달리티별 출력 성격:** `text`는 "타겟 챗봇이 읽을 구조화된 지시서", `image`/`video`/`music`은 "타겟 생성 AI에 그대로 붙여넣는 묘사형 프롬프트 그 자체".

---

## 2. 모달리티와 차원 (`modality.ts`)

각 모달리티는 4개 차원을 가지며, 차원마다 1~5 tier 스니펫이 존재합니다.

| 모달리티 | 차원 (4개) | `user_preferences.category` 키 규칙 |
| :--- | :--- | :--- |
| `text` | tone, level, density, creativity | 평면 키 (`tone`, `level`, ...) — 레거시 데이터 호환 |
| `image` | style, detail, lighting, color | `image.<차원>` |
| `video` | camera, pacing, realism, mood | `video.<차원>` |
| `music` | tempo, energy, instrumentation, genre | `music.<차원>` |

* `prefKey(modality, dim)`: `text`는 평면 키, 그 외는 `모달리티.차원` 네임스페이스로 차원명 충돌을 방지합니다.
* 가중치 읽기(`aiService`)와 쓰기(`feedbackService`)가 이 규칙을 공유합니다.

---

## 3. 가중치 데이터 매핑 로직 (Data → Tier)

DB `user_preferences.weight_score`(FLOAT8, 0.0 ~ 2.0)를 임계값에 따라 1~5 tier로 분류합니다. 테이블 구조는 변경하지 않습니다.

```ts
const TIER_THRESHOLDS: { maxScore: number; tier: number }[] = [
  { maxScore: 0.5, tier: 1 },
  { maxScore: 0.8, tier: 2 },
  { maxScore: 1.2, tier: 3 },  // 중립 — 스니펫은 빈 문자열("")
  { maxScore: 1.5, tier: 4 },
  { maxScore: 2.0, tier: 5 },
];
// getTier: score가 모든 임계값을 초과하면(>2.0) 최상위 tier(5)로 폴백.
```

* **Tier 1 (매우 낮음):** `score <= 0.5`
* **Tier 2 (낮음):** `0.5 < score <= 0.8`
* **Tier 3 (중립/기본값):** `0.8 < score <= 1.2`
* **Tier 4 (높음):** `1.2 < score <= 1.5`
* **Tier 5 (매우 높음):** `score > 1.5`

해당 모달리티의 차원만 `prefKey` 규칙으로 조회해 채우며, 미설정 차원은 기본값 `1.0`(중립)입니다.

---

## 4. 후보 3종과 변형 생성 (Variant Strategy)

각 요청은 3종의 tier 세트를 만들어 후보를 생성합니다.

* **`exact`** — 사용자 선호를 그대로 반영한 tier 세트. 사용자에게 첫 번째로 표시됩니다.
* **`variant_a` / `variant_b`** — `generateRandomVariantTiers`로 **차원별 무작위 ±1(또는 0)** 섭동을 적용. `variant_b`는 `variant_a`와 최소 한 차원 이상 달라지도록 강제합니다.
  * ⚠️ 구버전의 "일괄 +1 상향(`plus`) / 일괄 -1 하향(`minus`)" 개념은 폐기되었습니다.
* **후보 개수 가드** — 슬롯(라벨 + tier 세트)을 단일 출처로 두고 LLM 반환 후보와 위치(index) 기준으로 짝짓습니다. 최대 3개로 제한하고(초과분 폐기), 0개면 에러로 처리합니다. 이로써 `variant`/`appliedTiers`/`tierDescription` 메타데이터가 콘텐츠와 어긋나지 않습니다.

---

## 5. tier별 지시문 사전 (Instruction Dictionary)

각 (모달리티, 차원)은 `ko`/`en` × tier 1~5 스니펫을 가집니다(중립 Tier 3 = `""`). **전체 원문은 `aiService.ts`의 `DIMENSION_SNIPPETS`가 단일 출처입니다.** 아래는 텍스트(대표 예시 원문)와 미디어(tier 레이블 요약)입니다.

### 5-1. 텍스트 모달리티 (한국어 기준, 원문)

**답변 어투 (tone)**
* **Tier 1:** `- [어투]: 감정과 수식어를 완전히 배제하고, 가장 건조하고 객관적인 문체(하다체)로 작성할 것.`
* **Tier 2:** `- [어투]: 감정 표현을 자제하고, 정중하고 격식 있는 비즈니스 톤(하십시오체)을 유지할 것.`
* **Tier 3:** `"" (생략 - 표준 어투)`
* **Tier 4:** `- [어투]: 친근하고 대화하는 듯한 부드러운 어투를 사용하며, 가벼운 감정 표현이나 공감을 포함할 것.`
* **Tier 5:** `- [어투]: 매우 유머러스하고 재치 있는 어투를 사용하며, 상황에 맞는 이모지와 밈(Meme)을 적극적으로 활용할 것.`

**답변 수준 (level)**
* **Tier 1:** `- [어휘 수준]: 타겟 독자는 해당 지식이 전혀 없는 초보자입니다. 전문 용어를 철저히 배제하고 상위 1,000개 이내의 쉬운 일상 단어로만 설명할 것.`
* **Tier 2:** `- [어휘 수준]: 타겟 독자는 입문자입니다. 기초 개념 위주로 서술하되, 불가피한 전문 용어 사용 시 반드시 뜻을 풀이할 것.`
* **Tier 3:** `"" (생략 - 일반 대중 수준)`
* **Tier 4:** `- [어휘 수준]: 타겟 독자는 관련 전공자/실무자입니다. 업계 표준 용어, 약어, 그리고 실무적인 개념을 주저 없이 사용할 것.`
* **Tier 5:** `- [어휘 수준]: 타겟 독자는 해당 분야의 시니어/최고 전문가입니다. 논문 수준의 심층 어휘를 사용하고, 필요시 권위 있는 출처나 원리를 인용할 것.`

**정보 밀도 (density)**
* **Tier 1:** `- [정보 밀도]: 부연 설명을 모두 생략하고, 핵심만 3줄 이내의 개조식(Bullet points)으로 극도로 요약할 것.`
* **Tier 2:** `- [정보 밀도]: 주요 특징만 간략히 나열하며, 불필요한 예시나 장황한 배경 설명은 제외할 것.`
* **Tier 3:** `"" (생략 - 표준 길이 및 구조)`
* **Tier 4:** `- [정보 밀도]: 하위 목차를 세분화하여 구조적으로 서술하고, 다양한 엣지 케이스와 구체적인 예시를 3개 이상 다룰 것.`
* **Tier 5:** `- [정보 밀도]: 가능한 모든 세부 정보, 작동 원리, 예외 상황, 역사적 배경 등을 TMI 수준으로 촘촘하고 매우 길게 서술할 것.`

**창의성 (creativity)**
* **Tier 1:** `- [창의성]: 가장 널리 검증되고 정석적인 단일 해결책이나 교과서적인 정의만 정확하게 제시할 것.`
* **Tier 2:** `- [창의성]: 표준적인 접근을 유지하되, 약간의 실무적 팁이나 대중적인 비유를 한 가지 정도 곁들일 것.`
* **Tier 3:** `"" (생략 - 대안 1~2개 제시)`
* **Tier 4:** `- [창의성]: 기존의 틀을 깨는 참신한 시각과 독창적인 비유를 활용하여 다각도에서 아이디어를 확장할 것.`
* **Tier 5:** `- [창의성]: 완전히 파격적이고 도발적인 접근법을 포함하며, 이질적인 개념들을 융합한 브레인스토밍 결과를 제시할 것.`

### 5-2. 미디어 모달리티 (tier 레이블 요약)

전체 지시문 원문은 `DIMENSION_SNIPPETS`를 참조하세요. 아래는 tier별 성향 레이블(`DIMENSION_LABELS`, 카드 표시용)입니다. Tier 3은 중립으로 생략됩니다.

**image**
| 차원 | Tier 1 | Tier 2 | Tier 4 | Tier 5 |
| :--- | :--- | :--- | :--- | :--- |
| style | 포토리얼 | 사실적 | 일러스트 | 추상/실험 |
| detail | 미니멀 | 깔끔 | 정교한 디테일 | 하이퍼디테일 |
| lighting | 평면 조명 | 자연광 | 입체 조명 | 시네마틱 조명 |
| color | 모노톤 | 뮤트 톤 | 선명한 색감 | 비비드 |

**video**
| 차원 | Tier 1 | Tier 2 | Tier 4 | Tier 5 |
| :--- | :--- | :--- | :--- | :--- |
| camera | 고정 샷 | 미세 무빙 | 동적 무빙 | 역동 카메라 |
| pacing | 롱테이크 | 여유로운 전환 | 경쾌한 편집 | 빠른 컷 |
| realism | 실사 | 영화적 실사 | 스타일라이즈드 | CG/애니 |
| mood | 잔잔한 무드 | 절제된 톤 | 고조된 무드 | 극적 무드 |

**music**
| 차원 | Tier 1 | Tier 2 | Tier 4 | Tier 5 |
| :--- | :--- | :--- | :--- | :--- |
| tempo | 매우 느림 | 중저속 | 경쾌함 | 고속 |
| energy | 앰비언트 | 차분함 | 활기참 | 하이 에너지 |
| instrumentation | 미니멀 편성 | 절제된 편성 | 풍성한 편성 | 풀 오케스트라 |
| genre | 정통 장르 | 표준 장르 | 크로스오버 | 실험적 |

---

## 6. 시스템 프롬프트 (정적 파트)

`buildStaticSystemPrompt(language, modality)`가 모달리티에 따라 분기합니다. (원문은 `buildTextSystemPrompt` / `buildMediaSystemPrompt` 참조.)

* **text → `buildTextSystemPrompt(language)`** — "B2B 프롬프트 엔지니어". 생성하는 `content`는 마크다운·XML로 구조화된 *지시서* 이며, 제약 조건은 `<Constraints>` 태그 안에 "타겟 AI가 지켜야 할 규칙"으로 주입합니다(문체 분리·번역·독립성 원칙 명시).
* **image/video/music → `buildMediaSystemPrompt(language, modality)`** — "생성형 미디어 프롬프트 엔지니어". 생성하는 `content`는 타겟 생성 AI에 *그대로 붙여넣는 묘사형 프롬프트 그 자체* 입니다(지시서/메타 래핑 금지). 모달리티별 핵심 요소(피사체·화풍·조명·카메라·템포 등)를 자연스럽게 포함합니다.
* **출력 언어**:
    * `text` content는 **UI 언어를 따름** — `ko`면 한국어로 작성하고 `<Constraints>`에 "한국어로 응답하십시오"를, `en`이면 영어로 작성하고 "Respond in English"를 포함.
    * `image`/`video`/`music` content는 **UI 언어와 무관하게 영어**(해당 도구가 가장 잘 이해하는 언어).
* **공통 규칙**: 지정된 JSON 스키마로만 응답, 후보 3개는 각자 할당된 제약만 적용(혼합 금지).

---

## 7. 동적 컨텍스트 (동적 파트)

`buildDynamicContext`가 `ko`/`en` 템플릿으로 다음을 조립합니다.

* **배경 맥락**: 직업/도메인(`job_role` 또는 `context.domain`), 사용 목적(`primary_purpose`).
* **초안 프롬프트**: 사용자 원문.
* **후보별 제약 조건**: `exact` / `variant_a` / `variant_b` 각각의 제약 스니펫 묶음(`buildConstraintSet`). 전 차원 중립이면 "타겟 AI 자율" 폴백 문구.

---

## 8. 백엔드 실행 흐름 (`generatePromptCandidates`)

1. **Input:** `originalInput`(초안), `userId`(세션에서), `language`(기본 `ko`).
2. **병렬 실행:** 모달리티 분류(Haiku) + `users`(`job_role`, `primary_purpose`) 조회 + `user_preferences` 조회를 단일 `Promise.all`로 동시 실행. (DB 조회는 `userId`만 쓰므로 분류와 의존성 없음.)
3. **Parse & Map:** 해당 모달리티 차원만 `prefKey`로 매핑(기본 1.0) → `getTier`로 `exactTiers` 산출 → `generateRandomVariantTiers`로 `variantATiers`/`variantBTiers` 생성.
4. **Assemble:** `buildStaticSystemPrompt(lang, modality)`(정적) + `buildDynamicContext(...)`(동적) 조립.
5. **AI Request:** `@ai-sdk/anthropic`의 `generateText` 호출 (모델 `claude-haiku-4-5`, `Output.object(promptGenerationSchema)`로 JSON 무결성 강제).
6. **Guard & Inject:** 후보 개수 가드(슬롯 기반 매핑)로 각 후보 `metadata`에 `targetModality`/`variant`/`appliedTiers`/`tierDescription` 주입.
7. **Persist:** `prompt_logs`에 후보별 1행 삽입(동일 `session_id` 공유), 삽입된 `logId`를 `variant`로 매핑.
8. **Return:** `{ requestId, candidates }`.

---

## 9. 피드백 / 가중치 학습 (`processFeedback`)

* **Input:** `historyId`(=`prompt_logs.id`), `userId`, `appliedTiers`, `targetModality`, `targetLikeStatus`.
* **반영 조건:** `targetLikeStatus=true` 이고 아직 미반영(`is_weight_applied=false`)일 때만 가중치 갱신.
* **갱신식:** 각 차원에 대해 `새 점수 = (기존 점수 + TIER_REPRESENTATIVE_SCORES[tier]) / 2`, `prefKey(modality, dim)` 카테고리로 upsert.
  * 대표 점수: `1→0.25, 2→0.65, 3→1.0, 4→1.35, 5→1.75`.
* **중복 방지:** 반영 후 `is_weight_applied=true`. 좋아요 해제는 `is_liked` 플래그만 갱신.
