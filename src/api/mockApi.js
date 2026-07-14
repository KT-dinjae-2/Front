// ---------------------------------------------------------------------------
// 정적(서버 없는) 배포용 가짜 API 클라이언트
//
// Vercel 같은 정적 호스팅에는 Django 서버가 없으므로, 백엔드 DB를 통째로
// 내보낸 mockData.json 을 앱 안에서 직접 집계해 axios 와 동일한 형태
// ({ data }) 로 응답합니다. Django 의 각 View 집계 로직을 JS 로 그대로 옮긴
// 것이라 화면에 보이는 결과는 실서버와 동일합니다.
//
// 쓰기(기부/나눔 생성·수정·삭제)는 메모리에서만 반영되며, 새로고침하면
// 원본 데이터로 되돌아갑니다. (정적 배포에는 저장할 서버가 없기 때문)
// ---------------------------------------------------------------------------
import rawData from './mockData.json';

// 원본을 훼손하지 않도록 깊은 복사본을 메모리 상태로 사용
const db = {
  dongs: rawData.dongs.map((d) => ({ ...d })),
  stores: rawData.stores.map((s) => ({ ...s })),
  relations: rawData.relations.map((r) => ({ ...r })),
  donations: rawData.donations.map((d) => ({ ...d })),
  givings: rawData.givings.map((g) => ({ ...g })),
};

// 새로 생성되는 레코드용 ID (기존 최대값 이후부터)
let nextDonationId = db.donations.reduce((m, d) => Math.max(m, d.id), 0) + 1;
let nextGivingId = db.givings.reduce((m, g) => Math.max(m, g.id), 0) + 1;

// --- 유틸 ---------------------------------------------------------------
const yearOf = (dateStr) => parseInt(String(dateStr).slice(0, 4), 10);
const monthOf = (dateStr) => parseInt(String(dateStr).slice(5, 7), 10);

// year / month 쿼리 파라미터로 필터 (백엔드 로직과 동일: '전체' 또는 미입력 시 통과)
function applyDateFilter(records, params, dateKey) {
  let out = records;
  const yearParam = params?.year;
  const monthParam = params?.month;

  if (yearParam !== undefined && yearParam !== null && `${yearParam}` !== '' && `${yearParam}` !== '전체') {
    const y = parseInt(`${yearParam}`, 10);
    out = out.filter((r) => yearOf(r[dateKey]) === y);
  }
  if (monthParam !== undefined && monthParam !== null && `${monthParam}` !== '' && `${monthParam}` !== '전체') {
    const m = parseInt(`${monthParam}`.replace('월', ''), 10);
    out = out.filter((r) => monthOf(r[dateKey]) === m);
  }
  // 기간(start~end) 필터 — 'YYYY-MM-DD' 문자열 비교(사전순 = 날짜순)로 처리
  if (params?.start) out = out.filter((r) => r[dateKey] >= params.start);
  if (params?.end) out = out.filter((r) => r[dateKey] <= params.end);
  return out;
}

function aggregate(records) {
  let amount = 0;
  for (const r of records) amount += r.amount || 0;
  return { count: records.length, amount };
}

// "몇째주" 계산 (YYYY-MM-DD -> { year, month, week }) — 해당 월의 1일부터 7일 단위
function weekOfMonth(dateStr) {
  const [y, m, d] = String(dateStr).split('-').map(Number);
  return { year: y, month: m, week: Math.ceil(d / 7) };
}

// 월별 추이(연도 인식). 데이터가 여러 해에 걸치면 라벨에 연도를 붙여 시간순으로 정렬합니다.
function buildMonthlyTrend(records) {
  const byYM = {};
  for (const r of records) {
    const y = yearOf(r.date);
    const m = monthOf(r.date);
    const key = y * 100 + m;
    if (!byYM[key]) byYM[key] = { y, m, amount: 0 };
    byYM[key].amount += r.amount || 0;
  }
  const keys = Object.keys(byYM).map(Number).sort((a, b) => a - b);
  const multiYear = new Set(keys.map((k) => Math.floor(k / 100))).size > 1;
  return keys.map((k) => {
    const { y, m, amount } = byYM[k];
    return { label: multiYear ? `${String(y).slice(2)}.${m}` : `${m}월`, value: amount, year: y, month: m };
  });
}

const ok = (data) => Promise.resolve({ data, status: 200 });
const fail = (status, data) => Promise.reject({ response: { status, data }, message: `Mock API ${status}` });

// --- 엔드포인트 구현 ----------------------------------------------------

// GET /dongs/  →  [{ id, name }]
function getDongs() {
  return ok(db.dongs.map((d) => ({ id: d.id, name: d.name })));
}

