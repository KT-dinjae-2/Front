import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, LayoutAnimation, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';

// --- Helper & Components ---
const formatNumber = (num) => num ? num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') : '0';

const StoreCard = ({ item, onPress }) => (
  <View style={styles.card}>
    <Text style={styles.storeName}>{item.name}</Text>
    <View style={styles.statsRow}>
      <View style={styles.statItem}><Text style={styles.statLabel}>기부건수</Text><Text style={styles.statValue}>{item.donationCount}건</Text></View>
      <View style={styles.statItem}><Text style={styles.statLabel}>기부 금액</Text><Text style={styles.statValue}>{formatNumber(item.donationAmount)}원</Text></View>
    </View>
    <View style={styles.statsRow}>
      <View style={styles.statItem}><Text style={styles.statLabel}>나눔건수</Text><Text style={styles.statValue}>{item.shareCount}건</Text></View>
      <View style={styles.statItem}><Text style={styles.statLabel}>나눔 금액</Text><Text style={styles.statValue}>{formatNumber(item.shareAmount)}원</Text></View>
    </View>
    <TouchableOpacity style={styles.actionButton} onPress={onPress}><Text style={styles.buttonText}>나눔 내역 입력</Text></TouchableOpacity>
  </View>
);

// --- Main Screen ---
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const DongDashboardScreen = ({ route, navigation }) => {
  // 이전 화면에서 dongName과 함께 dongId를 받아와야 합니다.
  const { dongName, dongId } = route.params; 
  const [selectedYear, setSelectedYear] = useState('전체');
  const [selectedMonth, setSelectedMonth] = useState('전체');
  const [isYearPickerVisible, setIsYearPickerVisible] = useState(false);
  const [isMonthPickerVisible, setIsMonthPickerVisible] = useState(false);
  
  const [displayData, setDisplayData] = useState({ stores: [], totalDonationCount: 0, totalDonationAmount: 0, totalShareCount: 0, totalShareAmount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // const API_BASE_URL = 'http://192.168.99.178:8000'; 
  const API_BASE_URL = 'https://be168d0c5206.ngrok-free.app';

  const availableYears = ['전체', 2025, 2024];
  const months = ['전체', ...Array.from({ length: 12 }, (_, i) => `${i + 1}월`)];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      // urls.py에 정의된 주소 형식에 맞게 URL을 수정합니다.
      const url = `${API_BASE_URL}/api/dong/${dongId}/totals/?year=${selectedYear}&month=${selectedMonth}`;
      
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('데이터를 불러오는데 실패했습니다.');
        }
        const data = await response.json();

        setDisplayData({
            stores: data.stores || [],
            totalDonationCount: data.totals.totalDonationCount || 0,
            totalDonationAmount: data.totals.totalDonationAmount || 0,
            totalShareCount: data.totals.totalShareCount || 0,
            totalShareAmount: data.totals.totalShareAmount || 0,
        });

      } catch (e) {
        setError(e.message);
        setDisplayData({ stores: [], totalDonationCount: 0, totalDonationAmount: 0, totalShareCount: 0, totalShareAmount: 0 });
      } finally {
        setIsLoading(false);
      }
    };

    if (dongId) {
        fetchData();
    }
  }, [dongId, selectedYear, selectedMonth]);

  const togglePicker = (picker) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (picker === 'year') {
      setIsYearPickerVisible(!isYearPickerVisible);
      setIsMonthPickerVisible(false);
    } else {
      setIsMonthPickerVisible(!isMonthPickerVisible);
      setIsYearPickerVisible(false);
    }
  };
  const handleSelectYear = (year) => { setSelectedYear(year); togglePicker('year'); };
  const handleSelectMonth = (month) => { setSelectedMonth(month); togglePicker('month'); };

  const FixedHeader = () => (
    <View style={styles.headerWrapper}>
        <View style={styles.headerContent}>
            <Text style={styles.title}>{dongName}</Text>
            <Text style={styles.icon}>✤</Text>
            <View style={styles.totalStatsContainer}>
                <View style={styles.totalStatBox}>
                    <Text style={styles.totalStatLabel}>총 기부</Text>
                    <Text style={styles.totalStatValue}>{displayData.totalDonationCount}건</Text>
                    <Text style={styles.totalStatValue}>{formatNumber(displayData.totalDonationAmount)}원</Text>
                </View>
                <View style={styles.totalStatBox}>
                    <Text style={styles.totalStatLabel}>총 나눔</Text>
                    <Text style={styles.totalStatValue}>{displayData.totalShareCount}건</Text>
                    <Text style={styles.totalStatValue}>{formatNumber(displayData.totalShareAmount)}원</Text>
                </View>
            </View>
        </View>
        <View style={styles.filterSection}>
            <View style={styles.filterRow}>
                 <View style={styles.pickerWrapper}>
                    <TouchableOpacity style={styles.pickerHeader} onPress={() => togglePicker('year')}>
                        <Text style={styles.pickerHeaderText}>{selectedYear === '전체' ? '전체년도' : `${selectedYear}년`}</Text>
                        <Text style={styles.pickerHeaderIcon}>{isYearPickerVisible ? '▲' : '▼'}</Text>
                    </TouchableOpacity>
                    {isYearPickerVisible && (
                        <View style={styles.pickerGrid}>
                            {availableYears.map(year => <TouchableOpacity key={year} style={styles.pickerItem} onPress={() => handleSelectYear(year)}><Text style={[styles.pickerItemText, selectedYear === year && styles.selectedPickerItemText]}>{year === '전체' ? '전체년도' : `${year}년`}</Text></TouchableOpacity>)}
                        </View>
                    )}
                </View>
                <View style={styles.pickerWrapper}>
                    <TouchableOpacity style={styles.pickerHeader} onPress={() => togglePicker('month')}>
                        <Text style={styles.pickerHeaderText}>{selectedMonth === '전체' ? '전체월' : selectedMonth}</Text>
                        <Text style={styles.pickerHeaderIcon}>{isMonthPickerVisible ? '▲' : '▼'}</Text>
                    </TouchableOpacity>
                    {isMonthPickerVisible && (
                        <View style={styles.pickerGrid}>
                            {months.map(month => <TouchableOpacity key={month} style={styles.pickerItem} onPress={() => handleSelectMonth(month)}><Text style={[styles.pickerItemText, selectedMonth === month && styles.selectedPickerItemText]}>{month}</Text></TouchableOpacity>)}
                        </View>
                    )}
                </View>
            </View>
        </View>
    </View>
  );

  const renderContent = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" color="#098710" style={{ marginTop: 80 }} />;
    }
    if (error) {
      return <View style={styles.emptyContainer}><Text style={styles.emptyText}>{error}</Text></View>;
    }
    return (
      <FlatList
        data={displayData.stores}
        renderItem={({ item }) => <StoreCard item={item} onPress={() => navigation.navigate('StoreLedger', { storeId: item.id, storeName: item.name })} />}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<View style={styles.emptyContainer}><Text style={styles.emptyText}>해당 기간의 데이터가 없습니다.</Text></View>}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <FixedHeader />
      <View style={{ flex: 1 }}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },

  headerWrapper: {
    backgroundColor: '#098710',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    zIndex: 10, // 드롭다운이 FlatList 위에 표시되도록 zIndex 설정
  },

  headerContent: { 
    paddingHorizontal: 24, 
    paddingTop: 60,
    alignItems: 'center',
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF' },
  icon: { fontSize: 24, color: '#FFFFFF', marginVertical: 8 },
  totalStatsContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 16, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 16, paddingVertical: 16 },
  totalStatBox: { alignItems: 'center', flex: 1 },
  totalStatLabel: { fontSize: 14, color: 'rgba(255, 255, 255, 0.8)', marginBottom: 6 },
  totalStatValue: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', lineHeight: 22 },
  // 필터 섹션 스타일 단순화
  filterSection: { 
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  filterRow: { flexDirection: 'row', justifyContent: 'space-between' },
  pickerWrapper: { flex: 1, marginHorizontal: 4 },
  pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#FFFFFF', borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  pickerHeaderText: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  pickerHeaderIcon: { fontSize: 14, color: '#6B7280' },
  // 드롭다운 메뉴가 최상단에 오도록 zIndex/elevation 강화
  pickerGrid: { position: 'absolute', top: 60, left: 0, right: 0, backgroundColor: '#FFFFFF', borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 20, zIndex: 20, padding: 8 },
  pickerItem: { padding: 12, alignItems: 'center' },
  pickerItemText: { fontSize: 16, color: '#374151' },
  selectedPickerItemText: { color: '#098710', fontWeight: 'bold' },
  listContainer: { paddingVertical: 16, paddingBottom: 40 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginHorizontal: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  storeName: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  statItem: { flex: 1 },
  statLabel: { fontSize: 14, color: '#6B7280' },
  statValue: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  actionButton: { backgroundColor: '#098710', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText: { fontSize: 16, color: '#6B7280', textAlign: 'center' },
});

export default DongDashboardScreen;