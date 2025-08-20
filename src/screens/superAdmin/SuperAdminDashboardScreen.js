import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
// import * as XLSX from 'xlsx'; // 엑셀 기능은 잠시 제외
// import axios from 'axios'; // API 호출은 잠시 제외
import { Calendar } from 'react-native-calendars';

// 1. 로컬 JSON 파일을 import 합니다.
import mockData from '../../../assets/data/mock-superadmin-data.json';

const PRIMARY_COLOR = '#1A237E';
const LIGHT_PRIMARY_COLOR = '#E8EAF6';

const formatNumber = (num) => {
  if (num === undefined || num === null) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

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

const API_BASE_URL = 'http://43.202.137.139:8000/api';

const SuperAdminDashboardScreen = ({ navigation }) => {
  const [totals, setTotals] = useState({});
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [markedDates, setMarkedDates] = useState({});
  const [isPickerVisible, setPickerVisible] = useState(false);

  const formatDate = (date) => date.toISOString().split('T')[0];

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const fetchData = async () => {
    setLoading(true);

    // --- 2. API 호출 대신 로컬 JSON 데이터 사용 ---
    setTimeout(() => {
      if (startDate && endDate) {
        // 날짜 선택 시, 필터링된 것처럼 보이기 위해 데이터 일부만 표시
        setData(mockData.dongs.slice(0, 2) || []);
      } else {
        // 날짜 선택 안 했을 시 전체 데이터 표시
        setData(mockData.dongs || []);
      }
      setTotals(mockData.totals || {});
      setLoading(false);
    }, 500); // 0.5초 딜레이로 로딩 효과

    /*
    // --- 🚨 기존 API 호출 로직 (주석 처리) ---
    try {
      const params = {};
      if (startDate && endDate) {
        params.start_date = formatDate(startDate);
        params.end_date = formatDate(endDate);
      }
      const response = await axios.get(`${API_BASE_URL}/dongs/totals/`, { params });
      setTotals(response.data.totals || {});
      setData(response.data.dongs || []);
    } catch (error) {
      Alert.alert('에러', '데이터를 불러오는데 실패했습니다. 서버 연결을 확인해주세요.');
      console.error(error);
    } finally {
      setLoading(false);
    }
    */
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

  const handleExcelExport = () => { /* ... 엑셀 내보내기 로직 ... */ };

  const handleCardPress = (dong) => {
    navigation.navigate('DongDashboard', { dongName: dong.name, dongId: dong.id });
  };
  
  const formatDateForButton = (date) => `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
  let dateRangeButtonText = '날짜 선택';
  if (startDate && !endDate) {
    dateRangeButtonText = `${formatDateForButton(startDate)} ~`;
  } else if (startDate && endDate) {
    dateRangeButtonText = `${formatDateForButton(startDate)} ~ ${formatDateForButton(endDate)}`;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerWrapper}>
        <View style={styles.headerContent}>
          <Image source={require('../../../assets/images/original-logo.png')} style={styles.logo} />
          <Text style={styles.title}>전체 기부 내역</Text>

          <View style={styles.totalStatsContainer}>
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
        </View>
        <TouchableOpacity style={styles.dateRangeButton} onPress={() => setPickerVisible(true)}>
            <Text style={styles.dateRangeText}>{dateRangeButtonText}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 40 }} color={PRIMARY_COLOR}/>
      ) : (
        <FlatList
          data={data}
          renderItem={({ item }) => <DongCard item={item} onPress={handleCardPress} />}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          contentContainerStyle={styles.listContainer}
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
      
      <Modal visible={isPickerVisible} transparent={true} animationType="slide" onRequestClose={() => setPickerVisible(false)}>
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F6F8' },
  headerWrapper: {
    backgroundColor: PRIMARY_COLOR,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    zIndex: 10,
  },
  headerContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  logo: { width: 40, height: 40, resizeMode: 'contain', marginBottom: 12 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 20 },
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
  dateRangeButton: {
      alignSelf: 'center',
      marginTop: 20,
      paddingVertical: 12,
      paddingHorizontal: 30,
      backgroundColor: '#FFFFFF',
      borderRadius: 20,
      elevation: 3,
  },
  dateRangeText: { fontSize: 16, fontWeight: 'bold', color: PRIMARY_COLOR },
  listContainer: { paddingVertical: 16, paddingBottom: 40 },
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
    backgroundColor: PRIMARY_COLOR, // 엑셀 색상
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
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 20, paddingBottom: 30, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 5 },
  modalConfirmButton: { backgroundColor: PRIMARY_COLOR, paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 16, marginHorizontal: 20 },
  modalConfirmButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});

export default SuperAdminDashboardScreen;