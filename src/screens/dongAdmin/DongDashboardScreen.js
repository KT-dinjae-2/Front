import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';

// 실제 앱에서는 이 데이터를 API로 받아와야 합니다.
const mockData = [
  { id: '1', name: '송하정', donationCount: 3, donationAmount: 30000, shareCount: 2, shareAmount: 20000 },
  { id: '2', name: '돌삼겹나들목', donationCount: 2, donationAmount: 40000, shareCount: 0, shareAmount: 0 },
  { id: '3', name: '파리바게뜨 왕십리무학점', donationCount: 4, donationAmount: 50000, shareCount: 5, shareAmount: 50000 },
];

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

  const handleCardPress = (store) => {
    navigation.navigate('StoreLedger', { storeId: store.id, storeName: store.name });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>{dongName}</Text>
        <Text style={styles.subtitle}>총 기부건수: 9</Text>
      </View>
      <FlatList
        data={mockData}
        renderItem={({ item }) => <StoreCard item={item} onPress={() => handleCardPress(item)} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
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
});

export default DongDashboardScreen;