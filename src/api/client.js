import axios from 'axios';
import { Platform } from 'react-native';
import mockApi from './mockApi';

// ---------------------------------------------------------------------------
// USE_MOCK 스위치
//   true  → 서버 없이 앱에 내장된 데이터로 동작 (Vercel 등 정적 배포·제출용)
//   false → 실제 Django 백엔드(localhost:8000)에 연결 (로컬 개발용)
//
// 정적 배포 제출 시에는 true 로 두세요. 로컬에서 서버를 켜고 실데이터로
// 개발할 때만 false 로 바꾸면 됩니다.
// ---------------------------------------------------------------------------
export const USE_MOCK = true;

// --- 로컬 백엔드(Django) 주소 설정 ---
// 상황에 따라 접속 주소가 다릅니다.
//  - 웹 브라우저 / iOS 시뮬레이터 : localhost
//  - 안드로이드 에뮬레이터        : 10.0.2.2 (에뮬레이터에서 호스트 PC를 가리키는 특수 주소)
//  - 실제 휴대폰(Expo Go)         : 아래 default 를 PC의 LAN IP로 바꿔주세요. 예) http://192.168.0.10:8000
const HOST = Platform.select({
  android: 'http://10.0.2.2:8000',
  default: 'http://localhost:8000',
});

export const API_BASE_URL = `${HOST}/api`;

const realApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// 기본 백엔드: 정적 배포면 mock, 로컬 개발이면 axios
const base = USE_MOCK ? mockApi : realApi;

// ---------------------------------------------------------------------------
// AI 에이전트만 실제 LLM 호출로 라우팅
//   /agent/ask/  ->  POST /api/agent (Vercel Serverless Function, OpenAI 호출)
//   그 외 경로   ->  기존 base(mock/실서버) 그대로
// 실패(키 미설정·네트워크·비웹 환경) 시 규칙 기반 mock 에이전트로 폴백해
// 화면이 깨지지 않게 한다.
// ---------------------------------------------------------------------------
async function callAgent(params = {}) {
  const question = params.q ?? params.question ?? '';
  const dongId = params.dongId;
  try {
    const resp = await fetch('/api/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, dongId }),
    });
    if (!resp.ok) throw new Error(`agent endpoint ${resp.status}`);
    const data = await resp.json();
    if (!data || !data.answer) throw new Error('empty answer');
    return { data: { ...data, source: data.source || 'llm' }, status: 200 };
  } catch (e) {
    // 폴백: 규칙 기반(mock) 에이전트
    const r = await mockApi.get('/agent/ask/', { params });
    return { data: { ...r.data, source: 'rule' }, status: r.status };
  }
}

const isAgentPath = (url) => typeof url === 'string' && url.split('?')[0].replace(/^\/api/, '').startsWith('/agent/ask/');

const api = {
  get: (url, config = {}) => (isAgentPath(url) ? callAgent(config.params || {}) : base.get(url, config)),
  post: (url, body, config) => base.post(url, body, config),
  patch: (url, body, config) => base.patch(url, body, config),
  put: (url, body, config) => base.put(url, body, config),
  delete: (url, config) => base.delete(url, config),
};

export default api;
