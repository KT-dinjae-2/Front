# 성동 원플러스원 (Front)

성동구 원플러스원 기부·나눔 사업 앱 (Expo / React Native Web).
정적 배포(Vercel) 환경에서 서버 없이 동작하며, **AI 에이전트만** 서버리스 함수를 통해 실제 LLM(OpenAI)을 호출합니다.

## 로컬 실행

```bash
npm install
npx expo start        # 개발 서버
```

- 데이터는 기본적으로 앱 내장(mock)으로 동작합니다. `src/api/client.js` 의 `USE_MOCK` 로 전환합니다.
  - `true`  : 서버 없이 내장 데이터 (정적 배포·제출용, 기본값)
  - `false` : 로컬 Django 백엔드(`localhost:8000`) 연결

## AI 에이전트 (LLM) 구성

AI 에이전트는 클라이언트에서 `POST /api/agent` 로 질문을 보내고, **Vercel Serverless Function**([`api/agent.js`](api/agent.js))이
서버 측에서 `OPENAI_API_KEY` 를 읽어 OpenAI(`gpt-4o-mini`)를 호출합니다.
→ **API 키는 브라우저 번들에 절대 포함되지 않습니다.** (`EXPO_PUBLIC_` 접두사 사용 금지)

호출이 실패하거나(키 미설정·네트워크 오류) 웹이 아닌 환경이면 **규칙 기반 에이전트로 자동 폴백**하여 화면이 깨지지 않습니다.

### Vercel 환경변수 설정

1. Vercel 프로젝트 → **Settings → Environment Variables**
2. 다음 변수 추가:
   - **Key**: `OPENAI_API_KEY`
   - **Value**: 발급받은 OpenAI API 키 (`sk-...`)
   - **Environments**: Production / Preview / Development 모두 체크
3. **Save** 후 **재배포(Redeploy)** 하면 적용됩니다. (환경변수는 새 배포부터 반영)

> 이미 배포된 프로젝트라면 변수 추가 후 반드시 재배포해야 서버리스 함수가 새 값을 읽습니다.

### 로컬에서 LLM 까지 테스트하려면

서버리스 함수는 Expo 개발 서버가 아니라 Vercel 런타임에서 동작합니다. 로컬에서 함께 돌리려면:

```bash
cp .env.example .env          # .env 에 OPENAI_API_KEY 채우기 (.env 는 git 에 커밋되지 않음)
npm i -g vercel
vercel dev                    # 정적 앱 + /api/agent 함수 동시 구동
```

`vercel dev` 없이 `expo start` 만 쓰면 `/api/agent` 가 없어 규칙 기반 폴백으로 동작합니다.

## 배포 (Vercel)

- 빌드 설정은 [`vercel.json`](vercel.json) 에 고정되어 있습니다.
  - Build: `npx expo export --platform web` / Output: `dist`
  - `/api/*` 는 서버리스 함수로 처리되고, 그 외 경로는 SPA 라우팅을 위해 `index.html` 로 rewrite 됩니다.
- `OPENAI_API_KEY` 환경변수만 설정하면 AI 에이전트가 실제 LLM 으로 동작합니다.
