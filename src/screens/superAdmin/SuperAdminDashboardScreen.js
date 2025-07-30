import React from 'react';
import { Alert, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// 가상 데이터
const mockSuperAdminData = [
  { id: '1', dongName: '왕십리도선동', storeCount: 8, totalAmount: 516900 },
  { id: '2', dongName: '왕십리2동', storeCount: 7, totalAmount: 580000 },
  { id: '3', dongName: '마장동', storeCount: 8, totalAmount: 690000 },
];

const formatNumber = (num) => num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

const DongCard = ({ item, onPress }) => (
  <View style={styles.card}>
    <Text style={styles.dongName}>{item.dongName}</Text>
    <Text style={styles.infoText}>참여 업체 수: {item.storeCount}</Text>
    <Text style={styles.infoText}>총 기부액: {formatNumber(item.totalAmount)}원</Text>
    <TouchableOpacity style={styles.detailButton} onPress={() => onPress(item)}>
      <Text style={styles.detailButtonText}>업체 별 기부 내역 보기</Text>
    </TouchableOpacity>
  </View>
);

const SuperAdminDashboardScreen = ({ navigation }) => {

  const handleExcelExport = () => {
    // 엑셀 추출 로직은 'xlsx' 같은 라이브러리 설치가 필요합니다.
    Alert.alert('알림', '엑셀 파일 추출 기능이 실행됩니다.');
  };

  const handleCardPress = (dong) => {
    // 동별 대시보드로 이동
    navigation.navigate('DongDashboard', { dongName: dong.dongName });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>전체 기부 내역</Text>
      </View>
      <FlatList
        data={mockSuperAdminData}
        renderItem={({ item }) => <DongCard item={item} onPress={handleCardPress} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListFooterComponent={
          <TouchableOpacity style={styles.excelButton} onPress={handleExcelExport}>
            <Text style={styles.excelButtonText}>엑셀 파일 추출</Text>
          </TouchableOpacity>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F8FA' },
  header: { padding: 24, borderBottomWidth: 1, borderBottomColor: '#E0E0E0', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#000' },
  listContainer: { padding: 24 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  dongName: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  infoText: { fontSize: 16, color: '#333', marginBottom: 4 },
  detailButton: { backgroundColor: '#E9F5FF', paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  detailButtonText: { color: '#007AFF', fontSize: 16, fontWeight: '500' },
  excelButton: { backgroundColor: '#28a745', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  excelButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});

export default SuperAdminDashboardScreen;