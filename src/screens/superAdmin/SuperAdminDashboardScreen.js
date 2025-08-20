import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
// import * as XLSX from 'xlsx';
// import axios from 'axios';
import { Calendar } from 'react-native-calendars';

// 로컬 JSON 파일을 import 합니다.
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

const RankingModal = ({ visible, onClose, rankingData }) => {
    const getRankIcon = (rank) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `${rank}.`;
    };

    return (
        <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
            <View style={[styles.modalOverlay, { justifyContent: 'center' }]}>
                <View style={styles.rankingModalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>기부 금액 랭킹</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.modalCloseButton}>닫기</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={rankingData.slice(0, 3)}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item, index }) => (
                            <View style={styles.rankItem}>
                                <Text style={styles.rankNumber}>{getRankIcon(index + 1)}</Text>
                                <Text style={styles.rankName}>{item.name}</Text>
                                <Text style={styles.rankAmount}>{formatNumber(item.donationAmount)}원</Text>
                            </View>
                        )}
                    />
                </View>
            </View>
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

  const formatDate = (date) => date.toISOString().split('T')[0];

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const fetchData = async () => {
    setLoading(true);
    setTimeout(() => {
      if (startDate && endDate) {
        setData(mockData.dongs.slice(0, 10) || []);
      } else {
        setData(mockData.dongs || []);
      }
      setTotals(mockData.totals || {});
      setLoading(false);
    }, 500);
  };

  const rankingData = useMemo(() => {
    return [...data].sort((a, b) => b.donationAmount - a.donationAmount);
  }, [data]);


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

  const handleExcelExport = () => { Alert.alert("알림", "엑셀 내보내기 기능") };
  const handleCardPress = (dong) => { navigation.navigate('DongDashboard', { dongName: dong.name, dongId: dong.id }); };
  
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
        <View style={styles.filterContainer}>
            {/* 이 버튼을 누르면 isPickerVisible 상태가 true로 바뀝니다. */}
            <TouchableOpacity style={styles.dateRangeButton} onPress={() => setPickerVisible(true)}>
                <Text style={styles.dateRangeText}>{dateRangeButtonText}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.rankingButton} onPress={() => setRankingVisible(true)}>
                <Text style={styles.rankingButtonText}>🏆 랭킹 보기</Text>
            </TouchableOpacity>
        </View>
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
        rankingData={rankingData}
      />
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
  rankingModalContent: { backgroundColor: '#FFFFFF', borderRadius: 20, paddingBottom: 20, marginHorizontal: 20, maxHeight: '50%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  modalCloseButton: { fontSize: 16, color: PRIMARY_COLOR },
  modalConfirmButton: { backgroundColor: PRIMARY_COLOR, paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 16, marginHorizontal: 20 },
  modalConfirmButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  rankItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 24, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  rankNumber: { fontSize: 16, fontWeight: 'bold', color: '#6B7280', width: 40 },
  rankName: { flex: 1, fontSize: 16, color: '#1F2937' },
  rankAmount: { fontSize: 16, fontWeight: '600', color: PRIMARY_COLOR },
});

export default SuperAdminDashboardScreen;
