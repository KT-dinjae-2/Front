import React from 'react';
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const WelcomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* 콘텐츠 영역 (로고) */}
        <View style={styles.content}>
          <Image
            source={require('../../../assets/images/official-logo.png')}
            style={styles.logo}
          />
        </View>

        {/* 버튼 영역 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('DonationEntry')}
          >
            <Text style={styles.buttonText}>기부 시작하기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.adminButton]}
            onPress={() => navigation.navigate('AdminLogin')}
          >
            <Text style={[styles.buttonText, styles.adminButtonText]}>관리자 로그인</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.gvtiButton}
            onPress={() => navigation.navigate('GVTI')}
          >
            <Text style={styles.gvtiButtonText}>🎁 내 기부 유형 알아보기 (GVTI)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.introLink}
            onPress={() => navigation.navigate('ProjectIntro')}
          >
            <Text style={styles.introLinkText}>원플러스원 사업 소개 보기 〉</Text>
          </TouchableOpacity>
        </View>
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
    alignItems: 'center',
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  logo: {
    width: '60%', 
    resizeMode: 'contain',
  },
  buttonContainer: {
    width: '100%',
    paddingBottom: 20,
    paddingHorizontal: 20, // 좌우 여백 추가
  },
  button: {
    backgroundColor: '#2A3C72', // 이미지의 '기부 시작하기' 버튼 색상으로 변경
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  adminButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#2A3C72', // 이미지의 '관리자 로그인' 테두리 색상으로 변경
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  adminButtonText: {
    color: '#2A3C72', // 이미지의 '관리자 로그인' 텍스트 색상으로 변경
  },
  gvtiButton: {
    backgroundColor: '#E8EAF6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  gvtiButtonText: { color: '#2A3C72', fontSize: 16, fontWeight: 'bold' },
  introLink: { alignItems: 'center', paddingVertical: 12 },
  introLinkText: { color: '#2A3C72', fontSize: 15, fontWeight: '600' },
});

export default WelcomeScreen;