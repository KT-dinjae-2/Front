import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
// import * as XLSX from 'xlsx';
import { Calendar } from 'react-native-calendars';

// 백엔드 API 클라이언트
import api from '../../api/client';
import BackButton from '../../components/BackButton';
import BarChart from '../../components/BarChart';
import LineChart from '../../components/LineChart';
import { exportExcel } from '../../utils/exportExcel';

const CHART_WIDTH = Math.min(Dimensions.get('window').width - 72, 520);

const PRIMARY_COLOR = '#1A237E';
const LIGHT_PRIMARY_COLOR = '#E8EAF6';

const formatNumber = (num) => {
  if (num === undefined || num === null) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const toISODate = (date) => {
  const p = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
};
const labelDay = (date) => `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;

const RANK_MODES = [
  { key: 'all', label: '전체' },
  { key: 'year', label: '연도별' },
  { key: 'month', label: '월별' },
  { key: 'range', label: '기간 선택' },
];

// 동 목록 정렬 옵션
const SORT_OPTIONS = [
  { key: 'donationAmount_desc', label: '기부액 많은순', compare: (a, b) => b.donationAmount - a.donationAmount },
  { key: 'donationAmount_asc', label: '기부액 적은순', compare: (a, b) => a.donationAmount - b.donationAmount },
  { key: 'shareAmount_desc', label: '나눔액 많은순', compare: (a, b) => b.shareAmount - a.shareAmount },
  { key: 'donationCount_desc', label: '기부건수 많은순', compare: (a, b) => b.donationCount - a.donationCount },
  { key: 'name_asc', label: '가나다순', compare: (a, b) => a.name.localeCompare(b.name, 'ko') },
];

const DongCard = ({ item, onPress }) => (
  <View style={styles.card}>
    <Text style={styles.dongName}>{item.name}</Text>
    <View style={styles.statsGrid}>
        <View style={styles.statItem}><Text style={styles.statLabel}>기부건수</Text><Text style={styles.statValue}>{item.donationCount}건</Text></View>
        <View style={styles.statItem}><Text style={styles.statLabel}>나눔건수</Text><Text style={styles.statValue}>{item.shareCount}건</Text></View>
        <View style={styles.statItem}><Text style={styles.statLabel}>기부 금액</Text><Text style={styles.statValue}>{formatNumber(item.donationAmount)}원</Text></View>
        <View style={styles.statItem}><Text style={styles.statLabel}>나눔 금액</Text><Text style={styles.statValue}>{formatNumber(item.shareAmount)}원</Text></View>
    </View>
    <TouchableOpacity style={styles.detailButton} onPress={() => onPress(item)}>
      <Text style={styles.detailButtonText}>업체별 기부 내역 보기</Text>
    </TouchableOpacity>
  </View>
);

const getRankIcon = (rank) => {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `${rank}`;
};

const RankingModal = ({ visible, onClose }) => {
  const [mode, setMode] = useState('all');
  const [meta, setMeta] = useState({ availableYears: [], availableMonths: [] });
  const [selYear, setSelYear] = useState(null);
  const [selMonth, setSelMonth] = useState(null); // { year, month }
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);
  const [markedDates, setMarkedDates] = useState({});
  const [calVisible, setCalVisible] = useState(false);
  const [rows, setRows] = useState([]);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(false);

  // 모달이 열릴 때 메타(연/월 목록) 로드
  useEffect(() => {
    if (!visible) return;
    (async () => {
      try {
        const res = await api.get('/analytics/meta/');
        setMeta(res.data);
        if (selYear == null && res.data.latestYear) setSelYear(res.data.latestYear);
        if (selMonth == null && res.data.latestYearMonth) setSelMonth(res.data.latestYearMonth);
      } catch (e) {
        // 무시
      }
    })();
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const buildParams = () => {
    if (mode === 'year' && selYear) return { year: selYear };
    if (mode === 'month' && selMonth) return { year: selMonth.year, month: selMonth.month };
    if (mode === 'range' && rangeStart && rangeEnd) return { start: toISODate(rangeStart), end: toISODate(rangeEnd) };
    return {};
  };

  const fetchRanking = async () => {
    setLoading(true);
    try {
      const params = buildParams();
      const [rk, tr] = await Promise.all([
        api.get('/dongs/totals/', { params }),
        api.get('/analytics/donations/', { params: { ...params, period: 'month' } }),
      ]);
      const sorted = [...(rk.data.dongs || [])].sort((a, b) => b.donationAmount - a.donationAmount);
      setRows(sorted);
      const tb = tr.data;
      setTrend((tb.buckets || []).map((b) => ({ label: b.label, value: tb.bucketTotals[b.key] || 0 })));
    } catch (e) {
      setRows([]);
      setTrend([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) fetchRanking();
  }, [visible, mode, selYear, selMonth, rangeStart, rangeEnd]); // eslint-disable-line react-hooks/exhaustive-deps

  const onDayPress = (day) => {
    const selected = new Date(day.timestamp);
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(selected);
      setRangeEnd(null);
      setMarkedDates({ [day.dateString]: { startingDay: true, color: PRIMARY_COLOR, textColor: 'white' } });
    } else if (selected < rangeStart) {
      setRangeStart(selected);
      setRangeEnd(null);
      setMarkedDates({ [day.dateString]: { startingDay: true, color: PRIMARY_COLOR, textColor: 'white' } });
    } else {
      setRangeEnd(selected);
      const marks = {};
      const cur = new Date(rangeStart);
      while (cur <= selected) {
        const ds = toISODate(cur);
        marks[ds] = {
          color: LIGHT_PRIMARY_COLOR, textColor: 'black',
          startingDay: cur.getTime() === rangeStart.getTime(),
          endingDay: cur.getTime() === selected.getTime(),
        };
        cur.setDate(cur.getDate() + 1);
      }
      setMarkedDates(marks);
      setCalVisible(false);
    }
  };

  // 현재 선택 상태를 설명하는 라벨
  let periodLabel = '전체 기간';
  if (mode === 'year' && selYear) periodLabel = `${selYear}년`;
  else if (mode === 'month' && selMonth) periodLabel = `${selMonth.year}년 ${selMonth.month}월`;
  else if (mode === 'range') periodLabel = rangeStart && rangeEnd ? `${labelDay(rangeStart)} ~ ${labelDay(rangeEnd)}` : '기간을 선택하세요';

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={[styles.modalOverlay, { justifyContent: 'center' }]}>
        <View style={styles.rankingModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🏆 기부 금액 랭킹</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalCloseButton}>닫기</Text>
            </TouchableOpacity>
          </View>

          {/* 기간 모드 탭 */}
          <View style={styles.rankModeRow}>
            {RANK_MODES.map((m) => {
              const active = m.key === mode;
              return (
                <TouchableOpacity
                  key={m.key}
                  style={[styles.rankModeItem, active && styles.rankModeItemActive]}
                  onPress={() => {
                    setMode(m.key);
                    if (m.key === 'range') setCalVisible(true);
                  }}
                >
                  <Text style={[styles.rankModeText, active && styles.rankModeTextActive]}>{m.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 연도 선택 */}
          {mode === 'year' && (
            <View style={styles.chipWrap}>
              {meta.availableYears.map((y) => (
                <TouchableOpacity key={y} style={[styles.chip, selYear === y && styles.chipActive]} onPress={() => setSelYear(y)}>
                  <Text style={[styles.chipText, selYear === y && styles.chipTextActive]}>{y}년</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* 월 선택 */}
          {mode === 'month' && (
            <View style={styles.chipWrap}>
              {meta.availableMonths.map((mm) => {
                const active = selMonth && selMonth.year === mm.year && selMonth.month === mm.month;
                return (
                  <TouchableOpacity key={mm.label} style={[styles.chip, active && styles.chipActive]} onPress={() => setSelMonth({ year: mm.year, month: mm.month })}>
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{mm.year}.{mm.month}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* 기간 선택 버튼 */}
          {mode === 'range' && (
            <TouchableOpacity style={styles.rangePickBtn} onPress={() => setCalVisible(true)}>
              <Text style={styles.rangePickBtnText}>📅 {periodLabel}</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.rankPeriodLabel}>{periodLabel} 기준</Text>

          {loading ? (
            <ActivityIndicator color={PRIMARY_COLOR} style={{ paddingVertical: 40 }} />
          ) : rows.length === 0 ? (
            <Text style={styles.rankEmpty}>해당 기간에 기부 실적이 없습니다.</Text>
          ) : (
            <ScrollView style={{ flexGrow: 0 }} contentContainerStyle={{ paddingBottom: 12 }}>
              {rows.map((item, index) => (
                <View key={item.id} style={styles.rankItem}>
                  <Text style={styles.rankNumber}>{getRankIcon(index + 1)}</Text>
                  <Text style={styles.rankName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.rankAmount}>{formatNumber(item.donationAmount)}원</Text>
                </View>
              ))}

              {/* 막대 그래프: 동별 기부금액 */}
              <View style={styles.chartBlock}>
                <Text style={styles.chartTitle}>📊 동별 기부금액</Text>
                <BarChart
                  data={rows.map((r) => ({ label: r.name, value: r.donationAmount }))}
                  valueFormatter={(v) => `${formatNumber(v)}원`}
                  maxItems={10}
                />
              </View>

              {/* 선 그래프: 월별 기부 추이 */}
              {trend.length > 1 ? (
                <View style={styles.chartBlock}>
                  <Text style={styles.chartTitle}>📈 월별 기부 추이</Text>
                  <LineChart data={trend} width={CHART_WIDTH} valueFormatter={(v) => `${formatNumber(v)}원`} />
                </View>
              ) : null}
            </ScrollView>
          )}
        </View>
      </View>

      {/* 기간 선택 캘린더 */}
      <Modal visible={calVisible} transparent animationType="slide" onRequestClose={() => setCalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.calendarModalContent}>
            <Calendar onDayPress={onDayPress} markingType={'period'} markedDates={markedDates} />
            <TouchableOpacity style={styles.modalConfirmButton} onPress={() => setCalVisible(false)}>
              <Text style={styles.modalConfirmButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};


const SuperAdminDashboardScreen = ({ navigation }) => {
  const [totals, setTotals] = useState({});
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [markedDates, setMarkedDates] = useState({});
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [isRankingVisible, setRankingVisible] = useState(false);
  const [sortKey, setSortKey] = useState('donationAmount_desc');

  // 스크롤 시 상단 통계 박스가 접히는 헤더
  const scrollY = useRef(new Animated.Value(0)).current;
  const [statBlockHeight, setStatBlockHeight] = useState(0);
  const [headerMaxHeight, setHeaderMaxHeight] = useState(0);
  const COMPACT_H = 44;

  const formatDate = (date) => date.toISOString().split('T')[0];

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const fetchData = async () => {
    setLoading(true);

    // 날짜를 선택한 경우, 시작일 기준으로 연도/월 필터를 적용합니다.
    const params = {};
    if (startDate && endDate) {
      params.year = startDate.getFullYear();
      params.month = startDate.getMonth() + 1;
    }

    try {
      const response = await api.get('/dongs/totals/', { params });
      setData(response.data.dongs || []);
      setTotals(response.data.totals || {});
    } catch (e) {
      console.error('전체 대시보드 데이터 조회 실패:', e);
      Alert.alert('오류', '데이터를 불러오지 못했습니다. 서버가 실행 중인지 확인해주세요.');
      setData([]);
      setTotals({});
    } finally {
      setLoading(false);
    }
  };

  const onDayPress = (day) => {
    const selectedDay = new Date(day.timestamp);
    if (!startDate || (startDate && endDate)) {
      setStartDate(selectedDay);
      setEndDate(null);
      setMarkedDates({ [day.dateString]: { startingDay: true, color: PRIMARY_COLOR, textColor: 'white' } });
    } else {
      if (selectedDay < startDate) {
        setStartDate(selectedDay);
        setEndDate(null);
        setMarkedDates({ [day.dateString]: { startingDay: true, color: PRIMARY_COLOR, textColor: 'white' } });
      } else {
        setEndDate(selectedDay);
        let newMarkedDates = {};
        let currentDate = new Date(startDate);
        while (currentDate <= selectedDay) {
            const dateString = formatDate(currentDate);
            newMarkedDates[dateString] = {
                color: LIGHT_PRIMARY_COLOR, textColor: 'black',
                startingDay: currentDate.getTime() === startDate.getTime(),
                endingDay: currentDate.getTime() === selectedDay.getTime(),
            };
            currentDate.setDate(currentDate.getDate() + 1);
        }
        setMarkedDates(newMarkedDates);
      }
    }
  };

  const handleExcelExport = () => {
    const sorted = [...data].sort((SORT_OPTIONS.find((o) => o.key === sortKey) || SORT_OPTIONS[0]).compare);
    if (sorted.length === 0) {
      Alert.alert('알림', '추출할 데이터가 없습니다.');
      return;
    }

    const rows = [['순위', '동', '기부건수', '기부금액', '나눔건수', '나눔금액']];
    sorted.forEach((d, i) => {
      rows.push([i + 1, d.name, d.donationCount, d.donationAmount, d.shareCount, d.shareAmount]);
    });
    // 합계 행
    rows.push([
      '합계', '',
      totals.totalDonationCount || 0,
      totals.totalDonationAmount || 0,
      totals.totalShareCount || 0,
      totals.totalShareAmount || 0,
    ]);

    const periodTag = startDate && endDate
      ? `${startDate.getFullYear()}-${startDate.getMonth() + 1}`
      : '전체';
    exportExcel(rows, `성동_원플러스원_동별기부내역_${periodTag}`, '동별기부내역');
  };
  const handleCardPress = (dong) => { navigation.navigate('DongDashboard', { dongName: dong.name, dongId: dong.id }); };
  
  const formatDateForButton = (date) => `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
  let dateRangeButtonText = '날짜 선택';
  if (startDate && !endDate) {
    dateRangeButtonText = `${formatDateForButton(startDate)} ~`;
  } else if (startDate && endDate) {
    dateRangeButtonText = `${formatDateForButton(startDate)} ~ ${formatDateForButton(endDate)}`;
  }

  // --- 스크롤에 따른 헤더 접힘 애니메이션 ---
  const COLLAPSE_DISTANCE = statBlockHeight > 0 ? Math.max(statBlockHeight - COMPACT_H, 1) : 120;
  const statAnimatedHeight = statBlockHeight
    ? scrollY.interpolate({ inputRange: [0, COLLAPSE_DISTANCE], outputRange: [statBlockHeight, 0], extrapolate: 'clamp' })
    : undefined;
  const compactAnimatedHeight = scrollY.interpolate({ inputRange: [0, COLLAPSE_DISTANCE], outputRange: [0, COMPACT_H], extrapolate: 'clamp' });
  const expandedOpacity = scrollY.interpolate({ inputRange: [0, COLLAPSE_DISTANCE * 0.5], outputRange: [1, 0], extrapolate: 'clamp' });
  const compactOpacity = scrollY.interpolate({ inputRange: [COLLAPSE_DISTANCE * 0.5, COLLAPSE_DISTANCE], outputRange: [0, 1], extrapolate: 'clamp' });
  const titleFontSize = scrollY.interpolate({ inputRange: [0, COLLAPSE_DISTANCE], outputRange: [28, 22], extrapolate: 'clamp' });

  const onStatLayout = (e) => {
    const h = e.nativeEvent.layout.height;
    if (h && Math.abs(h - statBlockHeight) > 1) setStatBlockHeight(h);
  };
  const onHeaderLayout = (e) => {
    // 펼쳐진(스크롤 0) 상태의 전체 헤더 높이를 리스트 상단 여백으로 사용
    const h = e.nativeEvent.layout.height;
    if (h && h > headerMaxHeight) setHeaderMaxHeight(h);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: (headerMaxHeight || 300) + 40 }} color={PRIMARY_COLOR}/>
      ) : (
        <Animated.FlatList
          style={{ flex: 1 }}
          data={[...data].sort((SORT_OPTIONS.find((o) => o.key === sortKey) || SORT_OPTIONS[0]).compare)}
          renderItem={({ item }) => <DongCard item={item} onPress={handleCardPress} />}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          contentContainerStyle={{ paddingTop: (headerMaxHeight || 300) + 12, paddingBottom: 40 }}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          ListHeaderComponent={
            data.length > 0 ? (
              <View style={styles.sortBar}>
                <Text style={styles.sortBarTitle}>정렬</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortChips}>
                  {SORT_OPTIONS.map((o) => {
                    const active = o.key === sortKey;
                    return (
                      <TouchableOpacity key={o.key} style={[styles.sortChip, active && styles.sortChipActive]} onPress={() => setSortKey(o.key)}>
                        <Text style={[styles.sortChipText, active && styles.sortChipTextActive]}>{o.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            ) : null
          }
          ListFooterComponent={
            <TouchableOpacity style={styles.excelButton} onPress={handleExcelExport}>
              <Text style={styles.excelButtonText}>엑셀 파일 추출</Text>
            </TouchableOpacity>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>조회된 데이터가 없습니다.</Text>
            </View>
          }
        />
      )}

      {/* 리스트 위에 떠 있는 헤더 (스크롤하면 상단 통계가 접힘) */}
      <Animated.View style={styles.headerWrapper} onLayout={onHeaderLayout}>
        <View style={styles.headerContent}>
          <Animated.Text style={[styles.title, { fontSize: titleFontSize }]}>전체 기부 내역</Animated.Text>

          {/* 펼침: 큰 통계 박스 (스크롤 시 높이 0으로 접힘) */}
          <Animated.View style={[styles.statCollapsible, { opacity: expandedOpacity }, statBlockHeight ? { height: statAnimatedHeight } : null]}>
            <View onLayout={onStatLayout} style={styles.totalStatsContainer}>
              <View style={styles.totalStatBox}>
                <Text style={styles.totalStatLabel}>총 기부 건수</Text>
                <Text style={styles.totalStatValue}>{totals.totalDonationCount || 0}</Text>
              </View>
              <View style={styles.totalStatBox}>
                <Text style={styles.totalStatLabel}>총 기부 금액</Text>
                <Text style={styles.totalStatValue}>{formatNumber(totals.totalDonationAmount)}</Text>
              </View>
              <View style={styles.totalStatBox}>
                <Text style={styles.totalStatLabel}>총 나눔 건수</Text>
                <Text style={styles.totalStatValue}>{totals.totalShareCount || 0}</Text>
              </View>
              <View style={styles.totalStatBox}>
                <Text style={styles.totalStatLabel}>총 나눔 금액</Text>
                <Text style={styles.totalStatValue}>{formatNumber(totals.totalShareAmount)}</Text>
              </View>
            </View>
          </Animated.View>

          {/* 접힘: 작은 요약 (스크롤 시 나타남) */}
          <Animated.View style={[styles.compactCollapsible, { opacity: compactOpacity, height: compactAnimatedHeight }]}>
            <View style={styles.compactSummary}>
              <View style={styles.compactCol}>
                <Text style={styles.compactLabel}>기부</Text>
                <Text style={styles.compactValue}>{totals.totalDonationCount || 0}건 · {formatNumber(totals.totalDonationAmount)}원</Text>
              </View>
              <View style={styles.compactDivider} />
              <View style={styles.compactCol}>
                <Text style={styles.compactLabel}>나눔</Text>
                <Text style={styles.compactValue}>{totals.totalShareCount || 0}건 · {formatNumber(totals.totalShareAmount)}원</Text>
              </View>
            </View>
          </Animated.View>
        </View>

        <View style={styles.filterContainer}>
            <TouchableOpacity style={styles.dateRangeButton} onPress={() => setPickerVisible(true)}>
                <Text style={styles.dateRangeText}>{dateRangeButtonText}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.rankingButton} onPress={() => setRankingVisible(true)}>
                <Text style={styles.rankingButtonText}>🏆 랭킹 보기</Text>
            </TouchableOpacity>
        </View>
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.briefingButton, styles.actionHalf]} onPress={() => navigation.navigate('AIAgent')}>
              <Text style={styles.briefingButtonText}>🤖 AI 에이전트</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.briefingButton, styles.actionHalf]} onPress={() => navigation.navigate('DonationAnalytics')}>
              <Text style={styles.briefingButtonText}>📊 기부금액 분석</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* 이전 화면으로 돌아가기 (헤더 위에 떠 있음) */}
      <BackButton navigation={navigation} color="#FFFFFF" />

      {/* isPickerVisible이 true일 때 이 모달이 나타납니다. */}
      <Modal visible={isPickerVisible} transparent={true} animationType="slide" onRequestClose={() => setPickerVisible(false)}>
        <View style={styles.modalOverlay}>
            <View style={styles.calendarModalContent}>
                <Calendar
                    onDayPress={onDayPress}
                    markingType={'period'}
                    markedDates={markedDates}
                />
                <TouchableOpacity style={styles.modalConfirmButton} onPress={() => setPickerVisible(false)}>
                    <Text style={styles.modalConfirmButtonText}>확인</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>

      <RankingModal
        visible={isRankingVisible}
        onClose={() => setRankingVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F6F8' },
  headerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: PRIMARY_COLOR,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  headerContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  logo: { width: 40, height: 40, resizeMode: 'contain', marginBottom: 12 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 16 },
  statCollapsible: { width: '100%', overflow: 'hidden' },
  compactCollapsible: { width: '100%', overflow: 'hidden' },
  compactSummary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 44, width: '100%' },
  compactCol: { flex: 1, alignItems: 'center' },
  compactLabel: { fontSize: 12, color: 'rgba(255, 255, 255, 0.75)', marginBottom: 2 },
  compactValue: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
  compactDivider: { width: 1, height: 24, backgroundColor: 'rgba(255, 255, 255, 0.25)' },
  totalStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingVertical: 16,
  },
  totalStatBox: { alignItems: 'center', flex: 1 },
  totalStatLabel: { fontSize: 14, color: 'rgba(255, 255, 255, 0.8)', marginBottom: 6 },
  totalStatValue: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  filterContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20,
      paddingHorizontal: 20,
  },
  dateRangeButton: {
      flex: 1,
      paddingVertical: 12,
      backgroundColor: '#FFFFFF',
      borderRadius: 20,
      elevation: 3,
      marginRight: 8,
  },
  dateRangeText: { fontSize: 16, fontWeight: 'bold', color: PRIMARY_COLOR, textAlign: 'center' },
  rankingButton: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      backgroundColor: '#FFFFFF',
      borderRadius: 20,
      elevation: 3,
  },
  rankingButtonText: { fontSize: 16, fontWeight: 'bold', color: PRIMARY_COLOR },
  actionRow: {
      flexDirection: 'row',
      marginTop: 12,
      marginHorizontal: 20,
      gap: 8,
  },
  actionHalf: { flex: 1 },
  agentButton: {
      marginTop: 8,
      marginHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: 'rgba(255, 255, 255, 0.6)',
      backgroundColor: 'rgba(255, 255, 255, 0.12)',
      alignItems: 'center',
  },
  briefingButton: {
      paddingVertical: 12,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: 'rgba(255, 255, 255, 0.6)',
      backgroundColor: 'rgba(255, 255, 255, 0.12)',
      alignItems: 'center',
  },
  briefingButtonText: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  briefingModalContent: { backgroundColor: '#FFFFFF', borderRadius: 20, marginHorizontal: 20, paddingBottom: 20, maxHeight: '70%' },
  briefingBody: { paddingHorizontal: 24, paddingVertical: 20 },
  briefingCenter: { alignItems: 'center', justifyContent: 'center', paddingVertical: 30 },
  briefingLoadingText: { marginTop: 16, fontSize: 15, color: '#6B7280' },
  briefingErrorText: { fontSize: 15, color: '#D32F2F', textAlign: 'center', marginBottom: 16 },
  briefingRetryButton: { backgroundColor: PRIMARY_COLOR, paddingVertical: 10, paddingHorizontal: 24, borderRadius: 12 },
  briefingRetryText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  briefingContentText: { fontSize: 16, lineHeight: 26, color: '#1F2937' },
  listContainer: { paddingVertical: 16, paddingBottom: 40 },
  sortBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 8 },
  sortBarTitle: { fontSize: 13, fontWeight: '700', color: '#6B7280', marginRight: 8 },
  sortChips: { gap: 8, paddingRight: 20 },
  sortChip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D6D9E6' },
  sortChipActive: { backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR },
  sortChipText: { fontSize: 12, fontWeight: '600', color: PRIMARY_COLOR },
  sortChipTextActive: { color: '#FFFFFF' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    elevation: 3,
  },
  dongName: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 16, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  statItem: { width: '50%', marginBottom: 12 },
  statLabel: { fontSize: 14, color: '#6B7280' },
  statValue: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  detailButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  detailButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  excelButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    margin: 24,
    marginTop: 0,
  },
  excelButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText: { fontSize: 16, color: '#6B7280', textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  calendarModalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 8, paddingBottom: 30, maxHeight: '60%' },
  rankingModalContent: { backgroundColor: '#FFFFFF', borderRadius: 20, paddingBottom: 20, marginHorizontal: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  modalCloseButton: { fontSize: 16, color: PRIMARY_COLOR },
  modalConfirmButton: { backgroundColor: PRIMARY_COLOR, paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 16, marginHorizontal: 20 },
  modalConfirmButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  rankItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  rankNumber: { fontSize: 16, fontWeight: 'bold', color: '#6B7280', width: 34, textAlign: 'center' },
  rankName: { flex: 1, fontSize: 16, color: '#1F2937', marginLeft: 6 },
  rankAmount: { fontSize: 16, fontWeight: '600', color: PRIMARY_COLOR },
  // 랭킹 기간 모드 UI
  rankModeRow: { flexDirection: 'row', backgroundColor: '#E8EAF6', borderRadius: 10, margin: 16, marginBottom: 8, padding: 3 },
  rankModeItem: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  rankModeItemActive: { backgroundColor: PRIMARY_COLOR },
  rankModeText: { fontSize: 13, fontWeight: '600', color: PRIMARY_COLOR },
  rankModeTextActive: { color: '#FFFFFF' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginHorizontal: 16, marginBottom: 6 },
  chip: { paddingVertical: 7, paddingHorizontal: 14, borderRadius: 16, backgroundColor: '#F0F1F6', borderWidth: 1, borderColor: '#D6D9E6' },
  chipActive: { backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR },
  chipText: { fontSize: 13, fontWeight: '600', color: PRIMARY_COLOR },
  chipTextActive: { color: '#FFFFFF' },
  rangePickBtn: { marginHorizontal: 16, marginBottom: 4, backgroundColor: '#F0F1F6', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: '#D6D9E6' },
  rangePickBtnText: { fontSize: 14, fontWeight: '600', color: PRIMARY_COLOR },
  rankPeriodLabel: { fontSize: 12, color: '#6B7280', marginHorizontal: 20, marginTop: 4, marginBottom: 8 },
  rankEmpty: { textAlign: 'center', color: '#6B7280', paddingVertical: 30, fontSize: 14 },
  chartBlock: { paddingHorizontal: 16, paddingTop: 16, marginTop: 8, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  chartTitle: { fontSize: 14, fontWeight: '700', color: '#1F2937', marginBottom: 12 },
});

export default SuperAdminDashboardScreen;
