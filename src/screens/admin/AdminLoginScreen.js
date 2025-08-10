import { useState } from 'react';
import { Alert, FlatList, Image, Modal, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// --- 데이터 구조 변경 ---
// 각 동의 이름과 서버 DB에 저장된 실제 ID를 연결하는 객체를 만듭니다.
const DONG_INFO = {
  '왕십리2동': 1,
  '마장동': 2,
  '왕십리도선동': 3,
  // 실제 DB에 맞게 다른 동과 ID를 추가하세요.
};
// dongs 배열은 DONG_INFO의 키(이름) 목록으로 만듭니다.
const dongs = Object.keys(DONG_INFO);


const AdminLoginScreen = ({ navigation }) => {
  const [region, setRegion] = useState('왕십리2동');
  const [regionCode, setRegionCode] =useState('');
  const [showPicker, setShowPicker] = useState(false);

  // --- 로그인 로직 수정 ---
  const handleLogin = () => {
    if (regionCode.toUpperCase() === 'SUPER') {
      navigation.replace('SuperAdminDashboard');
      return;
    }

    // 선택된 동 이름(region)을 사용해 DONG_INFO 객체에서 ID를 찾습니다.
    const selectedDongId = DONG_INFO[region];

    if (selectedDongId && regionCode === '1234') {
      // 다음 화면으로 dongName과 함께 dongId를 전달합니다.
      navigation.replace('DongDashboard', { 
        dongName: region,
        dongId: selectedDongId 
      });
    } else {
      Alert.alert('로그인 실패', '지역 또는 코드 정보가 일치하지 않습니다.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Image source={require('../../../assets/images/small-logo.png')} style={styles.logo} />
        <Text style={styles.title}>원플러스원{'\n'}관리자 로그인</Text>
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>로그인 지역</Text>
          <View style={styles.rowBetween}>
            <Text style={styles.fieldLabel}>지역/동</Text>
              <TouchableOpacity style={styles.dropdownRow} onPress={() => setShowPicker(true)}>
                <Text style={styles.fieldValue}>{region}</Text>
                <Text style={styles.icon}>★</Text>
                <Text style={styles.icon}>{'>'}</Text>
              </TouchableOpacity>
          </View>
          <Text style={[styles.sectionLabel, { marginTop: 32 }]}>지역 코드 입력</Text>
          <TextInput
            style={styles.inputUnderline}
            placeholder="Value"
            placeholderTextColor="#4CAF50"
            value={regionCode}
            onChangeText={setRegionCode}
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>로그인</Text>
        </TouchableOpacity>

        {showPicker && (
          <Modal transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>지역 선택</Text>
                <FlatList
                  data={dongs}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.modalItem}
                      onPress={() => {
                        setRegion(item);
                        setShowPicker(false);
                      }}
                    >
                      <Text style={styles.modalItemText}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <Text style={styles.modalClose}>닫기</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
      </View>
    </SafeAreaView>
  );
};

// 스타일 코드는 그대로 유지합니다.
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, alignItems: 'center', padding: 24 },
  logo: { width: 51, height: 51, resizeMode: 'contain', marginTop: 40, marginBottom: 16 },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', color: '#111', marginBottom: 32 },
  card: { width: '100%', backgroundColor: '#E8F5E9', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 48 },
  sectionLabel: { fontSize: 14, color: '#000', marginBottom: 8, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  modalTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12, textAlign: 'center', color: '#333' },
  modalClose: { marginTop: 12, textAlign: 'center', color: '#4CAF50', fontWeight: 'bold', fontSize: 16 },
  modalItem: { paddingVertical: 12, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  modalItemText: { fontSize: 16, color: '#4CAF50', textAlign: 'center' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#4CAF50', paddingVertical: 12 },
  fieldLabel: { color: '#4CAF50', fontSize: 14 },
  dropdownRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  fieldValue: { fontSize: 16, color: '#4CAF50', marginRight: 8 },
  icon: { fontSize: 16, color: '#4CAF50' },
  inputUnderline: { borderBottomWidth: 1, borderBottomColor: '#4CAF50', fontSize: 16, color: '#4CAF50', paddingVertical: 8 },
  button: { backgroundColor: '#4CAF50', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24, width: '100%' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default AdminLoginScreen;