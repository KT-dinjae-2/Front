import React, { useState, useEffect } from 'react';
import {
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';

const formatNumber = (num) => {
  if (num === undefined || num === null) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const DongCard = ({ item, onPress }) => (
  <View style={styles.card}>
    <Text style={styles.dongName}>{item.name}</Text>
    <Text style={styles.infoText}>총 기부 건수: {item.donationCount}</Text>
    <Text style={styles.infoText}>총 기부액: {formatNumber(item.donationAmount)}원</Text>
    <Text style={styles.infoText}>총 나눔 건수: {item.shareCount}</Text>
    <Text style={styles.infoText}>총 나눔액: {formatNumber(item.shareAmount)}원</Text>
    <TouchableOpacity style={styles.detailButton} onPress={() => onPress(item)}>
      <Text style={styles.detailButtonText}>업체 별 기부 내역 보기</Text>
    </TouchableOpacity>
  </View>
);

const API_BASE_URL = 'http://43.202.137.139:8000/api';

const SuperAdminDashboardScreen = ({ navigation }) => {
  const [totals, setTotals] = useState({});
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState('전체');
  const [month, setMonth] = useState('전체');

  useEffect(() => {
    fetchData();
  }, [year, month]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (year !== '전체') params.year = year;
      if (month !== '전체') params.month = month;

      const response = await axios.get(`${API_BASE_URL}/dongs/totals/`, { params });
      console.log('동 목록:', response.data);

      setTotals(response.data.totals || {});
      setData(response.data.dongs || []);
    } catch (error) {
      console.error('동 목록 불러오기 실패:', error);
      Alert.alert('에러', '동 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleExcelExport = () => {
    Alert.alert('알림', '엑셀 파일 추출 기능이 실행됩니다.');
  };

  const handleCardPress = (dong) => {
    navigation.navigate('DongDashboard', { dongName: dong.name, dongId: dong.id });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Image source={require('../../../assets/images/white-small-logo.png')} style={styles.logo} />
        <Text style={styles.title}>전체 기부 내역</Text>
      </View>

      {/* 연도, 월 필터 */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 }}>
        <Picker
          selectedValue={year}
          style={{ width: 120, height: 40 }}
          onValueChange={(val) => setYear(val)}
        >
          <Picker.Item label="전체 연도" value="전체" />
          <Picker.Item label="2025" value="2025" />
          <Picker.Item label="2024" value="2024" />
        </Picker>

        <Picker
          selectedValue={month}
          style={{ width: 120, height: 40 }}
          onValueChange={(val) => setMonth(val)}
        >
          <Picker.Item label="전체 월" value="전체" />
          {[...Array(12)].map((_, i) => (
            <Picker.Item key={i + 1} label={`${i + 1}월`} value={`${i + 1}`} />
          ))}
        </Picker>
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={data}
          renderItem={({ item }) => <DongCard item={item} onPress={handleCardPress} />}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          contentContainerStyle={styles.listContainer}
          ListHeaderComponent={
            <View style={styles.totalsCard}>
              <Text style={styles.totalsTitle}>성동구</Text>
              <Text>총 기부 건수: {totals.totalDonationCount || 0}</Text>
              <Text>총 기부 금액: {formatNumber(totals.totalDonationAmount)}</Text>
              <Text>총 나눔 건수: {totals.totalShareCount || 0}</Text>
              <Text>총 나눔 금액: {formatNumber(totals.totalShareAmount)}</Text>
            </View>
          }
          ListFooterComponent={
            <TouchableOpacity style={styles.excelButton} onPress={handleExcelExport}>
              <Text style={styles.excelButtonText}>엑셀 파일 추출</Text>
            </TouchableOpacity>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    backgroundColor: '#098710',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#098710',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    alignItems: 'center',
  },
  logo: { width: 51, height: 51, resizeMode: 'contain', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
  listContainer: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 120 },
  totalsCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  totalsTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  dongName: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 },
  infoText: { fontSize: 14, color: '#6B7280', marginBottom: 2 },
  detailButton: {
    backgroundColor: '#098710',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  detailButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  excelButton: {
    backgroundColor: '#098710',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    marginTop: 12,
  },
  excelButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});

export default SuperAdminDashboardScreen;
