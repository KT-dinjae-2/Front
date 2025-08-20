import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import mockTransactionsData from '../../../assets/data/mock-store-ledger-data.json';

const PRIMARY_COLOR = '#1A237E';
const formatNumber = (num) => num ? num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') : '0';

const TransactionItem = ({ item, onPress }) => {
  const isDonation = item.type === '기부';
  const isClickable = item.type === '나눔';

  return (
    <TouchableOpacity onPress={onPress} disabled={!isClickable} activeOpacity={0.7}>
      <View style={styles.transactionItem}>
        <View style={[styles.typeTag, isDonation ? styles.donationTag : styles.shareTag]}>
          <Text style={styles.typeText}>{item.type}</Text>
        </View>
        <Text style={[styles.amountText, { color: isDonation ? '#D32F2F' : PRIMARY_COLOR }]}>
          {isDonation ? '+' : '-'} {formatNumber(item.amount)}원
        </Text>
        <Text style={styles.dateText}>{item.date.replace(/-/g, '/')}</Text>
      </View>
    </TouchableOpacity>
  );
};

const StoreLedgerScreen = ({ route, navigation }) => {
  const { storeName, storeId, dongName } = route.params;
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(
    useCallback(() => {
      const fetchTransactions = () => {
        setIsLoading(true);
        setError(null);
        setTimeout(() => {
          const sortedData = mockTransactionsData.sort((a, b) => new Date(a.date) - new Date(b.date));
          setTransactions(sortedData);
          setIsLoading(false);
        }, 500);
      };
      
      fetchTransactions();
    }, [storeId])
  );
  
  const summary = useMemo(() => {
    let donationCount = 0;
    let shareCount = 0;
    transactions.forEach(item => {
      if (item.type === '기부') donationCount++;
      else if (item.type === '나눔') shareCount++;
    });
    return { donationCount, shareCount };
  }, [transactions]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.storeTitle}>{storeName || '가게 이름'}</Text>
        <View style={styles.summaryContainer}>
            <Text style={styles.summaryText}>총 기부 {summary.donationCount}건</Text>
            <Text style={styles.summaryText}>총 나눔 {summary.shareCount}건</Text>
        </View>
      </View>

      <View style={styles.ledgerContainer}>
        {/* 👇 이 부분에 로딩 및 리스트 표시 로직을 다시 추가했습니다. */}
        {isLoading ? (
          <ActivityIndicator style={{ marginTop: 50 }} size="large" color={PRIMARY_COLOR} />
        ) : error ? (
          <Text style={styles.emptyText}>{error}</Text>
        ) : (
          <FlatList
            ListHeaderComponent={<Text style={styles.ledgerTitle}>전체</Text>}
            data={transactions}
            renderItem={({ item }) => (
              <TransactionItem 
                item={item}
                onPress={
                  item.type === '나눔' 
                    ? () => navigation.navigate('UsageDetail', { 
                        storeName: storeName, 
                        item: item, 
                        dongName: dongName
                      })
                    : null
                }
              />
            )}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            ListEmptyComponent={<Text style={styles.emptyText}>거래 내역이 없습니다.</Text>}
          />
        )}
      </View>

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('UsageEntry', { storeName, storeId })}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    paddingTop: Platform.OS === 'android' ? 40 : 60,
    paddingBottom: 24,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 30 : 50,
    left: 16,
    zIndex: 10,
    padding: 8,
  },
  backButtonText: {
    fontSize: 32,
    color: PRIMARY_COLOR,
    fontWeight: 'bold',
  },
  storeTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  summaryText: {
    fontSize: 16,
    color: '#6B7280',
  },
  ledgerContainer: {
    flex: 1,
    backgroundColor: '#E0F7FA',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24
  },
  ledgerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00796B',
    marginBottom: 16,
    paddingHorizontal: 16
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12
  },
  typeTag: {
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 12
  },
  donationTag: { backgroundColor: '#FFCDD2' },
  shareTag: { backgroundColor: '#BBDEFB' },
  typeText: { fontWeight: 'bold', fontSize: 14 },
  amountText: { flex: 1, fontSize: 16, fontWeight: '600' },
  dateText: { fontSize: 14, color: '#6B7280' },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 40,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8
  },
  fabIcon: {
    color: '#FFFFFF',
    fontSize: 32,
    lineHeight: 34
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#6B7280'
  }
});

export default StoreLedgerScreen;