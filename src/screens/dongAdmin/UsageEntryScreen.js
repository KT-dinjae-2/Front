import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';

const UsageEntryScreen = ({ route, navigation }) => {
  const { storeName, storeId } = route.params;
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0].replace(/-/g, '/')); // 오늘 날짜 기본값

  const handleRegister = () => {
    if (!amount || !date) {
      Alert.alert('입력 오류', '금액과 날짜를 모두 입력해주세요.');
      return;
    }
    // TODO: API를 통해 나눔 내역 서버에 등록하는 로직
    console.log(`[${storeName}(${storeId})] 나눔 내역 등록: ${amount}원, 날짜: ${date}`);
    Alert.alert('등록 완료', '나눔 내역이 성공적으로 등록되었습니다.', [
      { text: '확인', onPress: () => navigation.goBack() } // 등록 후 이전 화면으로 돌아가기
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{storeName}</Text>
      </View>

      <View style={styles.container}>
        <Text style={styles.formTitle}>나눔 내역 등록</Text>
        
        <Text style={styles.label}>나눔 금액</Text>
        <TextInput
          style={styles.input}
          placeholder="₩"
          keyboardType="number-pad"
          value={amount}
          onChangeText={setAmount}
        />

        <Text style={styles.label}>나눔 날짜</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY/MM/DD"
          value={date}
          onChangeText={setDate}
        />
        
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>전체 등록</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F8FA' },
  header: { alignItems: 'center', paddingVertical: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  backButton: { position: 'absolute', left: 24, top: 16 },
  backButtonText: { fontSize: 24 },
  title: { fontSize: 22, fontWeight: 'bold' },
  container: { padding: 24 },
  formTitle: { fontSize: 24, fontWeight: '600', marginBottom: 32 },
  label: { fontSize: 16, color: '#333', marginBottom: 8, fontWeight: '500' },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 16, fontSize: 16, marginBottom: 24 },
  button: { backgroundColor: '#007AFF', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});

export default UsageEntryScreen;