import React from 'react';
import { Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const formatNumber = (num) => num ? num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') : '0';

const UsageDetailScreen = ({ route, navigation }) => {
  const { storeName, item, dongName } = route.params;
  
  const editor = dongName || '담당자 정보 없음';
  const modificationDate = item.modifiedAt || item.date;

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>‹</Text>
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.container}>
        {/* ✅ 헤더 UI 수정 */}
        <View style={styles.header}>
          <Text style={styles.storeTitle}>{storeName || '가게 이름'}</Text>
          <Text style={styles.cloverIcon}>✤</Text>
        </View>

        {/* ✅ 메인 컨텐츠 컨테이너 스타일 수정 */}
        <View style={styles.detailContainer}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>나눔 내역</Text>
            <Text style={styles.amountText}>{formatNumber(item.amount)}원</Text>
            <Text style={styles.dateText}>{item.date}</Text>
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

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#F4F5F7' 
  },
  container: { 
    flexGrow: 1, 
    paddingBottom: 20,
  },
  backButton: { 
    position: 'absolute',
    top: Platform.OS === 'android' ? 20 : 50,
    left: 16,
    zIndex: 10,
    padding: 8,
  },
  backButtonText: { 
    fontSize: 28, 
    color: '#098710', 
    fontWeight: 'bold' 
  },
  // ✅ 헤더 스타일 수정
  header: { 
    alignItems: 'center', 
    paddingTop: 60, 
    paddingBottom: 20, 
    backgroundColor: '#FFFFFF',
  },
  storeTitle: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: '#1F2937'
  },
  cloverIcon: { 
    fontSize: 30, 
    color: '#098710', 
    marginTop: 12 
  },
  // ✅ 디테일 컨테이너 스타일 수정
  detailContainer: { 
    backgroundColor: '#E8F5E9', 
    margin: 20, 
    borderRadius: 24, 
    padding: 30 
  },
  section: { 
    marginBottom: 16 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#374151', 
    marginBottom: 20 
  },
  amountText: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#1F2937', 
    marginBottom: 8 
  },
  dateText: { 
    fontSize: 18, 
    color: '#6B7280' 
  },
  divider: { 
    height: 1, 
    backgroundColor: '#FFFFFF',
    marginVertical: 24 
  },
  editButton: { 
    backgroundColor: '#098710', 
    borderRadius: 16, 
    paddingVertical: 18, 
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
  },
  editButtonText: { 
    color: '#FFFFFF', 
    fontSize: 18, 
    fontWeight: 'bold' 
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
});

export default UsageDetailScreen;