// GET /dongs/:id/stores/  →  [{ id, name }] (이름순)
function getStoresByDong(dongId) {
  if (!db.dongs.some((d) => d.id === dongId)) return fail(404, { error: '해당 동(Dong)을 찾을 수 없습니다.' });
  const storeIds = db.relations.filter((r) => r.dong_id === dongId).map((r) => r.store_id);
  const stores = db.stores
    .filter((s) => storeIds.includes(s.id))
    .map((s) => ({ id: s.id, name: s.name }))
    .sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  return ok(stores);
}

// GET /dong/:id/totals/  →  { totals, stores }  (DongTotalView)
function getDongTotals(dongId, params) {
  const dong = db.dongs.find((d) => d.id === dongId);
  if (!dong) return fail(404, { error: '해당 동(Dong)을 찾을 수 없습니다.' });

  const storeIds = db.relations.filter((r) => r.dong_id === dongId).map((r) => r.store_id);
  const storesInDong = db.stores.filter((s) => storeIds.includes(s.id));

  const storesData = [];
  const totals = { totalDonationCount: 0, totalDonationAmount: 0, totalShareCount: 0, totalShareAmount: 0 };

  for (const store of storesInDong) {
    const donations = applyDateFilter(
      db.donations.filter((d) => d.dong_id === dongId && d.store_id === store.id), params, 'date');
    const givings = applyDateFilter(
      db.givings.filter((g) => g.dong_id === dongId && g.store_id === store.id), params, 'date');

    const dStat = aggregate(donations);
    const gStat = aggregate(givings);

    if (dStat.count > 0 || gStat.count > 0) {
      storesData.push({
        id: store.id,
        name: store.name,
        donationCount: dStat.count,
        donationAmount: dStat.amount,
        shareCount: gStat.count,
        shareAmount: gStat.amount,
      });
      totals.totalDonationCount += dStat.count;
      totals.totalDonationAmount += dStat.amount;
      totals.totalShareCount += gStat.count;
      totals.totalShareAmount += gStat.amount;
    }
  }

  return ok({ totals, stores: storesData });
}

// GET /dongs/totals/  →  { totals, dongs }  (AllDongTotalsView)
function getAllDongTotals(params) {
  const dongsData = [];
  const totals = { totalDonationCount: 0, totalDonationAmount: 0, totalShareCount: 0, totalShareAmount: 0 };

  for (const dong of [...db.dongs].sort((a, b) => a.id - b.id)) {
    const donations = applyDateFilter(db.donations.filter((d) => d.dong_id === dong.id), params, 'date');
    const givings = applyDateFilter(db.givings.filter((g) => g.dong_id === dong.id), params, 'date');

    const dStat = aggregate(donations);
    const gStat = aggregate(givings);

    if (dStat.count > 0 || gStat.count > 0) {
      dongsData.push({
        id: dong.id,
        name: dong.name,
        donationCount: dStat.count,
        donationAmount: dStat.amount,
        shareCount: gStat.count,
        shareAmount: gStat.amount,
      });
      totals.totalDonationCount += dStat.count;
      totals.totalDonationAmount += dStat.amount;
      totals.totalShareCount += gStat.count;
      totals.totalShareAmount += gStat.amount;
    }
  }

  return ok({ totals, dongs: dongsData });
}

// GET /store/:id/transactions/  →  [{ id, type, amount, date }] (최신순)
function getStoreTransactions(storeId) {
  if (!db.stores.some((s) => s.id === storeId)) return fail(404, { error: '해당 가게(Store)를 찾을 수 없습니다.' });

  const tx = [];
  for (const d of db.donations.filter((x) => x.store_id === storeId)) {
    tx.push({ id: `donation_${d.id}`, type: '기부', amount: d.amount, date: d.date });
  }
  for (const g of db.givings.filter((x) => x.store_id === storeId)) {
    tx.push({ id: `giving_${g.id}`, type: '나눔', amount: g.amount, date: g.date });
  }
  tx.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)); // 날짜 내림차순
  return ok(tx);
}

