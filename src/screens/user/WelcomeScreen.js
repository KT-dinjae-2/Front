import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const WelcomeScreen = ({ navigation }) => {
  return (
    <LinearGradient
      colors={['#BDE6A4', '#E6F4EA']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.content}>
            <View style={styles.titleContainer}>
              <Text style={styles.titleTop}>성동</Text>
              <Text style={styles.titleBottom}>원플러스원</Text>
            </View>
            <Image
              source={require('../../../assets/images/small-logo.png')}
              style={styles.logo}
            />
          </View>
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
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'flex-start', // 왼쪽 정렬
    marginBottom: 40,
  },
  titleTop: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '500',
    marginLeft: 10, // '원' 글자 시작 위치에 맞추기 위한 왼쪽 여백 조정
  },
  titleBottom: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#098710',
    marginTop: -8,
    textAlign: 'center', // '원플러스원' 중앙 정렬 유지
    width: '100%', // '원플러스원'이 가로 폭 전체를 차지하도록 설정
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  buttonContainer: {
    width: '100%',
    paddingBottom: 40,
  },
  button: {
    backgroundColor: '#098710',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  adminButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#098710',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  adminButtonText: {
    color: '#098710',
  },
});

export default WelcomeScreen;