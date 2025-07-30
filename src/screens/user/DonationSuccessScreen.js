import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const DonationSuccessScreen = ({ route, navigation }) => {
  const { amount } = route.params; // 기부 금액을 이전 화면에서 받아옴

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.icon}>✅</Text>
        <Text style={styles.title}>참여해주셔서 감사합니다!</Text>
        <Text style={styles.subtitle}>
          {/* amount가 숫자가 아닐 경우를 대비한 방어 코드 추가 */}
          {typeof amount === 'number' ? amount.toLocaleString() : amount}원의 소중한 마음이 전달되었습니다.
        </Text>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.navigate('DonationEntry')}
        >
          <Text style={styles.buttonText}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  icon: {
    fontSize: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DonationSuccessScreen;