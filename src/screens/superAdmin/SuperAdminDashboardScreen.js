import React, { useState } from 'react';
import { 
  Alert, 
  FlatList, 
  SafeAreaView, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  Image 
} from 'react-native';

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
    Alert.alert('알림', '엑셀 파일 추출 기능이 실행됩니다.');
  };

  const handleCardPress = (dong) => {
    // 동별 대시보드로 이동
    navigation.navigate('DongDashboard', { dongName: dong.dongName });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Image
          source={require('../../../assets/images/white-small-logo.png')}
          style={styles.logo}
        />
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
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#098710',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#098710',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    alignItems: 'center',
  },
  logo: {
    width: 51,
    height: 51,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  list: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 120, // 엑셀 버튼과 겹치지 않도록 여유 공간 확보
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
  dongName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  detailButton: {
    backgroundColor: '#098710',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  detailButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
  },
  excelButton: {
    backgroundColor: '#098710',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
  },
  excelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SuperAdminDashboardScreen;