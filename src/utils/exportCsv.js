import { Alert, Platform } from 'react-native';

// 의존성 없이 CSV(엑셀에서 바로 열리는 형식)를 만들어 다운로드합니다.
// - 웹: Blob + 다운로드 링크로 파일 저장 (UTF-8 BOM 포함 → 엑셀 한글 정상 표시)
// - 네이티브: 별도 파일 시스템 모듈이 없어 안내만 표시 (정적 웹 배포가 주 대상)

const escapeCell = (v) => {
  const s = v === undefined || v === null ? '' : String(v);
  // 콤마·따옴표·줄바꿈이 있으면 따옴표로 감싸고 내부 따옴표는 두 개로
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

// rows: 2차원 배열([[헤더...], [행...], ...]), filename: 확장자 제외 이름
export function exportCsv(rows, filename = 'export') {
  const csv = rows.map((r) => r.map(escapeCell).join(',')).join('\r\n');

  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    const bom = '﻿'; // 엑셀에서 UTF-8 한글이 깨지지 않도록
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  }

  Alert.alert('엑셀 추출 안내', '엑셀(CSV) 내보내기는 웹(브라우저)에서 지원됩니다. 브라우저에서 열어 다시 시도해주세요.');
  return false;
}
