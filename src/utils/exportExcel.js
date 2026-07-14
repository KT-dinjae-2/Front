import * as XLSX from 'xlsx';
import { Alert, Platform } from 'react-native';

// 2차원 배열(rows)을 실제 .xlsx 파일로 내보낸다 (웹 브라우저 다운로드).
//   rows: [[헤더...], [행...], ...]
//   네이티브에는 파일시스템이 없어 안내만 표시 (정적 웹 배포가 주 대상)
export function exportExcel(rows, filename = 'export', sheetName = 'Sheet1') {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    Alert.alert('엑셀 추출 안내', '엑셀 내보내기는 웹(브라우저)에서 지원됩니다. 브라우저에서 열어 다시 시도해주세요.');
    return false;
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);
  // 열 너비: 동 이름 열(2번째)만 넉넉하게
  if (rows[0]) {
    ws['!cols'] = rows[0].map((_, i) => ({ wch: i === 1 ? 18 : 13 }));
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  // writeFile 이 브라우저에서 Blob 다운로드를 트리거한다.
  XLSX.writeFile(wb, `${filename}.xlsx`);
  return true;
}
