// Vercel Serverless Function — POST /api/agent
// 브라우저에서 { question, dongId } 를 받아 서버 측에서 OpenAI(gpt-4o-mini)를 호출한다.
// OPENAI_API_KEY 는 서버 환경변수에서만 읽으며 절대 클라이언트 번들에 포함되지 않는다.
//
// 응답: { answer, chart?, suggestions? }  (기존 AIAgentScreen 렌더링과 호환)
// 차트는 LLM 이 아니라 서버에서 질문 유형(키워드)에 따라 붙인다.

const data = require('../src/api/mockData.json');

const yearOf = (d) => parseInt(String(d).slice(0, 4), 10);
const monthOf = (d) => parseInt(String(d).slice(5, 7), 10);
const sum = (arr) => arr.reduce((a, r) => a + (r.amount || 0), 0);

// --- 동별 집계: { 동이름: { 기부액, 기부건수, 나눔액, 나눔건수, 집행률 } } ---
function aggregateByDong() {
  const nameById = {};
  const result = {};
  for (const dg of data.dongs) {
    nameById[dg.id] = dg.name;
    result[dg.name] = { 기부액: 0, 기부건수: 0, 나눔액: 0, 나눔건수: 0, 집행률: 0 };
  }
  for (const d of data.donations) {
    const n = nameById[d.dong_id];
    if (!n) continue;
    result[n].기부액 += d.amount || 0;
    result[n].기부건수 += 1;
  }
  for (const g of data.givings) {
    const n = nameById[g.dong_id];
    if (!n) continue;
    result[n].나눔액 += g.amount || 0;
    result[n].나눔건수 += 1;
  }
  for (const v of Object.values(result)) {
    // 집행률 = 나눔액 / 기부액 (소수 3자리 반올림, 기부액 0이면 0)
    v.집행률 = v.기부액 > 0 ? Math.round((v.나눔액 / v.기부액) * 1000) / 1000 : 0;
  }
  return result;
}

// --- 차트 데이터 (서버에서 질문 유형에 따라 부착) ---
function monthlyTrend(records) {
  const byYM = {};
  for (const r of records) {
    const y = yearOf(r.date);
    const m = monthOf(r.date);
    const k = y * 100 + m;
    if (!byYM[k]) byYM[k] = { y, m, amount: 0 };
    byYM[k].amount += r.amount || 0;
  }
  const keys = Object.keys(byYM).map(Number).sort((a, b) => a - b);
  const multiYear = new Set(keys.map((k) => Math.floor(k / 100))).size > 1;
  return keys.map((k) => {
    const { y, m, amount } = byYM[k];
    return { label: multiYear ? `${String(y).slice(2)}.${m}` : `${m}월`, value: amount };
  });
}

function dongRankingBar() {
  const nameById = {};
  data.dongs.forEach((d) => (nameById[d.id] = d.name));
  const sums = {};
  data.donations.forEach((d) => (sums[d.dong_id] = (sums[d.dong_id] || 0) + (d.amount || 0)));
  return Object.entries(sums)
    .map(([id, amt]) => ({ label: nameById[Number(id)] || id, value: amt }))
    .filter((x) => x.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
}

function dongStoresBar(dongId) {
  const nameById = {};
  data.stores.forEach((s) => (nameById[s.id] = s.name));
  const sums = {};
  data.donations
    .filter((d) => d.dong_id === dongId)
    .forEach((d) => (sums[d.store_id] = (sums[d.store_id] || 0) + (d.amount || 0)));
  return Object.entries(sums)
    .map(([sid, amt]) => ({ label: nameById[Number(sid)] || sid, value: amt }))
    .filter((x) => x.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
}

function buildChart(question, dongId) {
  const q = String(question || '');
  const has = (...ks) => ks.some((k) => q.includes(k));
  const isTrend = has('추세', '추이', '월별', '트렌드', '흐름', '변화');
  const isRank = has('많', '최다', '상위', '랭킹', '순위', '제일', '높', '가게', '업체');

  if (dongId !== undefined && dongId !== null && `${dongId}` !== '') {
    const id = Number(dongId);
    const dons = data.donations.filter((d) => d.dong_id === id);
    if (isTrend) return { type: 'line', title: '월별 기부 추이', data: monthlyTrend(dons) };
    if (isRank) return { type: 'bar', title: '가게별 기부금액', data: dongStoresBar(id) };
    return null;
  }
  if (isTrend) return { type: 'line', title: '월별 기부 추이', data: monthlyTrend(data.donations) };
  if (isRank) return { type: 'bar', title: '동별 기부금액', data: dongRankingBar() };
  return null;
}

function suggestionsFor(dongName) {
  return dongName
    ? [`${dongName} 총 기부 실적`, `${dongName} 월별 기부 추세`, `${dongName} 나눔 현황`, `${dongName} 기부 많은 가게`]
    : ['기부가 가장 많은 동은?', '월별 기부 추세 보여줘', '나눔 현황 알려줘', '참여 가게 수는?'];
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  // body 파싱 (Vercel 이 JSON 을 자동 파싱하지만 문자열로 올 수도 있어 방어)
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      body = {};
    }
  }
  body = body || {};
  const question = body.question || '';
  const dongId = body.dongId;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // 키 미설정 → 클라이언트가 규칙 기반으로 폴백하도록 에러 반환
    res.status(500).json({ error: 'OPENAI_API_KEY 가 설정되지 않았습니다.' });
    return;
  }

  const byDong = aggregateByDong();

  // 동 범위 제한 (동 담당자 진입 시)
  let dongName = null;
  if (dongId !== undefined && dongId !== null && `${dongId}` !== '') {
    const dg = data.dongs.find((d) => d.id === Number(dongId));
    if (dg) dongName = dg.name;
  }

  const systemPrompt = [
    '당신은 성동구 원플러스원 기부·나눔 사업의 데이터 분석 AI 에이전트입니다.',
    '아래 JSON 은 동별 집계 데이터입니다. 각 동에 대해 기부액, 기부건수, 나눔액, 나눔건수, 집행률(= 나눔액 / 기부액) 을 담고 있습니다.',
    '반드시 한국어로, 담당자에게 보고하듯 간결하고 친근하게 답하세요. 금액은 "원" 단위로 표기하세요.',
    '중요: 아래 데이터에 없는 내용은 절대 추측하거나 지어내지 말고, "해당 정보는 데이터에 없습니다" 라고 솔직하게 답하세요.',
    dongName
      ? `이 사용자는 '${dongName}' 동 담당자입니다. '${dongName}' 에 관한 질문에만 답하고, 다른 동이나 전체 현황을 물으면 "전체 관리자 화면에서 확인해 주세요" 라고 정중히 안내하세요.`
      : '',
    '데이터:',
    JSON.stringify(byDong),
  ]
    .filter(Boolean)
    .join('\n');

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.4,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: String(question) },
        ],
      }),
    });

    if (!openaiRes.ok) {
      const detail = await openaiRes.text();
      res.status(502).json({ error: 'OpenAI API 오류', detail: detail.slice(0, 300) });
      return;
    }

    const json = await openaiRes.json();
    const answer = (json.choices && json.choices[0] && json.choices[0].message && json.choices[0].message.content || '').trim();

    res.status(200).json({
      answer,
      chart: buildChart(question, dongId),
      suggestions: suggestionsFor(dongName),
      source: 'llm',
    });
  } catch (e) {
    res.status(502).json({ error: 'OpenAI 요청 실패', detail: String(e && e.message ? e.message : e) });
  }
};
