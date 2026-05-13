# Plan: Prompt-U MCP Server (일반 사용자용 원격 서비스)

## Context

일반 사용자가 Claude Desktop, Cursor, 로컬 AI 등 MCP 호환 클라이언트에서 Prompt-U의 개인화 프롬프트 생성 서비스를 사용할 수 있도록 **원격 호스팅 MCP 서버**를 구축한다.

**핵심 원칙**: Supabase 키와 Anthropic 키는 우리 서버에만 존재. 사용자는 **MCP 서버 URL + 개인 API 키**만으로 연결.

---

## 전체 아키텍처

```
[사용자 MCP 클라이언트]
   Claude Desktop / Cursor / 로컬 AI
   config: URL + "Bearer ptu_abc123..."
          │
          │ HTTPS POST /mcp (Streamable HTTP)
          ▼
[MCP Server - 우리 서버에 배포]
   mcp-server/ (Node.js, Railway)
   - API 키 검증 (SHA-256 해시 → user_id 조회)
   - 5개 MCP Tool 제공
   - SUPABASE_SERVICE_ROLE_KEY / ANTHROPIC_API_KEY 보유
          │
          │ Supabase 서비스 롤 (비공개)
          ▼
[Supabase (DB + Auth)]
   - user_api_keys 테이블 (키 해시 저장)
   - users, user_preferences, prompt_logs 기존 테이블
          ▲
          │ 사용자가 키 발급/관리
[Next.js Web App]
   /api/mcp-keys      (POST 발급, GET 목록, DELETE 폐기)
   settings/page.tsx  (API 키 관리 UI)
```

---

## 사용자 흐름 (User Flow)

1. Prompt-U 웹앱 로그인 → Dashboard > Settings > "MCP API Keys" 섹션
2. "Generate New Key" 클릭 → 웹앱이 `ptu_<64자 hex>` 토큰 생성, SHA-256 해시만 DB 저장
3. 모달에서 토큰 1회 표시 + 복사 버튼 (이후 재확인 불가)
4. 사용자가 MCP 클라이언트 설정에 입력:
   ```json
   {
     "mcpServers": {
       "prompt-u": {
         "type": "http",
         "url": "https://mcp.prompt-u.com/mcp",
         "headers": { "Authorization": "Bearer ptu_abc123..." }
       }
     }
   }
   ```
5. 완료 — 이후 AI가 프롬프트 최적화 툴을 자동으로 사용

---

## 구현 범위 (변경/추가 사항)

### A. Supabase 마이그레이션 (신규)
파일: `supabase/migrations/20260513_add_user_api_keys.sql`

```sql
CREATE TABLE public.user_api_keys (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key_hash     TEXT NOT NULL UNIQUE,   -- SHA-256 of raw token
  key_prefix   TEXT NOT NULL,          -- 처음 8자, UI 표시용
  label        TEXT NOT NULL DEFAULT 'MCP Key',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  expires_at   TIMESTAMPTZ             -- NULL = 만료 없음
);

ALTER TABLE public.user_api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_see_own_keys" ON public.user_api_keys
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_delete_own_keys" ON public.user_api_keys
  FOR DELETE USING (auth.uid() = user_id);
GRANT SELECT, DELETE ON public.user_api_keys TO authenticated;
GRANT ALL ON public.user_api_keys TO service_role;
```

### B. Next.js 웹앱 변경 (신규 2파일 + 수정 1파일)

**신규: `/client/src/app/api/mcp-keys/route.ts`**
- GET: 사용자의 키 목록 반환 (`id, key_prefix, label, created_at, last_used_at`)
- POST: `ptu_` + `crypto.randomBytes(32).toString('hex')` 생성, SHA-256 해시 저장, 원본 1회 반환

**신규: `/client/src/app/api/mcp-keys/[id]/route.ts`**
- DELETE: 본인 키만 삭제 가능 (user_id 검증 후 삭제)

**수정: `/client/src/app/dashboard/settings/page.tsx`**
- 기존 설정 카드들 아래 "MCP API Keys" 섹션 추가
- 키 목록 표 (prefix, 생성일, 최근 사용, 폐기 버튼)
- "키 생성" 버튼 + 발급 모달

### C. MCP Server (신규 패키지)
디렉토리: `mcp-server/` (레포 루트)

```
mcp-server/
├── package.json
├── tsconfig.json
├── .env.example
└── src/
    ├── index.ts                 # Express 서버, /mcp 엔드포인트, auth gate
    ├── mcpHandler.ts            # createMcpServer(userId) → 5개 tool 등록
    ├── auth/
    │   └── verifyApiKey.ts      # SHA-256 해시 → user_id 조회
    ├── lib/
    │   ├── supabaseAdmin.ts     # service-role Supabase 클라이언트
    │   └── services/
    │       ├── aiService.ts     # client에서 복사 (경로만 수정)
    │       ├── feedbackService.ts
    │       └── historyService.ts
    └── schemas/
        └── promptSchema.ts     # client에서 복사
```

---

## MCP Tools (5개)

