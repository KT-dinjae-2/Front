import React, { useEffect, useState } from 'react';
import { FlatList, LayoutAnimation, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';

// --- Mock Data ---
const mockMonthlyData = {
  '왕십리2동': [
    { id: '1', name: '송하정', transactions: [ { year: 2025, month: 1, type: 'donation', count: 2, amount: 20000 }, { year: 2025, month: 1, type: 'share', count: 1, amount: 10000 }, { year: 2025, month: 2, type: 'donation', count: 1, amount: 10000 }, { year: 2025, month: 2, type: 'share', count: 1, amount: 10000 }, { year: 2024, month: 12, type: 'donation', count: 3, amount: 35000 }, ] },
    { id: '2', name: '돌삼겹나들목', transactions: [ { year: 2025, month: 1, type: 'donation', count: 1, amount: 25000 }, { year: 2025, month: 3, type: 'donation', count: 1, amount: 15000 }, ] },
    { id: '3', name: '파리바게뜨 왕십리무학점', transactions: [ { year: 2025, month: 1, type: 'donation', count: 2, amount: 20000 }, { year: 2025, month: 1, type: 'share', count: 3, amount: 30000 }, { year: 2025, month: 2, type: 'donation', count: 2, amount: 30000 }, { year: 2025, month: 2, type: 'share', count: 2, amount: 20000 }, ] },
  ],
  '마장동': [
    { id: '4', name: '마장동 먹자골목', transactions: [ { year: 2025, month: 4, type: 'donation', count: 5, amount: 120000 }, { year: 2025, month: 4, type: 'share', count: 3, amount: 80000 }] },
  ]
};

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
  const { dongName } = route.params;
  const [selectedYear, setSelectedYear] = useState('전체');
  const [selectedMonth, setSelectedMonth] = useState('전체');
  const [isYearPickerVisible, setIsYearPickerVisible] = useState(false);
  const [isMonthPickerVisible, setIsMonthPickerVisible] = useState(false);
  const [displayData, setDisplayData] = useState({ stores: [], totalDonationCount: 0, totalDonationAmount: 0, totalShareCount: 0, totalShareAmount: 0 });

  // ❌ 복잡한 높이 계산 로직 제거
  // const [headerHeight, setHeaderHeight] = useState(0); 

  const availableYears = ['전체', 2025, 2024];
  const months = ['전체', ...Array.from({ length: 12 }, (_, i) => `${i + 1}월`)];

  useEffect(() => {
    const originalStores = mockMonthlyData[dongName] || [];
    const filteredStores = originalStores.map(store => {
      const transactions = store.transactions.filter(t => (selectedYear === '전체' || t.year === selectedYear) && (selectedMonth === '전체' || t.month === parseInt(selectedMonth)));
      const donationCount = transactions.filter(t => t.type === 'donation').reduce((sum, t) => sum + t.count, 0);
      const donationAmount = transactions.filter(t => t.type === 'donation').reduce((sum, t) => sum + t.amount, 0);
      const shareCount = transactions.filter(t => t.type === 'share').reduce((sum, t) => sum + t.count, 0);
      const shareAmount = transactions.filter(t => t.type === 'share').reduce((sum, t) => sum + t.amount, 0);
      return { ...store, donationCount, donationAmount, shareCount, shareAmount };
    }).filter(store => store.donationCount > 0 || store.shareCount > 0);
    const totalDonationCount = filteredStores.reduce((sum, store) => sum + store.donationCount, 0);
    const totalDonationAmount = filteredStores.reduce((sum, store) => sum + store.donationAmount, 0);
    const totalShareCount = filteredStores.reduce((sum, store) => sum + store.shareCount, 0);
    const totalShareAmount = filteredStores.reduce((sum, store) => sum + store.shareAmount, 0);
    setDisplayData({ stores: filteredStores, totalDonationCount, totalDonationAmount, totalShareCount, totalShareAmount });
  }, [dongName, selectedYear, selectedMonth]);

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

  // ✅ 고정될 헤더와 필터 전체를 렌더링하는 컴포넌트
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

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ✅ 고정 헤더 컴포넌트 */}
      <FixedHeader />
      
      {/* ✅ FlatList를 flex: 1 View로 감싸서 남은 공간을 모두 채우도록 설정 */}
      <View style={{ flex: 1 }}>
        <FlatList
          data={displayData.stores}
          renderItem={({ item }) => <StoreCard item={item} onPress={() => navigation.navigate('StoreLedger', { storeId: item.id, storeName: item.name })} />}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<View style={styles.emptyContainer}><Text style={styles.emptyText}>해당 기간의 데이터가 없습니다.</Text></View>}
        />
      </View>
    </SafeAreaView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  // ✅ 헤더와 필터를 감싸는 고정 컨테이너 스타일
  headerWrapper: {
    backgroundColor: '#098710',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    zIndex: 10, // 드롭다운이 FlatList 위에 표시되도록 zIndex 설정
  },
  // ✅ 기존 header 스타일은 content만 담당하도록 수정
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
  // ✅ 필터 섹션 스타일 단순화
  filterSection: { 
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  filterRow: { flexDirection: 'row', justifyContent: 'space-between' },
  pickerWrapper: { flex: 1, marginHorizontal: 4 },
  pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#FFFFFF', borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  pickerHeaderText: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  pickerHeaderIcon: { fontSize: 14, color: '#6B7280' },
  // ✅ 드롭다운 메뉴가 최상단에 오도록 zIndex/elevation 강화
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