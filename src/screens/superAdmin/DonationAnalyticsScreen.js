import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Calendar } from 'react-native-calendars';

import api from '../../api/client';
import BackButton from '../../components/BackButton';
import { printReport } from '../../utils/printReport';

const PRIMARY_COLOR = '#1A237E';
const LIGHT_PRIMARY_COLOR = '#E8EAF6';

const PERIODS = [
  { key: 'week', label: '주별' },
  { key: 'month', label: '월별' },
  { key: 'year', label: '연도별' },
];
const PERIOD_LABEL = { week: '주별', month: '월별', year: '연도별' };

const formatNumber = (num) => (num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0');
const toISO = (date) => {
  const p = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
};
const labelDate = (date) => `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;

// 표 열 너비
const RANK_W = 40;
const NAME_W = 110;
const CELL_W = 92;
const TOTAL_W = 104;

const DonationAnalyticsScreen = ({ navigation }) => {
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);

  // 기간(날짜 범위) 선택
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [markedDates, setMarkedDates] = useState({});
  const [isPickerVisible, setPickerVisible] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { period };
      if (startDate && endDate) {
        params.start = toISO(startDate);
        params.end = toISO(endDate);
      }
      const res = await api.get('/analytics/donations/', { params });
      setReport(res.data);
    } catch (e) {
      console.error('분석 데이터 조회 실패:', e);
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [period, startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onDayPress = (day) => {
    const selected = new Date(day.timestamp);
    if (!startDate || (startDate && endDate)) {
      setStartDate(selected);
      setEndDate(null);
      setMarkedDates({ [day.dateString]: { startingDay: true, color: PRIMARY_COLOR, textColor: 'white' } });
    } else if (selected < startDate) {
      setStartDate(selected);
      setEndDate(null);
      setMarkedDates({ [day.dateString]: { startingDay: true, color: PRIMARY_COLOR, textColor: 'white' } });
    } else {
      setEndDate(selected);
      const marks = {};
      const cur = new Date(startDate);
      while (cur <= selected) {
        const ds = toISO(cur);
        marks[ds] = {
          color: LIGHT_PRIMARY_COLOR,
          textColor: 'black',
          startingDay: cur.getTime() === startDate.getTime(),
          endingDay: cur.getTime() === selected.getTime(),
        };
        cur.setDate(cur.getDate() + 1);
      }
      setMarkedDates(marks);
    }
  };

  const resetRange = () => {
    setStartDate(null);
    setEndDate(null);
    setMarkedDates({});
  };

  const rangeLabel = startDate && endDate ? `${labelDate(startDate)} ~ ${labelDate(endDate)}` : '전체 기간';

  const handleExportPdf = () => {
    if (!report) return;
    const now = new Date();
    const p = (n) => String(n).padStart(2, '0');
    const generatedAt = `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())} ${p(now.getHours())}:${p(now.getMinutes())}`;
    printReport({
      periodLabel: PERIOD_LABEL[period],
      rangeLabel,
      buckets: report.buckets,
      dongs: report.dongs,
      bucketTotals: report.bucketTotals,
      grandTotal: report.grandTotal,
      generatedAt,
    });
  };

  const buckets = report?.buckets || [];
  const dongs = report?.dongs || [];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 헤더 */}
      <View style={styles.header}>
        <BackButton navigation={navigation} color="#FFFFFF" />
        <Text style={styles.headerTitle}>동별 기부금액 분석</Text>
        <Text style={styles.headerSubtitle}>주 · 월 · 연도 단위로 동별 기부 실적을 분석합니다</Text>
      </View>

      {/* 기간 선택 토글 */}
      <View style={styles.segment}>
        {PERIODS.map((p) => {
          const active = p.key === period;
          return (
            <TouchableOpacity
              key={p.key}
              style={[styles.segmentItem, active && styles.segmentItemActive]}
              onPress={() => setPeriod(p.key)}
            >
              <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{p.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 날짜 범위 필터 */}
      <View style={styles.rangeRow}>
        <TouchableOpacity style={styles.rangeButton} onPress={() => setPickerVisible(true)}>
          <Text style={styles.rangeButtonText}>📅 {rangeLabel}</Text>
        </TouchableOpacity>
        {startDate && endDate ? (
          <TouchableOpacity style={styles.rangeReset} onPress={resetRange}>
            <Text style={styles.rangeResetText}>전체</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={PRIMARY_COLOR} style={{ marginTop: 40 }} />
      ) : !report || dongs.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>선택한 기간에 분석할 데이터가 없습니다.</Text>
        </View>
      ) : (
        <>
          {/* 요약 카드 */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>총 기부금액</Text>
              <Text style={styles.summaryValue}>{formatNumber(report.grandTotal)}원</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>참여 동</Text>
              <Text style={styles.summaryValue}>{dongs.length}개</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>구간 수</Text>
              <Text style={styles.summaryValue}>{buckets.length}개</Text>
            </View>
          </View>

          {/* 분석표 (가로 스크롤) */}
          <ScrollView style={styles.tableScrollV} contentContainerStyle={{ paddingBottom: 24 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator>
              <View>
                {/* 헤더 행 */}
                <View style={[styles.row, styles.headRow]}>
                  <Text style={[styles.cell, styles.headCell, { width: RANK_W }]}>순위</Text>
                  <Text style={[styles.cell, styles.headCell, styles.nameCell, { width: NAME_W, textAlign: 'left' }]}>동</Text>
                  {buckets.map((b) => (
                    <Text key={b.key} style={[styles.cell, styles.headCell, { width: CELL_W }]}>{b.label}</Text>
                  ))}
                  <Text style={[styles.cell, styles.headCell, { width: TOTAL_W }]}>합계</Text>
                </View>

                {/* 데이터 행 */}
                {dongs.map((d, i) => (
                  <View key={d.id} style={[styles.row, i % 2 === 1 && styles.rowAlt]}>
                    <Text style={[styles.cell, styles.rankCell, { width: RANK_W }]}>{i + 1}</Text>
                    <Text style={[styles.cell, styles.nameCell, { width: NAME_W }]} numberOfLines={1}>{d.name}</Text>
                    {buckets.map((b) => (
                      <Text key={b.key} style={[styles.cell, styles.numCell, { width: CELL_W }]}>
                        {d.byBucket[b.key] ? formatNumber(d.byBucket[b.key]) : <Text style={styles.dim}>-</Text>}
                      </Text>
                    ))}
                    <Text style={[styles.cell, styles.numCell, styles.rowTotal, { width: TOTAL_W }]}>{formatNumber(d.total)}</Text>
                  </View>
                ))}

                {/* 합계 행 */}
                <View style={[styles.row, styles.footRow]}>
                  <Text style={[styles.cell, styles.footCell, { width: RANK_W + NAME_W, textAlign: 'center' }]}>합계</Text>
                  {buckets.map((b) => (
                    <Text key={b.key} style={[styles.cell, styles.footCell, styles.numCell, { width: CELL_W }]}>
                      {formatNumber(report.bucketTotals[b.key] || 0)}
                    </Text>
                  ))}
                  <Text style={[styles.cell, styles.footCell, styles.numCell, { width: TOTAL_W }]}>{formatNumber(report.grandTotal)}</Text>
                </View>
              </View>
            </ScrollView>

            <Text style={styles.hint}>← 표를 좌우로 밀어 모든 구간을 확인하세요</Text>
          </ScrollView>
        </>
      )}

      {/* PDF 내보내기 */}
      <View style={styles.footerBar}>
        <TouchableOpacity
          style={[styles.pdfButton, (!report || dongs.length === 0) && styles.pdfButtonDisabled]}
          onPress={handleExportPdf}
          disabled={!report || dongs.length === 0}
        >
          <Text style={styles.pdfButtonText}>📄 PDF로 내보내기</Text>
        </TouchableOpacity>
      </View>

      {/* 날짜 범위 선택 모달 */}
      <Modal visible={isPickerVisible} transparent animationType="slide" onRequestClose={() => setPickerVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.calendarModalContent}>
            <Calendar onDayPress={onDayPress} markingType={'period'} markedDates={markedDates} />
            <View style={styles.calendarButtons}>
              <TouchableOpacity style={[styles.calBtn, styles.calBtnGhost]} onPress={resetRange}>
                <Text style={styles.calBtnGhostText}>전체 기간</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.calBtn} onPress={() => setPickerVisible(false)}>
                <Text style={styles.calBtnText}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F6F8' },
  header: {
    backgroundColor: PRIMARY_COLOR,
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    alignItems: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 6 },
  segment: {
    flexDirection: 'row',
    backgroundColor: '#E8EAF6',
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 4,
  },
  segmentItem: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: 'center' },
  segmentItemActive: { backgroundColor: PRIMARY_COLOR },
  segmentText: { fontSize: 15, fontWeight: '600', color: PRIMARY_COLOR },
  segmentTextActive: { color: '#FFFFFF' },
  rangeRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginTop: 10, marginBottom: 4 },
  rangeButton: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: '#D6D9E6' },
  rangeButtonText: { fontSize: 14, fontWeight: '600', color: PRIMARY_COLOR },
  rangeReset: { marginLeft: 8, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, backgroundColor: '#E8EAF6' },
  rangeResetText: { fontSize: 14, fontWeight: '600', color: PRIMARY_COLOR },
  summaryRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginTop: 12, marginBottom: 12 },
  summaryCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 8, alignItems: 'center', elevation: 2 },
  summaryLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  summaryValue: { fontSize: 15, fontWeight: 'bold', color: PRIMARY_COLOR },
  tableScrollV: { flex: 1, paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'stretch' },
  rowAlt: { backgroundColor: '#FAFAFC' },
  headRow: { backgroundColor: PRIMARY_COLOR, borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  footRow: { backgroundColor: '#E8EAF6', borderBottomLeftRadius: 8, borderBottomRightRadius: 8 },
  cell: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 13,
    color: '#1F2937',
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    textAlign: 'right',
  },
  headCell: { color: '#FFFFFF', fontWeight: '700', textAlign: 'center', borderColor: 'rgba(255,255,255,0.25)' },
  rankCell: { textAlign: 'center', color: '#6B7280' },
  nameCell: { textAlign: 'left', fontWeight: '600' },
  numCell: { textAlign: 'right' },
  rowTotal: { fontWeight: '700', color: PRIMARY_COLOR, backgroundColor: '#F5F6FF' },
  footCell: { fontWeight: '700', color: PRIMARY_COLOR },
  dim: { color: '#C0C4CC' },
  hint: { fontSize: 11, color: '#9CA3AF', textAlign: 'center', marginTop: 10 },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 15, color: '#6B7280' },
  footerBar: { padding: 16, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#EEE' },
  pdfButton: { backgroundColor: PRIMARY_COLOR, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  pdfButtonDisabled: { backgroundColor: '#B0B4C4' },
  pdfButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  calendarModalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 8, paddingBottom: 30 },
  calendarButtons: { flexDirection: 'row', gap: 12, marginTop: 12, marginHorizontal: 20 },
  calBtn: { flex: 1, backgroundColor: PRIMARY_COLOR, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  calBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  calBtnGhost: { backgroundColor: '#E8EAF6' },
  calBtnGhostText: { color: PRIMARY_COLOR, fontSize: 16, fontWeight: 'bold' },
});

export default DonationAnalyticsScreen;