| Tool 이름 | Input | 설명 |
|-----------|-------|------|
| `generate_prompt` | `originalInput`, `domain?` | 초안 → 개인화된 3개 후보 생성 |
| `submit_feedback` | `logId`, `targetLikeStatus`, `appliedTiers` | 좋아요/취소 → 선호도 가중치 업데이트 |
| `list_history` | (없음) | 세션 목록 반환 |
| `get_session` | `sessionId` | 세션 상세 (후보 3개) |
| `delete_session` | `sessionId` | 세션 영구 삭제 |

> **userId는 API 키 검증에서 자동 주입** — 클라이언트가 userId를 전달할 필요 없고, 조작도 불가

---

## 핵심 코드 패턴

### `mcp-server/src/auth/verifyApiKey.ts`
```typescript
export async function verifyApiKey(authHeader: string): Promise<string | null> {
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  const keyHash = createHash('sha256').update(token).digest('hex');
  const { data } = await supabase
    .from('user_api_keys')
    .select('user_id, expires_at')
    .eq('key_hash', keyHash)
    .single();
  if (!data) return null;
  if (data.expires_at && new Date(data.expires_at) < new Date()) return null;
  // last_used_at 비동기 업데이트 (fire-and-forget)
  return data.user_id;
}
```

### `mcp-server/src/index.ts` (HTTP 진입점)
```typescript
app.post('/mcp', async (req, res) => {
  const userId = await verifyApiKey(req.headers['authorization'] ?? '');
  if (!userId) return res.status(401).json({ error: 'Invalid API key' });

  const server = createMcpServer(userId); // userId 바인딩
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});
```

### `mcp-server/src/mcpHandler.ts` (tool 등록 패턴)
```typescript
export function createMcpServer(userId: string): McpServer {
  const server = new McpServer({ name: 'prompt-u', version: '1.0.0' });
  server.tool('generate_prompt', '...설명...', 
    { originalInput: z.string().min(1), domain: z.string().optional() },
    async ({ originalInput, domain }) => {
      const result = await generatePromptCandidates({ userId, originalInput, context: domain ? { domain } : undefined });
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );
  // ... 나머지 4개 tool
  return server;
}
```

---

## 설정 파일

### `mcp-server/package.json` (핵심)
```json
{
  "type": "module",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.12.0",
    "@supabase/supabase-js": "^2.99.3",
    "@ai-sdk/anthropic": "^3.0.64",
    "ai": "^6.0.142",
    "express": "^4.21.0",
    "zod": "^4.3.6"
  }
}
```

### `mcp-server/tsconfig.json` (필수 옵션)
```json
{ "module": "NodeNext", "moduleResolution": "NodeNext" }
```
> ESM-only인 `@modelcontextprotocol/sdk` 때문에 NodeNext 필수

### `.env.example`
```
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...   # 우리 서버에만 존재
ANTHROPIC_API_KEY=...            # 우리 서버에만 존재
PORT=3001
```

---

## 서비스 파일 적용 시 수정 사항 (로직 변경 없음)

client에서 복사 후 3가지만 수정:
1. `createClient(process.env.SUPABASE_URL!, ...)` 제거 → `import { supabase } from '../../lib/supabaseAdmin.js'`
2. `@/lib/schemas/promptSchema` → `../../schemas/promptSchema.js` (상대 경로)
3. 모든 상대 import에 `.js` 확장자 추가 (NodeNext ESM 필수)

---

## 구현 순서

1. **DB 마이그레이션** 작성 및 `supabase db push` 적용
2. **웹앱 `/api/mcp-keys` 라우트** 구현 (GET, POST, DELETE)
3. **Settings 페이지** API 키 섹션 UI 추가
4. **`mcp-server/` 초기화** — package.json, tsconfig.json, npm install
5. **`verifyApiKey.ts`** 구현 (SHA-256 해시 검증)
6. **서비스 파일 복사 + import 수정**
7. **`mcpHandler.ts`** — 5개 tool 등록
8. **`index.ts`** — Express + auth gate + MCP 연결
9. **로컬 테스트**: `npm run dev` → Claude Desktop에서 `http://localhost:3001/mcp` 연결
10. **Railway 배포** → 프로덕션 URL로 Claude Desktop 설정 업데이트

---

## 검증 방법

| 단계 | 검증 방법 |
|------|----------|
| API 키 발급 | 웹앱 Settings에서 키 생성 → DB `user_api_keys` 테이블 확인 |
| MCP 인증 | MCP Inspector로 유효/무효 키 테스트 |
| 전체 흐름 | Claude Desktop에서 `generate_prompt` 호출 → `prompt_logs` 테이블 레코드 생성 확인 |
| 웹앱 동기화 | MCP로 생성한 세션이 웹앱 History 페이지에 표시되는지 확인 |
| 보안 | 다른 user_id 전달 시도 → 자신의 데이터만 조회됨 확인 |

---

## 수정 대상 파일 목록

| 파일 | 작업 |
|------|------|
| `supabase/migrations/20260513_add_user_api_keys.sql` | 신규 생성 |
| `client/src/app/api/mcp-keys/route.ts` | 신규 생성 |
| `client/src/app/api/mcp-keys/[id]/route.ts` | 신규 생성 |
| `client/src/app/dashboard/settings/page.tsx` | 섹션 추가 |
| `mcp-server/` (전체 패키지) | 신규 생성 |
