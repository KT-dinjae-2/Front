import { Alert, Platform } from 'react-native';

// 동별 기부금액 분석표를 PDF로 저장할 수 있도록, 인쇄용 HTML을 만들어
// 브라우저 인쇄 대화상자를 띄웁니다(웹). 사용자는 "PDF로 저장"을 고르면 됩니다.
// 네이티브(Expo Go 등)에서는 별도 인쇄 모듈이 없어 안내만 표시합니다.

const won = (n) => (n || 0).toLocaleString('ko-KR');
const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function buildReportHtml({ periodLabel, rangeLabel, buckets, dongs, bucketTotals, grandTotal, generatedAt }) {
  const headCells = buckets.map((b) => `<th class="num">${escapeHtml(b.label)}</th>`).join('');

  const bodyRows = dongs
    .map((d, i) => {
      const cells = buckets
        .map((b) => {
          const v = d.byBucket[b.key];
          return `<td class="num">${v ? won(v) : '<span class="dim">-</span>'}</td>`;
        })
        .join('');
      return `<tr><td class="rank">${i + 1}</td><td class="name">${escapeHtml(d.name)}</td>${cells}<td class="num rowtotal">${won(d.total)}</td></tr>`;
    })
    .join('');

  const footCells = buckets.map((b) => `<td class="num">${won(bucketTotals[b.key] || 0)}</td>`).join('');

  const wide = buckets.length > 8; // 구간이 많으면 가로(landscape)로 인쇄

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>동별 기부금액 분석 (${escapeHtml(periodLabel)})</title>
<style>
  @page { size: ${wide ? 'A4 landscape' : 'A4 portrait'}; margin: 14mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Apple SD Gothic Neo", "Malgun Gothic", Roboto, sans-serif; color: #1F2937; margin: 0; padding: 24px; }
  .header { border-bottom: 3px solid #1A237E; padding-bottom: 12px; margin-bottom: 20px; }
  .header h1 { font-size: 22px; color: #1A237E; margin: 0 0 6px; }
  .header .meta { font-size: 12px; color: #6B7280; }
  .summary { display: flex; gap: 16px; margin-bottom: 18px; flex-wrap: wrap; }
  .summary .box { background: #E8EAF6; border-radius: 10px; padding: 12px 18px; }
  .summary .box .label { font-size: 11px; color: #3949AB; margin-bottom: 4px; }
  .summary .box .value { font-size: 18px; font-weight: 700; color: #1A237E; }
  table { border-collapse: collapse; width: 100%; font-size: 12px; }
  th, td { border: 1px solid #D1D5DB; padding: 6px 8px; white-space: nowrap; }
  thead th { background: #1A237E; color: #fff; font-weight: 600; text-align: center; }
  th.num, td.num { text-align: right; }
  td.rank { text-align: center; color: #6B7280; width: 28px; }
  td.name { font-weight: 600; text-align: left; }
  td.rowtotal { font-weight: 700; color: #1A237E; background: #F5F6FF; }
  .dim { color: #C0C4CC; }
  tbody tr:nth-child(even) { background: #FAFAFC; }
  tfoot td { border-top: 2px solid #1A237E; font-weight: 700; background: #E8EAF6; color: #1A237E; }
  tfoot td.label { text-align: center; }
  .footer { margin-top: 16px; font-size: 11px; color: #9CA3AF; }
  @media print { body { padding: 0; } .no-print { display: none; } }
</style>
</head>
<body>
  <div class="header">
    <h1>성동 원플러스원 · 동별 기부금액 분석</h1>
    <div class="meta">분석 단위: ${escapeHtml(periodLabel)} · 기간: ${escapeHtml(rangeLabel || '전체 기간')} · 생성일시: ${escapeHtml(generatedAt)}</div>
  </div>
  <div class="summary">
    <div class="box"><div class="label">총 기부금액</div><div class="value">${won(grandTotal)}원</div></div>
    <div class="box"><div class="label">참여 동 수</div><div class="value">${dongs.length}개</div></div>
    <div class="box"><div class="label">분석 구간 수</div><div class="value">${buckets.length}개</div></div>
  </div>
  <table>
    <thead>
      <tr><th>순위</th><th style="text-align:left">동</th>${headCells}<th class="num">합계</th></tr>
    </thead>
    <tbody>
      ${bodyRows}
    </tbody>
    <tfoot>
      <tr><td class="label" colspan="2">합계</td>${footCells}<td class="num">${won(grandTotal)}</td></tr>
    </tfoot>
  </table>
  <div class="footer">본 자료는 성동 원플러스원 기부·나눔 데이터를 기반으로 자동 생성되었습니다.</div>
</body>
</html>`;
}

export function printReport(data) {
  const html = buildReportHtml(data);

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const win = window.open('', '_blank');
    if (!win) {
      // 팝업 차단 시: 현재 창에 iframe 을 만들어 인쇄
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);
      const doc = iframe.contentWindow.document;
      doc.open();
      doc.write(html);
      doc.close();
      iframe.contentWindow.focus();
      setTimeout(() => {
        iframe.contentWindow.print();
        setTimeout(() => document.body.removeChild(iframe), 1000);
      }, 400);
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    // 렌더 완료 후 인쇄 대화상자
    setTimeout(() => win.print(), 400);
    return;
  }

  // 네이티브 환경 안내 (정적 웹 배포가 주 대상)
  Alert.alert('PDF 저장 안내', 'PDF 내보내기는 웹(브라우저)에서 지원됩니다. 브라우저에서 열어 "PDF로 저장"을 이용해주세요.');
}
