import React from 'react';
import { Dimensions, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

// 가상 데이터 (실제로는 storeId를 이용해 API로 호출)
const mockLedgerData = {
  '1': [ // 송하정
    { id: '1-1', type: '기부', amount: 15000, date: '2025/07/31' },
    { id: '1-2', type: '나눔', amount: 5000, date: '2025/07/30' },
    { id: '1-3', type: '기부', amount: 5000, date: '2025/07/29' },
    { id: '1-4', type: '기부', amount: 10000, date: '2025/07/28' },
  ],
  '2': [ // 돌삼겹나들목
    { id: '2-1', type: '기부', amount: 20000, date: '2025/07/25' },
    { id: '2-2', type: '기부', amount: 20000, date: '2025/07/20' },
  ],
  '3': [ // 파리바게뜨
    { id: '3-1', type: '나눔', amount: 10000, date: '2025/07/30' },
    { id: '3-2', type: '나눔', amount: 10000, date: '2025/07/29' },
  ],
  '4': [], // 마장동 먹자골목 (데이터 없음)
  '5': [ // 도선동 분식
      { id: '5-1', type: '기부', amount: 15000, date: '2025/07/15' },
      { id: '5-2', type: '나눔', amount: 5000, date: '2025/07/14' },
  ],
};

const formatNumber = (num) => num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

const LedgerItem = ({ item, navigation }) => {
  const isDonation = item.type === '기부';
  const amountColor = isDonation ? '#10B981' : '#EF4444';
  const bgColor = isDonation ? '#ECFDF5' : '#FEF2F2';
  const prefix = isDonation ? '+' : '-';
  const icon = isDonation ? '💝' : '🎁';

  const handlePress = () => {
    if (!isDonation) {
      navigation.navigate('UsageEdit', { item });
    }
  };

  return (
    <TouchableOpacity 
      onPress={handlePress} 
      disabled={isDonation}
      style={[styles.itemContainer, { backgroundColor: bgColor }]}
      activeOpacity={isDonation ? 1 : 0.7}
    >
      <View style={styles.itemLeft}>
        <Text style={styles.itemIcon}>{icon}</Text>
        <View style={styles.itemInfo}>
          <Text style={[styles.itemType, { color: amountColor }]}>{item.type}</Text>
          <Text style={styles.itemDate}>{item.date}</Text>
        </View>
      </View>
      <View style={styles.itemRight}>
        <Text style={[styles.itemAmount, { color: amountColor }]}>
          {prefix} {item.amount.toLocaleString()}원
        </Text>
        {!isDonation && <Text style={styles.editHint}>탭하여 수정</Text>}
      </View>
    </TouchableOpacity>
  );
};

const StoreLedgerScreen = ({ route, navigation }) => {
  const { storeName, storeId } = route.params;
  const ledgerData = mockLedgerData[storeId] || [];
  
  // 통계 계산
  const totalDonation = ledgerData.filter(item => item.type === '기부').reduce((sum, item) => sum + item.amount, 0);
  const totalShare = ledgerData.filter(item => item.type === '나눔').reduce((sum, item) => sum + item.amount, 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{storeName}</Text>
          <Text style={styles.subtitle}>전체 내역</Text>
        </View>
      </View>

      {/* 통계 카드 */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>+{totalDonation.toLocaleString()}원</Text>
          <Text style={styles.statLabel}>총 기부금액</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#EF4444' }]}>-{totalShare.toLocaleString()}원</Text>
          <Text style={styles.statLabel}>총 나눔금액</Text>
        </View>
      </View>
      
      <FlatList
        data={ledgerData}
        renderItem={({ item }) => <LedgerItem item={item} navigation={navigation} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyText}>기부/나눔 내역이 없습니다</Text>
            <Text style={styles.emptySubtext}>아래 버튼을 눌러 나눔 내역을 추가해보세요</Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('UsageEntry', { storeId, storeName })}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
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
    paddingVertical: 20, 
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  backButton: { 
    position: 'absolute', 
    left: 24, 
    top: 50,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: { 
    fontSize: 20, 
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 10,
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: { 
    fontSize: 16, 
    color: 'rgba(255,255,255,0.8)',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  listContainer: { 
    padding: 24, 
    paddingTop: 16,
  },
  itemContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20,
    marginBottom: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemType: { 
    fontSize: 16, 
    fontWeight: '600',
    marginBottom: 4,
  },
  itemDate: { 
    fontSize: 14, 
    color: '#6B7280',
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  itemAmount: { 
    fontSize: 18, 
    fontWeight: 'bold',
    marginBottom: 2,
  },
  editHint: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  fab: { 
    position: 'absolute', 
    right: 24, 
    bottom: 40, 
    width: 64, 
    height: 64, 
    borderRadius: 32,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: { 
    fontSize: 28, 
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default StoreLedgerScreen;