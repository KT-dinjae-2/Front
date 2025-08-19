import { useState } from 'react';
import { Alert, FlatList, Image, Modal, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// 아이콘 라이브러리를 import 합니다.
import { Ionicons } from '@expo/vector-icons';

import credentials from '../../../assets/login/admin-credentials.json';

const dongs = credentials.dongAdmins;

const AdminLoginScreen = ({ navigation }) => {
  const [region, setRegion] = useState(null);
  const [regionCode, setRegionCode] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  const handleLogin = () => {
    // 슈퍼 관리자 로그인
    if (regionCode.toUpperCase() === credentials.superAdmin.code) {
      navigation.replace('SuperAdminDashboard');
      return;
    }

    // 동 관리자 로그인
    if (!region) {
      Alert.alert('로그인 실패', '로그인할 지역을 선택해주세요.');
      return;
    }

    // 선택된 지역(region)의 코드와 입력된 코드(regionCode)가 일치하는지 확인
    if (region.code === regionCode) {
      navigation.replace('DongDashboard', { 
        dongName: region.name,
        dongId: region.id 
      });
    } else {
      Alert.alert('로그인 실패', '지역 또는 코드 정보가 일치하지 않습니다.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Image source={require('../../../assets/images/original-logo.png')} style={styles.logo} />
        <Text style={styles.title}>원플러스원{'\n'}관리자 로그인</Text>
        
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>로그인 지역</Text>
          <View style={styles.rowBetween}>
            <Text style={styles.fieldLabel}>지역/동</Text>
            <TouchableOpacity style={styles.dropdownRow} onPress={() => setShowPicker(true)}>
              <Text style={region ? styles.fieldValue : styles.placeholder}>
                {region ? region.name : '눌러서 선택하세요'}
              </Text>
              <Text style={styles.icon}>☆</Text>
              <Text style={styles.icon}>〉</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.sectionLabel, { marginTop: 32 }]}>지역 코드 입력</Text>
          <TextInput
            style={styles.inputUnderline}
            placeholder="Value"
            placeholderTextColor="#A0DEDD"
            value={regionCode}
            onChangeText={setRegionCode}
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>로그인</Text>
        </TouchableOpacity>

        {/* 지역 선택 모달 */}
        <Modal visible={showPicker} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                {/* 왼쪽 빈 공간 */}
                <View style={{ width: 30 }} /> 
                {/* 중앙 정렬된 제목 */}
                <Text style={styles.modalTitle}>지역 선택</Text>
                {/* 오른쪽 X 버튼 */}
                <TouchableOpacity style={styles.closeButton} onPress={() => setShowPicker(false)}>
                  <Ionicons name="close" size={24} color="#555" />
                </TouchableOpacity>
              </View>

              <FlatList
                data={dongs}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      setRegion(item);
                      setShowPicker(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, alignItems: 'center', padding: 24, backgroundColor: '#FFFFFF' },
  logo: { width: 51, height: 51, resizeMode: 'contain', marginTop: 40, marginBottom: 16 },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', color: '#111', marginBottom: 32, lineHeight: 40 },
  card: { 
    width: '100%', 
    backgroundColor: '#E0F7FA', 
    borderRadius: 24, 
    padding: 24, 
    paddingBottom: 48 
  },
  sectionLabel: { fontSize: 14, color: '#00796B', marginBottom: 8, fontWeight: '600' },
  rowBetween: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    borderBottomWidth: 1.5, 
    borderBottomColor: '#B2DFDB', 
    paddingVertical: 12 
  },
  fieldLabel: { color: '#00796B', fontSize: 16 },
  dropdownRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  fieldValue: { fontSize: 16, color: '#004D40', fontWeight: '500' },
  placeholder: { fontSize: 16, color: '#80CBC4' },
  icon: { fontSize: 16, color: '#00796B' },
  inputUnderline: { 
    borderBottomWidth: 1.5, 
    borderBottomColor: '#B2DFDB', 
    fontSize: 16, 
    color: '#004D40', 
    paddingVertical: 12,
    fontWeight: '500'
  },
  button: { 
    backgroundColor: '#00796B', 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 24, 
    width: '100%' 
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  
  // --- 모달 스타일 수정 ---
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { 
    width: '90%', // 모달 가로 폭 조정
    backgroundColor: '#fff', 
    borderRadius: 16,
    maxHeight: '60%', // 높이 살짝 조정
    paddingHorizontal: 10, // 좌우 패딩
    paddingVertical: 20, // 상하 패딩
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 15,
    paddingHorizontal: 10, // 헤더 좌우 패딩
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF'
  },
  modalTitle: { 
    flex: 1, // 남은 공간을 모두 차지
    textAlign: 'center', // 텍스트를 중앙 정렬
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#333',
  },
  closeButton: {
    width: 30, // 왼쪽 빈 공간과 동일한 너비
    alignItems: 'flex-end',
  },
  modalItem: { 
    paddingVertical: 16,
    borderBottomWidth: 1, // 구분선 추가
    borderBottomColor: '#F5F5F5', // 구분선 색상
  },
  modalItemText: { 
    fontSize: 16, 
    color: '#333', 
    textAlign: 'center' 
  },
});

export default AdminLoginScreen;