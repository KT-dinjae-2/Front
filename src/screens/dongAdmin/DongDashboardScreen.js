import React from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

const StoreCard = ({ item, onPress }) => (
  <View style={styles.card}>
    <Text style={styles.storeName}>{item.name}</Text>
    <View style={styles.infoRow}>
      <Text style={styles.infoText}>기부건수: {item.donationCount}건</Text>
      <Text style={styles.infoText}>나눔건수: {item.shareCount}건</Text>
    </View>
    <View style={styles.infoRow}>
      <Text style={styles.infoText}>기부금액: {formatNumber(item.donationAmount)}원</Text>
      <Text style={styles.infoText}>나눔금액: {formatNumber(item.shareAmount)}원</Text>
    </View>
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>나눔 내역 입력</Text>
    </TouchableOpacity>
  </View>
);

const DongDashboardScreen = ({ route, navigation }) => {
  const { dongName } = route.params; // 로그인 화면에서 전달받은 동 이름
  const dongData = mockData[dongName] || { totalDonations: 0, stores: [] }; // 해당 동의 데이터 가져오기

  const handleCardPress = (store) => {
    navigation.navigate('StoreLedger', { storeId: store.id, storeName: store.name });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>{dongName}</Text>
        <Text style={styles.subtitle}>총 기부건수: {dongData.totalDonations}</Text>
      </View>
      <FlatList
        data={dongData.stores} // 해당 동의 가게 목록을 사용
        renderItem={({ item }) => <StoreCard item={item} onPress={() => handleCardPress(item)} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>아직 등록된 가게가 없습니다.</Text>}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F8FA' },
  header: { paddingHorizontal: 24, paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#000' },
  subtitle: { fontSize: 16, color: '#555', marginTop: 4 },
  listContainer: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  storeName: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  infoText: { fontSize: 15, color: '#333' },
  button: { backgroundColor: '#E9F5FF', paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  buttonText: { color: '#007AFF', fontSize: 16, fontWeight: '500' },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
  }
});

export default DongDashboardScreen;