import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, SafeAreaView, Alert, TouchableOpacity } from 'react-native';

const AdminLoginScreen = ({ navigation }) => {
  const [region, setRegion] = useState('왕십리2동'); // 예시 값
  const [regionCode, setRegionCode] = useState('');

  const handleLogin = () => {
    // 실제 앱에서는 서버에 지역과 코드를 보내 유효성을 검사해야 합니다.
    // 여기서는 코드가 '1234'라고 가정합니다.
    if (region === '왕십리2동' && regionCode === '1234') {
      // 로그인 성공 시, 이전 화면으로 돌아갈 수 없도록 replace 사용
      navigation.replace('DongDashboard', { dongName: region });
    } else {
      Alert.alert('로그인 실패', '지역 코드 정보가 일치하지 않습니다.');
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
          <View style={styles.regionContainer}>
            <Text style={styles.regionText}>{region}</Text>
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
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 16, fontSize: 16, backgroundColor: '#FFF' },
  button: { backgroundColor: '#007AFF', padding: 16, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});

export default AdminLoginScreen;