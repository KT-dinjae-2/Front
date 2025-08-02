import React from 'react';
import { FlatList, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// API 연동 전 임시 데이터
const mockTransactions = [
  { id: '1', type: '기부', amount: 10000, date: '2025/07/28' },
  { id: '2', type: '기부', amount: 5000, date: '2025/07/29' },
  { id: '3', type: '나눔', amount: 5000, date: '2025/07/30' },
  { id: '4', type: '기부', amount: 15000, date: '2025/07/31' },
  { id: '5', type: '나눔', amount: 20000, date: '2025/08/01' },
  { id: '6', type: '기부', amount: 7000, date: '2025/08/02' },
];

const formatNumber = (num) => num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

// 거래 내역 아이템 컴포넌트
const TransactionItem = ({ item, onPress, isClickable }) => {
  const isDonation = item.type === '기부';
  return (
    <TouchableOpacity onPress={onPress} disabled={!isClickable} activeOpacity={0.7}>
      <View style={[styles.transactionItem, !isClickable && styles.disabledItem]}>
        <View style={[styles.typeTag, isDonation ? styles.donationTag : styles.shareTag]}>
          <Text style={styles.typeText}>{item.type}</Text>
        </View>
        <Text style={[styles.amountText, { color: isDonation ? '#D9534F' : '#428BCA' }]}>
          {isDonation ? '+' : '-'} {formatNumber(item.amount)}원
        </Text>
        <Text style={styles.dateText}>{item.date}</Text>
      </View>
    </TouchableOpacity>
  );
};

const StoreLedgerScreen = ({ route, navigation }) => {
  // DongDashboardScreen에서 전달받은 모든 정보를 사용합니다.
  const { storeName, storeId, dongName } = route.params;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Text style={styles.backButtonText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{storeName || '가게 이름'}</Text>
            <View style={{width: 40}} /> {/* 중앙 정렬을 위한 빈 공간 */}
        </View>

        {/* 거래 내역 리스트 컨테이너 */}
        <View style={styles.ledgerContainer}>
          <FlatList
            ListHeaderComponent={<Text style={styles.ledgerTitle}>전체</Text>}
            data={mockTransactions}
            renderItem={({ item }) => {
              const isClickable = item.type === '나눔';
              return (
                <TransactionItem 
                  item={item} 
                  isClickable={isClickable}
                  onPress={
                    isClickable 
                      // 'UsageDetail' 화면으로 이동 시, dongName도 함께 전달합니다.
                      ? () => navigation.navigate('UsageDetail', { storeName, item, dongName })
                      : null
                  }
                />
              )
            }}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          />
        </View>
      </View>

      {/* 추가 버튼 */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('UsageEntry', { 
            storeName: storeName, 
            storeId: storeId 
        })}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F5F7',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? 20 : 10,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  backButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
  },
  backButtonText: {
    fontSize: 28,
    color: '#098710',
    fontWeight: 'bold',
  },
  ledgerContainer: {
    flex: 1,
    backgroundColor: '#E8F5E9',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  ledgerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  disabledItem: {
    // opacity: 0.6,
  },
  typeTag: {
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 12,
  },
  donationTag: {
    backgroundColor: '#D9534F',
  },
  shareTag: {
    backgroundColor: '#428BCA',
  },
  typeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  amountText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 14,
    color: '#6B7280',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 40,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#098710',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  fabIcon: {
    color: '#FFFFFF',
    fontSize: 30,
    lineHeight: 32,
  },
});

export default StoreLedgerScreen;