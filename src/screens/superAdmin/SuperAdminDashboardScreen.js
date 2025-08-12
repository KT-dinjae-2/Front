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
import { Ionicons } from '@expo/vector-icons';

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

const YEARS = ['전체', '2025', '2024'];
const MONTHS = ['전체', ...Array.from({ length: 12 }, (_, i) => (i + 1).toString())];

const SuperAdminDashboardScreen = ({ navigation }) => {
  const [totals, setTotals] = useState({});
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState('전체');
  const [month, setMonth] = useState('전체');

  // 드롭다운 상태 관리
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);

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
      setTotals(response.data.totals || {});
      setData(response.data.dongs || []);
    } catch (error) {
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

  const renderDropdown = (label, selectedValue, onSelect, open, setOpen, options) => (
    <View style={styles.pickerWrapper}>
      <TouchableOpacity
        style={styles.pickerHeader}
        onPress={() => {
          setOpen(!open);
          // 다른 드롭다운 닫기
          if (label === '연도') setMonthDropdownOpen(false);
          if (label === '월') setYearDropdownOpen(false);
        }}
      >
        <Text style={styles.pickerHeaderText}>{selectedValue}</Text>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          style={styles.pickerHeaderIcon}
        />
      </TouchableOpacity>
      {open && (
        <View style={styles.pickerGrid}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={styles.pickerItem}
              onPress={() => {
                onSelect(opt);
                setOpen(false);
              }}
            >
              <Text
                style={[
                  styles.pickerItemText,
                  opt === selectedValue && styles.selectedPickerItemText,
                ]}
              >
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerWrapper}>
        <View style={styles.headerContent}>
          <Image source={require('../../../assets/images/white-small-logo.png')} style={styles.logo} />
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
      </View>

      <View style={styles.filterSection}>
        <View style={styles.filterRow}>
          {renderDropdown('연도', year, setYear, yearDropdownOpen, setYearDropdownOpen, YEARS)}
          {renderDropdown('월', month, setMonth, monthDropdownOpen, setMonthDropdownOpen, MONTHS)}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },

  headerWrapper: {
    backgroundColor: '#098710',
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    zIndex: 10,
  },

  headerContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    alignItems: 'center',
  },

  logo: { width: 51, height: 51, resizeMode: 'contain', marginBottom: 16 },

  title: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },

  icon: { fontSize: 24, color: '#FFFFFF', marginVertical: 8 },

  totalStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingVertical: 16,
  },

  totalStatBox: { alignItems: 'center', flex: 1 },

  totalStatLabel: { fontSize: 14, color: 'rgba(255, 255, 255, 0.8)', marginBottom: 6 },

  totalStatValue: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', lineHeight: 22 },

  filterSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    zIndex: 100,
  },

  filterRow: { flexDirection: 'row', justifyContent: 'space-between' },

  pickerWrapper: { flex: 1, marginHorizontal: 4 },

  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  pickerHeaderText: { fontSize: 16, fontWeight: '600', color: '#1F2937' },

  pickerHeaderIcon: { fontSize: 14, color: '#6B7280' },

  pickerGrid: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
    zIndex: 20,
    padding: 8,
  },

  pickerItem: { padding: 12, alignItems: 'center' },

  pickerItemText: { fontSize: 16, color: '#374151' },

  selectedPickerItemText: { color: '#098710', fontWeight: 'bold' },

  listContainer: { paddingVertical: 16, paddingBottom: 40 },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    margin: 24,
    marginTop: 0,
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
    margin: 24,
    marginTop: 0,
  },

  excelButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },

  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },

  emptyText: { fontSize: 16, color: '#6B7280', textAlign: 'center' },
});

export default SuperAdminDashboardScreen;