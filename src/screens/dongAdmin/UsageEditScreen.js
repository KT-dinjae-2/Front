import React, { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const UsageEditScreen = ({ route, navigation }) => {
  // 이전 화면에서 수정할 항목의 정보를 받습니다.
  const { item } = route.params;
  
  const [amount, setAmount] = useState(item.amount.toString());
  const [date, setDate] = useState(item.date);
  
  // 현재 날짜를 수정일시로 사용합니다.
  const modificationDate = new Date().toLocaleString('ko-KR');

  const handleEdit = () => {
    if (!amount || !date) {
      Alert.alert('입력 오류', '금액과 날짜를 모두 입력해주세요.');
      return;
    }
    // TODO: API를 통해 수정된 내역을 서버에 전송하는 로직
    console.log(`[수정] ID: ${item.id}, 금액: ${amount}, 날짜: ${date}`);
    Alert.alert('수정 완료', '나눔 내역이 성공적으로 수정되었습니다.', [
      { text: '확인', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>나눔 내역 수정</Text>
      </View>

      <View style={styles.container}>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>현재 나눔 내역</Text>
          <Text style={styles.currentAmount}>{item.amount.toLocaleString()}원</Text>
          <Text style={styles.currentDate}>{item.date}</Text>
        </View>

        <Text style={styles.label}>수정할 금액</Text>
        <TextInput
          style={styles.input}
          placeholder="₩"
          keyboardType="number-pad"
          value={amount}
          onChangeText={setAmount}
        />

        <Text style={styles.label}>수정할 날짜</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY/MM/DD"
          value={date}
          onChangeText={setDate}
        />
        
        <View style={styles.modificationInfo}>
          <Text>최종 수정 일시: {modificationDate}</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleEdit}>
          <Text style={styles.buttonText}>나눔 내역 수정</Text>
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
  infoBox: { alignItems: 'center', padding: 20, backgroundColor: '#FFF', borderRadius: 12, marginBottom: 32, borderWidth: 1, borderColor: '#E0E0E0'},
  infoLabel: { fontSize: 16, color: '#666', marginBottom: 8},
  currentAmount: { fontSize: 28, fontWeight: 'bold', color: '#dc3545' },
  currentDate: { fontSize: 16, color: '#888', marginTop: 4},
  label: { fontSize: 16, color: '#333', marginBottom: 8, fontWeight: '500' },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 16, fontSize: 16, marginBottom: 24 },
  modificationInfo: { alignItems: 'center', marginVertical: 16 },
  button: { backgroundColor: '#007AFF', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});

export default UsageEditScreen;