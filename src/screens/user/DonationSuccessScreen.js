import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import BackButton from '../../components/BackButton';

// 이전 화면들과 동일한 메인 색상 사용
const PRIMARY_COLOR = '#1A237E';

const DonationSuccessScreen = ({ route, navigation }) => {
  // route.params가 없는 경우를 대비해 기본값 설정
  const { amount = 0 } = route.params || {};

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackButton onPress={() => navigation.popToTop()} />
      <View style={styles.container}>
        {/* 아이콘을 좀 더 축하하는 느낌으로 변경 */}
        <Text style={styles.icon}>🎉</Text>
        <Text style={styles.title}>참여해주셔서 감사합니다!</Text>
        <Text style={styles.subtitle}>
          {amount.toLocaleString()}원의 소중한 마음이{"\n"}성공적으로 전달되었습니다.
        </Text>
        
        {/* 버튼 스타일을 다른 화면과 통일 */}
        <TouchableOpacity 
          style={styles.button} 
          // 현재 네비게이션 스택의 가장 처음 화면으로 돌아갑니다.
          onPress={() => navigation.popToTop()}
        >
          <Text style={styles.buttonText}>확인</Text>
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
    width: '100%',
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
    lineHeight: 26, // 줄바꿈 시 자연스럽도록 줄 간격 추가
    marginBottom: 40,
  },
  button: {
    backgroundColor: PRIMARY_COLOR, // 메인 색상 적용
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%', // 너비를 100%로 채움
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DonationSuccessScreen;