import React from 'react';
import { Dimensions, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

// api로 받아올 필요
const mockData = {
  '왕십리2동': {
    totalDonations: 9,
    stores: [
      { id: '1', name: '송하정', donationCount: 3, donationAmount: 30000, shareCount: 2, shareAmount: 20000 },
      { id: '2', name: '돌삼겹나들목', donationCount: 2, donationAmount: 40000, shareCount: 0, shareAmount: 0 },
      { id: '3', name: '파리바게뜨 왕십리무학점', donationCount: 4, donationAmount: 50000, shareCount: 5, shareAmount: 50000 },
    ]
  },
  '마장동': {
    totalDonations: 5,
    stores: [
      { id: '4', name: '마장동 먹자골목', donationCount: 5, donationAmount: 120000, shareCount: 3, shareAmount: 80000 },
    ]
  },
  '왕십리도선동': {
      totalDonations: 2,
      stores: [
          { id: '5', name: '도선동 주민센터 앞 분식', donationCount: 2, donationAmount: 15000, shareCount: 1, shareAmount: 5000 },
      ]
  }
};

// 숫자를 콤마 포맷으로 변경하는 헬퍼 함수
const formatNumber = (num) => num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

const StoreCard = ({ item, onPress }) => {
  const totalAmount = item.donationAmount + item.shareAmount;
  const totalCount = item.donationCount + item.shareCount;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.storeIcon}>
            <Text style={styles.storeIconText}>🏪</Text>
          </View>
          <View style={styles.storeInfo}>
            <Text style={styles.storeName} numberOfLines={2}>{item.name}</Text>
            <Text style={styles.totalInfo}>총 {totalCount}건 · {formatNumber(totalAmount)}원</Text>
          </View>
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <View style={[styles.statBadge, { backgroundColor: '#ECFDF5' }]}>
              <Text style={[styles.statBadgeText, { color: '#10B981' }]}>기부</Text>
            </View>
            <Text style={styles.statCount}>{item.donationCount}건</Text>
            <Text style={styles.statAmount}>{formatNumber(item.donationAmount)}원</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <View style={[styles.statBadge, { backgroundColor: '#FEF2F2' }]}>
              <Text style={[styles.statBadgeText, { color: '#EF4444' }]}>나눔</Text>
            </View>
            <Text style={styles.statCount}>{item.shareCount}건</Text>
            <Text style={styles.statAmount}>{formatNumber(item.shareAmount)}원</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.actionButton} onPress={onPress}>
          <Text style={styles.buttonText}>📋 나눔 내역 관리</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const DongDashboardScreen = ({ route, navigation }) => {
  const { dongName } = route.params;
  const dongData = mockData[dongName] || { totalDonations: 0, stores: [] };
  
  // 전체 통계 계산
  const totalStores = dongData.stores.length;
  const totalDonationAmount = dongData.stores.reduce((sum, store) => sum + store.donationAmount, 0);
  const totalShareAmount = dongData.stores.reduce((sum, store) => sum + store.shareAmount, 0);

  const handleCardPress = (store) => {
    navigation.navigate('StoreLedger', { storeId: store.id, storeName: store.name });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{dongName}</Text>
          <Text style={styles.subtitle}>지역 나눔 현황</Text>
        </View>
      </View>

      {/* 전체 통계 카드 */}
      <View style={styles.overviewCard}>
        <View style={styles.overviewStats}>
          <View style={styles.overviewItem}>
            <Text style={styles.overviewValue}>{totalStores}</Text>
            <Text style={styles.overviewLabel}>참여 가게</Text>
          </View>
          <View style={styles.overviewDivider} />
          <View style={styles.overviewItem}>
            <Text style={styles.overviewValue}>{dongData.totalDonations}</Text>
            <Text style={styles.overviewLabel}>총 기부건수</Text>
          </View>
          <View style={styles.overviewDivider} />
          <View style={styles.overviewItem}>
            <Text style={[styles.overviewValue, { color: '#10B981' }]}>
              {formatNumber(totalDonationAmount - totalShareAmount)}원
            </Text>
            <Text style={styles.overviewLabel}>순 기부금액</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={dongData.stores}
        renderItem={({ item }) => <StoreCard item={item} onPress={() => handleCardPress(item)} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🏪</Text>
            <Text style={styles.emptyTitle}>등록된 가게가 없습니다</Text>
            <Text style={styles.emptyText}>지역의 첫 번째 나눔 가게가 되어보세요!</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#F8FAFC' 
  },
  header: { 
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24, 
    paddingVertical: 32,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: { 
    fontSize: 16, 
    color: 'rgba(255,255,255,0.8)',
  },
  overviewCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginTop: -16,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    zIndex: 1,
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overviewItem: {
    alignItems: 'center',
    flex: 1,
  },
  overviewValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  overviewDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  listContainer: { 
    paddingHorizontal: 24, 
    paddingTop: 24, 
    paddingBottom: 40 
  },
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  storeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  storeIconText: {
    fontSize: 20,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: { 
    fontSize: 20, 
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  totalInfo: {
    fontSize: 14,
    color: '#6B7280',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  statBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  statAmount: {
    fontSize: 14,
    color: '#6B7280',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 20,
  },
  actionButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default DongDashboardScreen;