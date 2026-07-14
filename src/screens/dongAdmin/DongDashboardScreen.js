import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';

// 백엔드 API 클라이언트
import api from '../../api/client';
import BackButton from '../../components/BackButton';

const PRIMARY_COLOR = '#1A237E';
const LIGHT_PRIMARY_COLOR = '#E8EAF6';

// 헤더가 펼쳐졌을 때 / 접혔을 때 높이
const HEADER_MAX_HEIGHT = 280;
const HEADER_MIN_HEIGHT = 196;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;
// 헤더가 절대 위치라 리스트가 헤더 아래에서 시작하도록 여백을 줍니다.
const LIST_TOP_GAP = 12;

// --- Helper & Components ---
const formatNumber = (num) => num ? num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') : '0';

const StoreCard = ({ item, onPress }) => (
  <View style={styles.card}>
    <Text style={styles.storeName}>{item.name}</Text>
    <View style={styles.statsGrid}>
      <View style={styles.statItem}><Text style={styles.statLabel}>기부건수</Text><Text style={styles.statValue}>{item.donationCount}건</Text></View>
      <View style={styles.statItem}><Text style={styles.statLabel}>나눔건수</Text><Text style={styles.statValue}>{item.shareCount}건</Text></View>
      <View style={styles.statItem}><Text style={styles.statLabel}>기부 금액</Text><Text style={styles.statValue}>{formatNumber(item.donationAmount)}원</Text></View>
      <View style={styles.statItem}><Text style={styles.statLabel}>나눔 금액</Text><Text style={styles.statValue}>{formatNumber(item.shareAmount)}원</Text></View>
    </View>
    <TouchableOpacity style={styles.actionButton} onPress={onPress}><Text style={styles.buttonText}>나눔 내역 입력</Text></TouchableOpacity>
  </View>
);