// GET /briefing/  →  { briefing, summary }  (OpenAI 대신 데이터 기반 문구 생성)
function getBriefing() {
  const dStat = aggregate(db.donations);
  const gStat = aggregate(db.givings);

  const dongRows = db.dongs.map((dong) => {
    const donation = aggregate(db.donations.filter((d) => d.dong_id === dong.id)).amount;
    const giving = aggregate(db.givings.filter((g) => g.dong_id === dong.id)).amount;
    return { name: dong.name, donation, giving };
  });
  dongRows.sort((a, b) => b.donation - a.donation);
  const top3 = dongRows.slice(0, 3);
  const activeDongs = dongRows.filter((d) => d.donation > 0 || d.giving > 0);
  const lowDongs = dongRows.filter((d) => d.donation === 0 && d.giving === 0).map((d) => d.name);
  const activeStoreIds = new Set(db.donations.map((d) => d.store_id));

  const summary = {
    총_기부_건수: dStat.count,
    총_기부_금액: dStat.amount,
    총_나눔_건수: gStat.count,
    총_나눔_금액: gStat.amount,
    활동_동_수: activeDongs.length,
    전체_동_수: dongRows.length,
    기부_참여_가게_수: activeStoreIds.size,
    기부금액_상위3동: top3,
    실적_없는_동: lowDongs,
  };

  const won = (n) => n.toLocaleString('ko-KR');
  const topNames = top3.map((d) => d.name).join(', ');
  const briefing =
    `현재까지 원플러스원 사업에는 총 ${summary.기부_참여_가게_수}개 가게가 참여해 ` +
    `${won(dStat.amount)}원(${dStat.count}건)의 기부가 모였고, ${won(gStat.amount)}원(${gStat.count}건)이 나눔으로 전달되었습니다. ` +
    `전체 ${summary.전체_동_수}개 동 중 ${summary.활동_동_수}개 동이 활동에 참여하고 있으며, ` +
    `기부 금액 기준 상위 동은 ${topNames} 순으로 나타났습니다. ` +
    (lowDongs.length > 0
      ? `아직 실적이 없는 ${lowDongs.join(', ')}에 대한 홍보를 강화하면 참여 동을 더 늘릴 수 있습니다.`
      : `모든 동이 사업에 참여하고 있어 고른 확산이 이루어지고 있습니다.`);

  return ok({ briefing, summary });
}

// GET /dong/:id/briefing/  →  특정 동에 대한 AI 브리핑 { briefing, summary }
function getDongBriefing(dongId) {
  const dong = db.dongs.find((d) => d.id === dongId);
  if (!dong) return fail(404, { error: '해당 동(Dong)을 찾을 수 없습니다.' });

  const donations = db.donations.filter((d) => d.dong_id === dongId);
  const givings = db.givings.filter((g) => g.dong_id === dongId);
  const dStat = aggregate(donations);
  const gStat = aggregate(givings);

  // 가게별 기부 금액 상위
  const storeIds = db.relations.filter((r) => r.dong_id === dongId).map((r) => r.store_id);
  const storeRows = storeIds
    .map((sid) => {
      const store = db.stores.find((s) => s.id === sid);
      const amt = aggregate(donations.filter((d) => d.store_id === sid)).amount;
      return { name: store ? store.name : `가게${sid}`, amount: amt };
    })
    .filter((r) => r.amount > 0)
    .sort((a, b) => b.amount - a.amount);
  const topStores = storeRows.slice(0, 3);
  const participatingStores = storeRows.length;

  // 월별 기부 추이 (가장 활발한 달)
  const byMonth = {};
  for (const d of donations) {
    const m = monthOf(d.date);
    byMonth[m] = (byMonth[m] || 0) + d.amount;
  }
  const monthEntries = Object.entries(byMonth).map(([m, amt]) => ({ month: Number(m), amount: amt }));
  monthEntries.sort((a, b) => b.amount - a.amount);
  const peakMonth = monthEntries[0];

  const remaining = dStat.amount - gStat.amount;

  const summary = {
    동_이름: dong.name,
    총_기부_건수: dStat.count,
    총_기부_금액: dStat.amount,
    총_나눔_건수: gStat.count,
    총_나눔_금액: gStat.amount,
    잔여_나눔_가능액: remaining,
    기부_참여_가게_수: participatingStores,
    기부금액_상위가게: topStores,
    최다_기부_월: peakMonth || null,
  };

  const won = (n) => (n || 0).toLocaleString('ko-KR');

  let briefing;
  if (dStat.count === 0 && gStat.count === 0) {
    briefing =
      `${dong.name}은(는) 아직 기부·나눔 실적이 없습니다. ` +
      `관내 가게를 대상으로 원플러스원 사업을 안내하고 참여를 독려하면 첫 실적을 만들 수 있습니다.`;
  } else {
    const topStoreNames = topStores.map((s) => s.name).join(', ');
    briefing =
      `${dong.name}에서는 총 ${participatingStores}개 가게가 참여해 ${won(dStat.amount)}원(${dStat.count}건)의 기부가 모였고, ` +
      `${won(gStat.amount)}원(${gStat.count}건)이 나눔으로 전달되었습니다. ` +
      (peakMonth ? `기부는 ${peakMonth.month}월에 ${won(peakMonth.amount)}원으로 가장 활발했습니다. ` : '') +
      (topStores.length > 0 ? `기부 금액 기준으로는 ${topStoreNames} 가게가 두드러집니다. ` : '') +
      (remaining > 0
        ? `현재 ${won(remaining)}원의 잔여 나눔 가능액이 있어, 도움이 필요한 이웃에게 나눔을 확대할 여력이 있습니다.`
        : `모인 기부금이 대부분 나눔으로 전달되어 선순환이 잘 이루어지고 있습니다.`);
  }

  return ok({ briefing, summary });
}

