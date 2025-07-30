import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const AdminLoginScreen = ({ navigation }) => {
  const [region, setRegion] = useState('왕십리2동'); // 기본 선택
  const [regionCode, setRegionCode] = useState('');
  const dongs = ['왕십리2동', '마장동', '왕십리도선동']; // 선택 가능한 동 목록

  const handleLogin = () => {
    // 전체 관리자 로그인
    if (regionCode.toUpperCase() === 'SUPER') {
      navigation.replace('SuperAdminDashboard');
      return;
    }
    
    // 동 관리자 로그인 (이제 코드는 '1234'로 통일)
    if (dongs.includes(region) && regionCode === '1234') {
      navigation.replace('DongDashboard', { dongName: region });
    } else {
      Alert.alert('로그인 실패', '지역 또는 코드 정보가 일치하지 않습니다.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>원플러스원 관리자 로그인</Text>

        <View style={styles.card}>
          <Text style={styles.label}>로그인 지역</Text>
          {/* 동 선택을 Picker로 변경 */}
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={region}
              onValueChange={(itemValue) => setRegion(itemValue)}
            >
              {dongs.map((dong, index) => (
                <Picker.Item key={index} label={dong} value={dong} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>지역 코드 입력</Text>
          <TextInput
            style={styles.input}
            placeholder="Value"
            value={regionCode}
            onChangeText={setRegionCode}
            secureTextEntry // 비밀번호처럼 보이지 않게 처리
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>로그인</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, padding: 24 },
  backButton: { position: 'absolute', top: 20, left: 20, zIndex: 1 },
  backButtonText: { fontSize: 24, color: '#333' },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 40, marginTop: 40, color: '#333' },
  card: { backgroundColor: '#F7F8FA', borderRadius: 12, padding: 24, marginBottom: 32 },
  label: { fontSize: 16, color: '#555', marginBottom: 8 },
  regionContainer: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 16, backgroundColor: '#FFF', marginBottom: 20 },
  regionText: { fontSize: 16 },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 20,
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 16, fontSize: 16, backgroundColor: '#FFF' },
  button: { backgroundColor: '#007AFF', padding: 16, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});

export default AdminLoginScreen;