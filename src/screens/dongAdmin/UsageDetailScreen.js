import React from 'react';
import { Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const PRIMARY_COLOR = '#1A237E'; // 메인 색상

const formatNumber = (num) => num ? num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') : '0';

const UsageDetailScreen = ({ route, navigation }) => {
  // 이전 화면에서 필요한 모든 정보를 받아옵니다.
  const { storeName, item, dongName } = route.params;
  
  // 담당자 정보는 로그인한 동 관리자의 이름(dongName)을 사용합니다.
  const editor = dongName || '담당자 정보 없음';
  // 최종 수정일시는 item 객체에 따라 유동적으로 설정합니다.
  const modificationDate = item.modifiedAt || item.date.replace(/-/g, '/');

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 뒤로가기 버튼은 이제 헤더의 일부가 아니므로 독립적으로 둡니다. */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>‹</Text>
      </TouchableOpacity>
      
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.storeTitle}>{storeName || '가게 이름'}</Text>
        </View>

        <View style={styles.detailContainer}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>나눔 내역</Text>
            <Text style={styles.amountText}>{formatNumber(item.amount)}원</Text>
            <Text style={styles.dateText}>{item.date.replace(/-/g, '/')}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>나눔 등록 내역</Text>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>담당자</Text>
                <Text style={styles.infoValue}>{editor}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>최종 수정 일시</Text>
                <Text style={styles.infoValue}>{modificationDate}</Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={() => navigation.navigate('UsageEdit', { item, dongName })}
        >
          <Text style={styles.editButtonText}>나눔 내역 수정</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// UI 테마에 맞게 스타일 전체 수정
const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#FFFFFF', // 배경 흰색
  },
  container: { 
    flexGrow: 1, 
    paddingBottom: 40,
  },
  backButton: { 
    position: 'absolute',
    top: Platform.OS === 'android' ? 20 : 50,
    left: 16,
    zIndex: 10,
    padding: 8,
  },
  backButtonText: { 
    fontSize: 32, 
    color: '#000000', 
    fontWeight: 'bold' 
  },
  header: { 
    alignItems: 'center', 
    paddingTop: 80, 
    paddingBottom: 40, 
    backgroundColor: '#FFFFFF',
  },
  storeTitle: { 
    fontSize: 34, 
    fontWeight: 'bold', 
    color: '#000000'
  },
  detailContainer: { 
    backgroundColor: '#E0F7FA', // 하늘색 배경
    marginHorizontal: 20, 
    borderRadius: 24, 
    padding: 30 
  },
  section: { 
    marginBottom: 16 
  },
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#00796B', // 포인트 색상
    marginBottom: 20 
  },
  amountText: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: PRIMARY_COLOR, 
    marginBottom: 8 
  },
  dateText: { 
    fontSize: 16, 
    color: '#6B7280' 
  },
  divider: { 
    height: 1.5, 
    backgroundColor: '#FFFFFF', // 흰색 구분선
    marginVertical: 24 
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  editButton: { 
    backgroundColor: PRIMARY_COLOR, 
    borderRadius: 16, 
    paddingVertical: 18, 
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 30,
  },
  editButtonText: { 
    color: '#FFFFFF', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
});

export default UsageDetailScreen;