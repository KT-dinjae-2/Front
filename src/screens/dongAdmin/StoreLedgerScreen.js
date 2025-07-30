import React from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
  const amountColor = isDonation ? '#28a745' : '#dc3545'; // 기부: 녹색, 나눔: 빨간색
  const prefix = isDonation ? '+' : '-';

  const handlePress = () => {
    // '나눔' 항목일 경우에만 수정 화면으로 이동
    if (!isDonation) {
      navigation.navigate('UsageEdit', { item });
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} disabled={isDonation}>
      <View style={styles.itemContainer}>
        <Text style={styles.itemType}>{item.type}</Text>
        <Text style={[styles.itemAmount, { color: amountColor }]}>{prefix} {item.amount.toLocaleString()}원</Text>
        <Text style={styles.itemDate}>{item.date}</Text>
      </View>
    </TouchableOpacity>
  );
};

const StoreLedgerScreen = ({ route, navigation }) => {
  const { storeName, storeId } = route.params; // 이전 화면에서 가게 정보 받기
  const ledgerData = mockLedgerData[storeId] || []; // 해당 가게의 장부 데이터 가져오기

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{storeName}</Text>
        <Text style={styles.subtitle}>전체 내역</Text>
      </View>
      
      <FlatList
        data={ledgerData} // 해당 가게의 데이터를 사용
        renderItem={({ item }) => <LedgerItem item={item} navigation={navigation} />} // navigation prop 전달
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>기부/나눔 내역이 없습니다.</Text>}
      />

      {/* 나눔 내역 추가 버튼 (Floating Action Button) */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('UsageEntry', { storeId, storeName })}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  backButton: { position: 'absolute', left: 24, top: 16 },
  backButtonText: { fontSize: 24 },
  title: { fontSize: 22, fontWeight: 'bold' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 4 },
  listContainer: { padding: 24 },
  itemContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  itemType: { fontSize: 16, fontWeight: '500', flex: 1 },
  itemAmount: { fontSize: 16, fontWeight: 'bold', flex: 2, textAlign: 'right' },
  itemDate: { fontSize: 16, color: '#888', flex: 1.5, textAlign: 'right' },
  fab: { position: 'absolute', right: 24, bottom: 40, width: 60, height: 60, borderRadius: 30, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 8 },
  fabText: { fontSize: 30, color: '#FFFFFF' },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
  }
});

export default StoreLedgerScreen;