// GET /analytics/meta/  →  { availableYears, availableMonths, latestYear, latestYearMonth, minDate, maxDate }
function getAnalyticsMeta() {
  const dates = db.donations.map((d) => d.date).sort();
  const years = [...new Set(db.donations.map((d) => yearOf(d.date)))].sort((a, b) => a - b);

  const monthKeys = [...new Set(db.donations.map((d) => `${yearOf(d.date)}-${String(monthOf(d.date)).padStart(2, '0')}`))].sort();
  const availableMonths = monthKeys.map((k) => {
    const [y, m] = k.split('-').map(Number);
    return { year: y, month: m, label: `${y}.${m}` };
  });

  const maxDate = dates[dates.length - 1] || null;
  const minDate = dates[0] || null;
  const latestYear = maxDate ? yearOf(maxDate) : null;
  const latestYearMonth = maxDate ? { year: yearOf(maxDate), month: monthOf(maxDate) } : null;
  return ok({ availableYears: years, availableMonths, latestYear, latestYearMonth, minDate, maxDate });
}

// GET /analytics/donations/  →  동별 기부금액을 주/월/년 단위로 분석
//   params: period = 'week' | 'month' | 'year', year, start='YYYY-MM-DD', end='YYYY-MM-DD'
//   응답: { period, buckets:[{key,label}], dongs:[{id,name,total,byBucket}], bucketTotals, grandTotal, availableYears }
function getDonationAnalytics(params) {
  const period = params?.period || 'month';

  // 연도 + 기간(start/end) 필터를 공통 함수로 적용
  const donations = applyDateFilter(db.donations, params, 'date');

  // 날짜 -> 구간(bucket) 매핑
  const bucketOf = (dateStr) => {
    const y = yearOf(dateStr);
    const m = monthOf(dateStr);
    if (period === 'year') return { key: `${y}`, label: `${y}년`, sort: y };
    if (period === 'week') {
      const w = weekOfMonth(dateStr); // { year, month, week }
      return {
        key: `${w.year}-${String(w.month).padStart(2, '0')}-w${w.week}`,
        label: `${w.month}월 ${w.week}째주`,
        sort: w.year * 10000 + w.month * 100 + w.week,
      };
    }
    return { key: `${y}-${String(m).padStart(2, '0')}`, label: `${m}월`, sort: y * 100 + m };
  };

  // 데이터에 실제로 존재하는 구간만 수집 (정렬)
  const bucketMap = new Map();
  for (const d of donations) {
    const b = bucketOf(d.date);
    if (!bucketMap.has(b.key)) bucketMap.set(b.key, b);
  }
  const buckets = [...bucketMap.values()].sort((a, b) => a.sort - b.sort).map(({ key, label }) => ({ key, label }));

  // 동별 x 구간별 집계
  const dongIndex = new Map(db.dongs.map((d) => [d.id, { id: d.id, name: d.name, total: 0, byBucket: {} }]));
  const bucketTotals = {};
  let grandTotal = 0;
  for (const d of donations) {
    const row = dongIndex.get(d.dong_id);
    if (!row) continue;
    const { key } = bucketOf(d.date);
    row.byBucket[key] = (row.byBucket[key] || 0) + d.amount;
    row.total += d.amount;
    bucketTotals[key] = (bucketTotals[key] || 0) + d.amount;
    grandTotal += d.amount;
  }

  const dongs = [...dongIndex.values()]
    .filter((r) => r.total > 0)
    .sort((a, b) => b.total - a.total);

  const availableYears = [...new Set(db.donations.map((d) => yearOf(d.date)))].sort((a, b) => a - b);

  return ok({ period, buckets, dongs, bucketTotals, grandTotal, availableYears });
}

