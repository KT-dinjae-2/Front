import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
// import axios from 'axios'; // API 호출은 잠시 주석 처리

// 1. 로컬에 저장된 임시 데이터 파일을 import 합니다.
import mockData from '../../../assets/data/mock-dong-dashboard-data.json';


// --- Helper & Components (변경 없음) ---
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

  // const API_BASE_URL = 'http://43.202.137.139:8000/api';

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]); // 이제 날짜가 변경될 때마다 fetchData가 호출됩니다.
  
  const fetchData = async () => {
    setIsLoading(true);

    setTimeout(() => {
        // 2. 날짜 선택 여부에 따라 다른 데이터 보여주기
        if (startDate && endDate) {
            // 날짜를 선택했다면, 데이터를 필터링하는 것처럼 보이기 위해 목록의 일부만 가져옴
            const filteredStores = mockData.stores.slice(0, 2) || [];
            setDisplayData({
                stores: filteredStores,
                ...mockData.totals // 총계는 일단 그대로 둠
            });
        } else {
            // 날짜 선택이 없다면 전체 데이터 보여주기
            setDisplayData({
                stores: mockData.stores || [],
                ...mockData.totals
            });
        }
        setIsLoading(false);
    }, 500);



    /*
    // --- 🚨 기존 API 호출 로직 (주석 처리) ---
    let url = `${API_BASE_URL}/dong/${dongId}/totals/`;
    let params = {};

    if (startDate && endDate) {
      params.year = startDate.getFullYear();
      params.month = startDate.getMonth() + 1;
    } else {
        params.year = '전체';
        params.month = '전체';
    }

    try {
      const response = await axios.get(url, { params });
      setDisplayData({
        stores: response.data.stores || [],
        ...response.data.totals
      });
    } catch (e) {
      setError('데이터를 불러오는 데 실패했습니다.');
      console.error(e);
    } finally {
      setIsLoading(false);
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
  
  const formatDateForButton = (date) => `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
  let dateRangeButtonText = '날짜 선택 (전체)';
  if (startDate && !endDate) {
    dateRangeButtonText = `${formatDateForButton(startDate)} ~`;
  } else if (startDate && endDate) {
    dateRangeButtonText = `${formatDateForButton(startDate)} ~ ${formatDateForButton(endDate)}`;
  }
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerWrapper}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{dongName}</Text>
          <Image source={require('../../../assets/images/original-logo.png')} style={styles.logoIcon} />
          <Text style={styles.totalLabel}>총 기부건수: {displayData.totalDonationCount || 0}</Text>
        </View>
        <View style={styles.totalStatsContainer}>
          <View style={styles.totalStatBox}><Text style={styles.totalStatLabel}>총 기부 금액</Text><Text style={styles.totalStatValue}>{formatNumber(displayData.totalDonationAmount)}원</Text></View>
          <View style={styles.totalStatBox}><Text style={styles.totalStatLabel}>총 나눔 금액</Text><Text style={styles.totalStatValue}>{formatNumber(displayData.totalShareAmount)}원</Text></View>
          <View style={styles.totalStatBox}><Text style={styles.totalStatLabel}>잔여 나눔 가능액</Text><Text style={[styles.totalStatValue, styles.remainingValue]}>{formatNumber(remainingAmount)}원</Text></View>
        </View>
        <TouchableOpacity style={styles.dateRangeButton} onPress={() => setPickerVisible(true)}>
          <Text style={styles.dateRangeText}>{dateRangeButtonText}</Text>
        </TouchableOpacity>
      </View>
      
      {isLoading ? (
        <ActivityIndicator style={{marginTop: 50}} size="large" color={PRIMARY_COLOR}/>
      ) : (
        <FlatList
          data={displayData.stores}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => <StoreCard item={item} onPress={() => navigation.navigate('StoreLedger', { storeId: item.id, storeName: item.name, dongName: dongName })} />}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<View style={styles.emptyContainer}><Text style={styles.emptyText}>데이터가 없습니다.</Text></View>}
        />
      )}
      
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

const PRIMARY_COLOR = '#1A237E';
const LIGHT_PRIMARY_COLOR = '#E8EAF6';

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F6F8' },
  headerWrapper: { backgroundColor: PRIMARY_COLOR, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, paddingBottom: 20 },
  headerContent: { paddingHorizontal: 24, paddingTop: 60, alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF' },
  logoIcon: { width: 30, height: 30, resizeMode: 'contain', marginVertical: 8 },
  totalLabel: { fontSize: 18, color: '#E8EAF6', marginBottom: 20 },
  totalStatsContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '90%', alignSelf: 'center', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 16, paddingVertical: 16 },
  totalStatBox: { alignItems: 'center', flex: 1 },
  totalStatLabel: { fontSize: 14, color: 'rgba(255, 255, 255, 0.8)', marginBottom: 6 },
  totalStatValue: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  remainingValue: { color: '#81D4FA', fontWeight: 'bold' },
  dateRangeButton: { alignSelf: 'center', marginTop: 20, paddingVertical: 12, paddingHorizontal: 30, backgroundColor: '#FFFFFF', borderRadius: 20, elevation: 3 },
  dateRangeText: { fontSize: 16, fontWeight: 'bold', color: PRIMARY_COLOR },
  listContainer: { paddingVertical: 16, paddingBottom: 40 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginHorizontal: 20, marginBottom: 16, elevation: 3 },
  storeName: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 16, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  statItem: { width: '50%', marginBottom: 12 },
  statLabel: { fontSize: 14, color: '#6B7280' },
  statValue: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  actionButton: { backgroundColor: PRIMARY_COLOR, paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText: { fontSize: 16, color: '#6B7280', textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 20, paddingBottom: 30, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 5 },
  modalConfirmButton: { backgroundColor: PRIMARY_COLOR, paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 16, marginHorizontal: 20 },
  modalConfirmButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});

export default DongDashboardScreen;