// --- Main Screen ---
const DongDashboardScreen = ({ route, navigation }) => {
  const { dongName, dongId } = route.params;

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [markedDates, setMarkedDates] = useState({});
  const [isPickerVisible, setPickerVisible] = useState(false);

  const [displayData, setDisplayData] = useState({ stores: [], totalDonationCount: 0, totalDonationAmount: 0, totalShareCount: 0, totalShareAmount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);


  // 스크롤에 따라 접히는 헤더용 애니메이션 값
  const scrollY = useRef(new Animated.Value(0)).current;

  // const API_BASE_URL = 'http://43.202.137.139:8000/api';

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]); // 이제 날짜가 변경될 때마다 fetchData가 호출됩니다.

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    // 날짜를 선택한 경우, 시작일 기준으로 연도/월 필터를 적용합니다.
    const params = {};
    if (startDate && endDate) {
      params.year = startDate.getFullYear();
      params.month = startDate.getMonth() + 1;
    }

    try {
      const response = await api.get(`/dong/${dongId}/totals/`, { params });
      setDisplayData({
        stores: response.data.stores || [],
        ...response.data.totals,
      });
    } catch (e) {
      console.error('동 대시보드 데이터 조회 실패:', e);
      setError('데이터를 불러오는 데 실패했습니다.');
    } finally {
      setIsLoading(false);
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
            const dateString = currentDate.toISOString().split('T')[0];
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

  const remainingAmount = (displayData.totalDonationAmount || 0) - (displayData.totalShareAmount || 0);

  // --- 스크롤 위치에 따른 헤더 접힘 애니메이션 ---
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });
  const titleFontSize = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [30, 22],
    extrapolate: 'clamp',
  });
  // 펼쳐진 상태(큰 금액 박스)는 스크롤 초반에 사라지고,
  const expandedOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE * 0.5],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  // 접힌 상태(작은 요약)는 후반에 나타납니다.
  const compactOpacity = scrollY.interpolate({
    inputRange: [HEADER_SCROLL_DISTANCE * 0.5, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const formatDateForButton = (date) => `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
  let dateRangeButtonText = '날짜 선택 (전체)';
  if (startDate && !endDate) {
    dateRangeButtonText = `${formatDateForButton(startDate)} ~`;
  } else if (startDate && endDate) {
    dateRangeButtonText = `${formatDateForButton(startDate)} ~ ${formatDateForButton(endDate)}`;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {isLoading ? (
        <ActivityIndicator style={{ marginTop: HEADER_MAX_HEIGHT + 40 }} size="large" color={PRIMARY_COLOR} />
      ) : (
        <Animated.FlatList
          style={{ flex: 1 }}
          data={displayData.stores}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => <StoreCard item={item} onPress={() => navigation.navigate('StoreLedger', { storeId: item.id, storeName: item.name, dongName: dongName, dongId: dongId })} />}
          contentContainerStyle={{ paddingTop: HEADER_MAX_HEIGHT + LIST_TOP_GAP, paddingBottom: 40 }}
          ListEmptyComponent={<View style={styles.emptyContainer}><Text style={styles.emptyText}>데이터가 없습니다.</Text></View>}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
        />
      )}

      {/* 리스트 위에 떠 있는 헤더 (스크롤하면 접힘) */}
      <Animated.View style={[styles.headerWrapper, { height: headerHeight }]}>
        <Animated.Text style={[styles.title, { fontSize: titleFontSize }]} numberOfLines={1}>{dongName}</Animated.Text>

        <TouchableOpacity style={styles.dateRangeButton} onPress={() => setPickerVisible(true)}>
          <Text style={styles.dateRangeText}>{dateRangeButtonText}</Text>
        </TouchableOpacity>

        {/* 접힌 상태: 날짜 아래에 금액·건수를 양옆에 작게 요약 */}
        <Animated.View style={[styles.compactSummary, { opacity: compactOpacity }]} pointerEvents="none">
          <View style={styles.compactCol}>
            <Text style={styles.compactLabel}>기부</Text>
            <Text style={styles.compactValue}>{displayData.totalDonationCount || 0}건 · {formatNumber(displayData.totalDonationAmount)}원</Text>
          </View>
          <View style={styles.compactDivider} />
          <View style={styles.compactCol}>
            <Text style={styles.compactLabel}>나눔</Text>
            <Text style={styles.compactValue}>{displayData.totalShareCount || 0}건 · {formatNumber(displayData.totalShareAmount)}원</Text>
          </View>
        </Animated.View>

        {/* 펼쳐진 상태: 큰 금액 박스 */}
        <Animated.View style={[styles.expandedBlock, { opacity: expandedOpacity }]} pointerEvents="none">
          <Text style={styles.totalLabel}>총 기부건수: {displayData.totalDonationCount || 0}</Text>
          <View style={styles.totalStatsContainer}>
            <View style={styles.totalStatBox}><Text style={styles.totalStatLabel}>총 기부 금액</Text><Text style={styles.totalStatValue}>{formatNumber(displayData.totalDonationAmount)}원</Text></View>
            <View style={styles.totalStatBox}><Text style={styles.totalStatLabel}>총 나눔 금액</Text><Text style={styles.totalStatValue}>{formatNumber(displayData.totalShareAmount)}원</Text></View>
            <View style={styles.totalStatBox}><Text style={styles.totalStatLabel}>잔여 나눔 가능액</Text><Text style={[styles.totalStatValue, styles.remainingValue]}>{formatNumber(remainingAmount)}원</Text></View>
          </View>
        </Animated.View>
      </Animated.View>

      {/* 이전 화면으로 돌아가기 (헤더 위에 떠 있음) */}
      <BackButton navigation={navigation} color="#FFFFFF" />

      {/* 이 동에 대한 AI 에이전트 (헤더 우측 상단) */}
      <TouchableOpacity style={styles.briefingFab} onPress={() => navigation.navigate('AIAgent', { dongName, dongId })}>
        <Text style={styles.briefingFabText}>🤖 AI 에이전트</Text>
      </TouchableOpacity>

      <Modal visible={isPickerVisible} transparent={true} animationType="slide" onRequestClose={() => setPickerVisible(false)}>
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Calendar onDayPress={onDayPress} markingType={'period'} markedDates={markedDates} />
                <TouchableOpacity style={styles.modalConfirmButton} onPress={() => setPickerVisible(false)}>
                    <Text style={styles.modalConfirmButtonText}>확인</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>
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
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
    overflow: 'hidden',
  },
  title: { fontSize: 30, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 12 },
  dateRangeButton: { paddingVertical: 12, paddingHorizontal: 30, backgroundColor: '#FFFFFF', borderRadius: 20, elevation: 3 },
  dateRangeText: { fontSize: 16, fontWeight: 'bold', color: PRIMARY_COLOR },

  // 접힌 상태의 작은 요약 (날짜 아래, 좌우 배치)
  compactSummary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12, width: '100%' },
  compactCol: { flex: 1, alignItems: 'center' },
  compactLabel: { fontSize: 12, color: 'rgba(255, 255, 255, 0.75)', marginBottom: 2 },
  compactValue: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
  compactDivider: { width: 1, height: 24, backgroundColor: 'rgba(255, 255, 255, 0.25)' },

  // 펼쳐진 상태의 큰 금액 박스 (헤더 안에서 절대 위치)
  expandedBlock: { position: 'absolute', top: 150, left: 0, right: 0, alignItems: 'center', paddingHorizontal: 20 },
  totalLabel: { fontSize: 16, color: '#E8EAF6', marginBottom: 14 },
  totalStatsContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 16, paddingVertical: 16 },
  totalStatBox: { alignItems: 'center', flex: 1 },
  totalStatLabel: { fontSize: 13, color: 'rgba(255, 255, 255, 0.8)', marginBottom: 6 },
  totalStatValue: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  remainingValue: { color: '#81D4FA', fontWeight: 'bold' },

  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginHorizontal: 20, marginBottom: 16, elevation: 3 },
  storeName: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 16, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  statItem: { width: '50%', marginBottom: 12 },
  statLabel: { fontSize: 14, color: '#6B7280' },
  statValue: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  actionButton: { backgroundColor: PRIMARY_COLOR, paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 40 },
  emptyText: { fontSize: 16, color: '#6B7280', textAlign: 'center' },

  // 우측 상단 AI 브리핑 버튼
  briefingFab: {
    position: 'absolute',
    top: 48,
    right: 14,
    zIndex: 50,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  briefingFabText: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' },
  briefingModalContent: { backgroundColor: '#FFFFFF', borderRadius: 20, marginHorizontal: 20, paddingBottom: 20, maxHeight: '70%' },
  briefingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  briefingTitle: { fontSize: 17, fontWeight: 'bold', color: '#1F2937', flex: 1 },
  briefingClose: { fontSize: 16, color: PRIMARY_COLOR, marginLeft: 12 },
  briefingBody: { paddingHorizontal: 24, paddingVertical: 20 },
  briefingCenter: { alignItems: 'center', justifyContent: 'center', paddingVertical: 30 },
  briefingLoadingText: { marginTop: 16, fontSize: 15, color: '#6B7280', textAlign: 'center' },
  briefingErrorText: { fontSize: 15, color: '#D32F2F', textAlign: 'center', marginBottom: 16 },
  briefingRetry: { backgroundColor: PRIMARY_COLOR, paddingVertical: 10, paddingHorizontal: 24, borderRadius: 12 },
  briefingRetryText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  briefingContentText: { fontSize: 16, lineHeight: 26, color: '#1F2937' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 20, paddingBottom: 30, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 5 },
  modalConfirmButton: { backgroundColor: PRIMARY_COLOR, paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 16, marginHorizontal: 20 },
  modalConfirmButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});

export default DongDashboardScreen;