// 특정 동으로 범위가 제한된 에이전트 — 그 동의 데이터에만 접근/답변합니다.
function askAgentScoped(q, dong) {
  const won = (n) => (n || 0).toLocaleString('ko-KR');
  const has = (...ks) => ks.some((k) => q.includes(k));
  const donations = db.donations.filter((d) => d.dong_id === dong.id);
  const givings = db.givings.filter((g) => g.dong_id === dong.id);

  const SUGGEST = [`${dong.name} 총 기부 실적`, `${dong.name} 월별 기부 추세`, `${dong.name} 나눔 현황`, `${dong.name} 기부 많은 가게`];

  if (!q) {
    return ok({ answer: `${dong.name} 담당자님, 안녕하세요! ${dong.name}의 기부·나눔 현황, 월별 추세, 가게별 실적을 물어보세요.`, suggestions: SUGGEST });
  }

  // 다른 동/전체에 대한 질문은 접근 제한
  const otherDong = db.dongs.find((d) => d.id !== dong.id && q.includes(d.name));
  if (otherDong || has('전체 동', '모든 동', '다른 동', '동별 랭킹', '동 순위', '가장 많은 동', '최다 동', '전체 기부')) {
    return ok({
      answer: `죄송해요, 저는 ${dong.name}의 데이터에 대해서만 안내해 드릴 수 있어요. 다른 동이나 전체 현황은 전체 관리자 화면에서 확인해 주세요.`,
      suggestions: SUGGEST,
    });
  }

  // 월별 추세 (해당 동)
  if (has('추세', '추이', '트렌드', '월별', '흐름', '변화')) {
    const trend = buildMonthlyTrend(donations);
    if (!trend.length) return ok({ answer: `${dong.name}은(는) 아직 기부 데이터가 없습니다.`, suggestions: SUGGEST });
    const peak = trend.reduce((p, t) => (t.value > p.value ? t : p), trend[0]);
    return ok({
      answer: `${dong.name}의 월별 기부 추이입니다 — ${trend.map((t) => `${t.year}년 ${t.month}월 ${won(t.value)}원`).join(', ')}. 가장 활발했던 달은 ${peak.year}년 ${peak.month}월(${won(peak.value)}원)이에요.`,
      chart: { type: 'line', title: `${dong.name} 월별 기부 추이`, data: trend.map((t) => ({ label: t.label, value: t.value })) },
      suggestions: SUGGEST,
    });
  }

  // 가게별 (해당 동) — 상위/많은/랭킹 포함
  if (has('가게', '업체', '상점', '점포', '많', '최다', '상위', '랭킹', '순위', '제일', '높')) {
    const byStore = {};
    for (const d of donations) byStore[d.store_id] = (byStore[d.store_id] || 0) + d.amount;
    const rows = Object.entries(byStore)
      .map(([sid, amt]) => ({ name: (db.stores.find((s) => s.id === Number(sid)) || {}).name || sid, amt }))
      .sort((a, b) => b.amt - a.amt);
    if (!rows.length) return ok({ answer: `${dong.name}은(는) 아직 기부에 참여한 가게가 없습니다.`, suggestions: SUGGEST });
    const top = rows.slice(0, 3);
    return ok({
      answer: `${dong.name}에서 기부금액이 많은 가게는 ${top.map((t, i) => `${i + 1}위 ${t.name}(${won(t.amt)}원)`).join(', ')} 입니다.`,
      chart: { type: 'bar', title: `${dong.name} 가게별 기부금액`, data: rows.slice(0, 8).map((r) => ({ label: r.name, value: r.amt })) },
      suggestions: SUGGEST,
    });
  }

  // 나눔 (해당 동)
  if (has('나눔', '배분', '전달')) {
    const g = aggregate(givings);
    const d = aggregate(donations);
    return ok({
      answer: `${dong.name}의 나눔은 총 ${won(g.amount)}원(${g.count}건) 전달되었습니다. 기부금 ${won(d.amount)}원 대비 잔여 나눔 가능액은 ${won(d.amount - g.amount)}원입니다.`,
      suggestions: SUGGEST,
    });
  }

  // 총/요약/실적 (해당 동)
  if (has('총', '요약', '얼마', '현황', '실적', '알려', '몇', '기부')) {
    const d = aggregate(donations);
    const g = aggregate(givings);
    if (d.count === 0 && g.count === 0) return ok({ answer: `${dong.name}은(는) 아직 기부·나눔 실적이 없습니다.`, suggestions: SUGGEST });
    const stores = new Set(donations.map((x) => x.store_id)).size;
    return ok({
      answer: `${dong.name}의 실적 요약입니다. 기부 ${won(d.amount)}원(${d.count}건), 나눔 ${won(g.amount)}원(${g.count}건)이 이루어졌고, ${stores}개 가게가 참여했습니다.`,
      suggestions: SUGGEST,
    });
  }

  return ok({
    answer: `${dong.name}에 대해 이렇게 물어봐 주세요: "${dong.name} 총 기부 실적", "${dong.name} 월별 기부 추세", "${dong.name} 나눔 현황", "${dong.name} 기부 많은 가게".`,
    suggestions: SUGGEST,
  });
}

// GVTI 유형 -> 가게 카테고리 키워드 (가게명 기반 분류)
const GVTI_KEYWORDS = {
  C: ['미용', '헤어', '머리', '네일', '피부', '뷰티', '살롱', '에스테틱'], // 반짝이
  D: ['베이커리', '바게뜨', '바게트', '카페', '커피', '토스트', '빵', '제과', '디저트', '케이크', '도넛', '떡'], // 스마일
  A: ['슈퍼', '마트', '정육', '축산', '반찬', '드린찬', '대리점', '상회', '청과', '식자재', '할인마트'], // 든든이
  B: ['갈비', '국밥', '칼국수', '분식', '식당', '김밥', '순대', '반점', '치킨', '호프', '국수', '횟집', '낙지', '감자탕', '설렁탕', '아구찜', '아귀', '오리', '부대찌개', '회관', '도시락', '생고기', '숯불', '족발', '보쌈', '설농탕', '한우', '돼지', '냄비밥', '식탁'], // 함께
};

// 가게명 -> GVTI 유형 (C, D, A 우선 확인 후 B, 없으면 null)
function classifyStore(name) {
  for (const type of ['C', 'D', 'A', 'B']) {
    if (GVTI_KEYWORDS[type].some((kw) => name.includes(kw))) return type;
  }
  return null;
}

// GET /gvti/recommend/?type=A  →  { type, stores: [{ id, name, dong, donationAmount }] }
// GVTI 결과 유형에 맞는 "이런 가게는 어때요?" 실제 가게 추천 (참여 활발한 순)
function getGvtiRecommendations(type) {
  const t = String(type || '').toUpperCase();
  const dongOf = (storeId) => {
    const rel = db.relations.find((r) => r.store_id === storeId);
    return rel ? db.dongs.find((d) => d.id === rel.dong_id) : null;
  };
  const donationOf = (storeId) => aggregate(db.donations.filter((d) => d.store_id === storeId)).amount;

  const matched = db.stores
    .filter((s) => classifyStore(s.name) === t)
    .map((s) => {
      const dong = dongOf(s.id);
      return { id: s.id, name: s.name, dong: dong ? dong.name : '', dongId: dong ? dong.id : null, donationAmount: donationOf(s.id) };
    })
    // 기부 실적이 있는 가게 우선, 그다음 이름순
    .sort((a, b) => b.donationAmount - a.donationAmount || a.name.localeCompare(b.name, 'ko'));

  return ok({ type: t, stores: matched.slice(0, 4) });
}

// GET /agent/ask/?q=...&dongId=..  →  { answer, chart?, suggestions? }
// 정적 배포(서버·OpenAI 없음) 환경을 위한 데이터 기반 로컬 AI 에이전트.
// 질문을 키워드로 해석해 mockData 에서 직접 계산한 답변을 돌려줍니다.
// dongId 가 주어지면 그 동으로 범위가 제한됩니다.
function askAgent(question, dongId) {
  const q = String(question || '').trim();

  // 동 범위 제한 모드
  if (dongId !== undefined && dongId !== null && `${dongId}` !== '') {
    const dong = db.dongs.find((d) => d.id === Number(dongId));
    if (dong) return askAgentScoped(q, dong);
  }

  const won = (n) => (n || 0).toLocaleString('ko-KR');
  const has = (...ks) => ks.some((k) => q.includes(k));
  const dongAmt = (id) => aggregate(db.donations.filter((d) => d.dong_id === id)).amount;
  const dongGiv = (id) => aggregate(db.givings.filter((g) => g.dong_id === id)).amount;

  const SUGGEST = ['기부가 가장 많은 동은?', '월별 기부 추세 보여줘', '나눔 현황 알려줘', '참여 가게 수는?'];

  if (!q) {
    return ok({ answer: '안녕하세요! 성동 원플러스원 사업에 대해 무엇이든 물어보세요. 예: "기부가 가장 많은 동은?", "월별 기부 추세"', suggestions: SUGGEST });
  }

  // 1) 특정 동 언급
  const namedDong = db.dongs.find((d) => q.includes(d.name));
  if (namedDong) {
    const dA = aggregate(db.donations.filter((d) => d.dong_id === namedDong.id));
    const gA = aggregate(db.givings.filter((g) => g.dong_id === namedDong.id));
    if (dA.count === 0 && gA.count === 0) {
      return ok({ answer: `${namedDong.name}은(는) 아직 기부·나눔 실적이 없습니다. 관내 가게 대상 홍보가 필요합니다.`, suggestions: SUGGEST });
    }
    const ranking = db.dongs.map((d) => ({ id: d.id, amt: dongAmt(d.id) })).sort((a, b) => b.amt - a.amt);
    const rank = ranking.findIndex((r) => r.id === namedDong.id) + 1;
    return ok({
      answer: `${namedDong.name}의 기부는 ${won(dA.amount)}원(${dA.count}건), 나눔은 ${won(gA.amount)}원(${gA.count}건)입니다. 기부금액 기준 전체 ${rank}위입니다.`,
      suggestions: SUGGEST,
    });
  }

  // 2) 월별 추세/추이
  if (has('추세', '추이', '트렌드', '월별', '흐름', '변화')) {
    const trend = buildMonthlyTrend(db.donations);
    if (!trend.length) return ok({ answer: '아직 기부 데이터가 없습니다.', suggestions: SUGGEST });
    const peak = trend.reduce((p, t) => (t.value > p.value ? t : p), trend[0]);
    const seriesText = trend.map((t) => `${t.year}년 ${t.month}월 ${won(t.value)}원`).join(', ');
    return ok({
      answer: `월별 기부 추이입니다 — ${seriesText}. 가장 활발했던 달은 ${peak.year}년 ${peak.month}월(${won(peak.value)}원)이에요.`,
      chart: { type: 'line', title: '월별 기부 추이', data: trend.map((t) => ({ label: t.label, value: t.value })) },
      suggestions: SUGGEST,
    });
  }

  // 3) 랭킹 / 가장 많은 동
  if (has('많', '최다', '상위', '랭킹', '순위', 'top', '1위', '제일', '높')) {
    const ranking = db.dongs.map((d) => ({ name: d.name, amt: dongAmt(d.id) })).filter((r) => r.amt > 0).sort((a, b) => b.amt - a.amt);
    if (!ranking.length) return ok({ answer: '아직 기부 데이터가 없습니다.', suggestions: SUGGEST });
    const top = ranking.slice(0, 3);
    return ok({
      answer: `기부금액이 가장 많은 동은 ${top.map((t, i) => `${i + 1}위 ${t.name}(${won(t.amt)}원)`).join(', ')} 입니다.`,
      chart: { type: 'bar', title: '동별 기부금액 상위', data: ranking.slice(0, 8).map((r) => ({ label: r.name, value: r.amt })) },
      suggestions: SUGGEST,
    });
  }

  // 4) 적은/저조/실적 없는
  if (has('적', '최하', '저조', '없는', '부진', '하위', '낮')) {
    const ranking = db.dongs.map((d) => ({ name: d.name, amt: dongAmt(d.id), giv: dongGiv(d.id) })).sort((a, b) => a.amt - b.amt);
    const inactive = ranking.filter((r) => r.amt === 0 && r.giv === 0).map((r) => r.name);
    const low = ranking.filter((r) => r.amt > 0).slice(0, 3);
    let answer = '';
    if (inactive.length) answer += `아직 실적이 없는 동은 ${inactive.join(', ')} 입니다. `;
    if (low.length) answer += `기부금액이 가장 적은 동은 ${low.map((r) => `${r.name}(${won(r.amt)}원)`).join(', ')} 입니다.`;
    return ok({ answer: answer || '모든 동이 활발히 참여하고 있습니다.', suggestions: SUGGEST });
  }

  // 5) 나눔/배분
  if (has('나눔', '배분', '전달')) {
    const g = aggregate(db.givings);
    const d = aggregate(db.donations);
    return ok({
      answer: `지금까지 나눔은 총 ${won(g.amount)}원(${g.count}건) 전달되었습니다. 기부금 ${won(d.amount)}원 대비 잔여 나눔 가능액은 ${won(d.amount - g.amount)}원입니다.`,
      suggestions: SUGGEST,
    });
  }

  // 6) 가게/업체
  if (has('가게', '업체', '상점', '점포', '사장')) {
    const activeStores = new Set(db.donations.map((d) => d.store_id));
    const byStore = {};
    for (const d of db.donations) byStore[d.store_id] = (byStore[d.store_id] || 0) + d.amount;
    const top = Object.entries(byStore)
      .map(([sid, amt]) => ({ name: (db.stores.find((s) => s.id === Number(sid)) || {}).name || sid, amt }))
      .sort((a, b) => b.amt - a.amt)
      .slice(0, 3);
    return ok({
      answer: `기부에 참여한 가게는 총 ${activeStores.size}곳입니다. 기부금액 상위 가게는 ${top.map((t) => `${t.name}(${won(t.amt)}원)`).join(', ')} 입니다.`,
      suggestions: SUGGEST,
    });
  }

  // 7) 전체 요약
  if (has('총', '전체', '요약', '얼마', '현황', '실적', '알려', '몇')) {
    const d = aggregate(db.donations);
    const g = aggregate(db.givings);
    const active = db.dongs.filter((dd) => dongAmt(dd.id) > 0 || dongGiv(dd.id) > 0).length;
    const stores = new Set(db.donations.map((x) => x.store_id)).size;
    return ok({
      answer: `전체 실적 요약입니다. 기부 ${won(d.amount)}원(${d.count}건), 나눔 ${won(g.amount)}원(${g.count}건)이 이루어졌고, 전체 ${db.dongs.length}개 동 중 ${active}개 동, ${stores}개 가게가 참여하고 있습니다.`,
      suggestions: SUGGEST,
    });
  }

  // fallback
  return ok({
    answer: '질문을 정확히 이해하지 못했어요. 이렇게 물어봐 주세요: "기부가 가장 많은 동은?", "월별 기부 추세", "나눔 현황", "○○동 실적", "참여 가게 수".',
    suggestions: SUGGEST,
  });
}

// POST /donation/create/  (메모리 반영)
function createDonation(body) {
  const rec = {
    id: nextDonationId++,
    dong_id: body.dong,
    store_id: body.store,
    amount: parseInt(body.amount, 10) || 0,
    date: body.donation_date,
  };
  db.donations.push(rec);
  return Promise.resolve({
    data: { id: rec.id, amount: rec.amount, donation_date: rec.date,
      dong_code: `D${String(rec.dong_id).padStart(3, '0')}`, store_code: `S${String(rec.store_id).padStart(3, '0')}` },
    status: 201,
  });
}

// POST /giving/create/  (메모리 반영)
function createGiving(body) {
  const rec = {
    id: nextGivingId++,
    dong_id: body.dong,
    store_id: body.store,
    amount: parseInt(body.amount, 10) || 0,
    date: body.giving_date,
  };
  db.givings.push(rec);
  return Promise.resolve({
    data: { id: rec.id, amount: rec.amount, giving_date: rec.date,
      dong_code: `D${String(rec.dong_id).padStart(3, '0')}`, store_code: `S${String(rec.store_id).padStart(3, '0')}` },
    status: 201,
  });
}

// PATCH /giving/:id/  (메모리 반영)
function updateGiving(givingId, body) {
  const rec = db.givings.find((g) => g.id === givingId);
  if (!rec) return fail(404, { detail: 'Not found.' });
  if (body.amount !== undefined) rec.amount = parseInt(body.amount, 10) || 0;
  if (body.giving_date !== undefined) rec.date = body.giving_date;
  return ok({ id: rec.id, amount: rec.amount, giving_date: rec.date });
}

// DELETE /giving/:id/  (메모리 반영)
function deleteGiving(givingId) {
  const idx = db.givings.findIndex((g) => g.id === givingId);
  if (idx === -1) return fail(404, { detail: 'Not found.' });
  db.givings.splice(idx, 1);
  return Promise.resolve({ data: null, status: 204 });
}

// --- 라우팅 -------------------------------------------------------------
// 경로에서 쿼리스트링을 떼고, /api 접두사도 있으면 제거
function normalize(url) {
  let path = url.split('?')[0];
  if (path.startsWith('/api')) path = path.slice(4);
  if (!path.startsWith('/')) path = '/' + path;
  return path;
}

function get(url, config = {}) {
  const path = normalize(url);
  const params = config.params || {};
  let m;

  if (path === '/dongs/') return getDongs();
  if ((m = path.match(/^\/dongs\/(\d+)\/stores\/$/))) return getStoresByDong(parseInt(m[1], 10));
  if (path === '/dongs/totals/') return getAllDongTotals(params);
  if ((m = path.match(/^\/dong\/(\d+)\/totals\/$/))) return getDongTotals(parseInt(m[1], 10), params);
  if ((m = path.match(/^\/store\/(\d+)\/transactions\/$/))) return getStoreTransactions(parseInt(m[1], 10));
  if (path === '/briefing/') return getBriefing();
  if ((m = path.match(/^\/dong\/(\d+)\/briefing\/$/))) return getDongBriefing(parseInt(m[1], 10));
  if (path === '/analytics/donations/') return getDonationAnalytics(params);
  if (path === '/analytics/meta/') return getAnalyticsMeta();
  if (path === '/agent/ask/') return askAgent(params.q, params.dongId);
  if (path === '/gvti/recommend/') return getGvtiRecommendations(params.type);

  return fail(404, { error: `Mock API: 알 수 없는 GET 경로 ${path}` });
}

function post(url, body = {}) {
  const path = normalize(url);
  if (path === '/donation/create/') return createDonation(body);
  if (path === '/giving/create/') return createGiving(body);
  if (path === '/agent/ask/') return askAgent(body.question || body.q, body.dongId);
  return fail(404, { error: `Mock API: 알 수 없는 POST 경로 ${path}` });
}

function patch(url, body = {}) {
  const path = normalize(url);
  const m = path.match(/^\/giving\/(\d+)\/$/);
  if (m) return updateGiving(parseInt(m[1], 10), body);
  return fail(404, { error: `Mock API: 알 수 없는 PATCH 경로 ${path}` });
}

function del(url) {
  const path = normalize(url);
  const m = path.match(/^\/giving\/(\d+)\/$/);
  if (m) return deleteGiving(parseInt(m[1], 10));
  return fail(404, { error: `Mock API: 알 수 없는 DELETE 경로 ${path}` });
}

const mockApi = { get, post, patch, put: patch, delete: del };

export default mockApi;
