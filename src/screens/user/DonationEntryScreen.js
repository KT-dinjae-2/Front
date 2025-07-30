import { Picker } from '@react-native-picker/picker';
import * as Location from 'expo-location';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// 공통 컴포넌트 (별도 파일로 분리하여 사용)
const PrimaryButton = ({ title, onPress }) => (
  <TouchableOpacity style={styles.button} onPress={onPress}>
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

const DonationEntryScreen = ({ navigation }) => {
  const [selectedDong, setSelectedDong] = useState();
  const [selectedStore, setSelectedStore] = useState();
  const [donationAmount, setDonationAmount] = useState('');
  const [donationCode, setDonationCode] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);

  const dongs = ['왕십리2동', '마장동', '사근동'];
  const stores = ['송하정', '돌삼겹나들목', '파리바게뜨 왕십리무학점'];

  const handleDonate = () => {
    if (!selectedDong || !selectedStore || !donationAmount) {
      Alert.alert('입력 오류', '모든 필수 항목을 입력해주세요.');
      return;
    }
    // TODO: 기부 처리 API 호출
    console.log("기부 성공");

    // 기부 성공 후, 입력 필드 초기화 및 성공 화면으로 이동
    const amountToPass = parseInt(donationAmount, 10);
    setDonationAmount('');
    setSelectedDong(null);
    setSelectedStore(null);
    setDonationCode('');
    
    navigation.replace('DonationSuccess', { amount: amountToPass });
  };

  const handleAutoFindLocation = async () => {
    setLocationLoading(true);
    // 1. 위치 정보 사용 권한 요청
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 거부', '위치 정보 사용 권한이 거부되었습니다.');
      setLocationLoading(false);
      return;
    }

    // 2. 현재 위치 정보 가져오기
    try {
      const location = await Location.getCurrentPositionAsync({});
      console.log(location.coords.latitude, location.coords.longitude);
      
      // 3. (중요) 좌표 -> 주소 변환 및 주변 가게 찾기
      // 이 기능은 보통 네이버/카카오 지도 API 같은 외부 서비스나
      // 자체 백엔드 서버가 필요합니다. 여기서는 시뮬레이션합니다.
      setTimeout(() => {
        Alert.alert("위치 확인", "현재 위치를 기반으로 '왕십리2동'과 '송하정'을 찾았습니다.");
        setSelectedDong('왕십리2동');
        setSelectedStore('송하정');
        setLocationLoading(false);
      }, 1500); // 1.5초 후 결과 표시

    } catch (error) {
      Alert.alert('오류', '현재 위치를 가져오는 데 실패했습니다.');
      setLocationLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
            <Text style={styles.title}>성동 원플러스원</Text>
            <Text style={styles.subtitle}>기부 내역 입력</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AdminLogin')}>
                <Text style={styles.adminLoginText}>관리자 로그인</Text>
            </TouchableOpacity>
        </View>

        {/* 자동 찾기 버튼 추가 */}
        <TouchableOpacity style={styles.locationButton} onPress={handleAutoFindLocation} disabled={locationLoading}>
          {locationLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.locationButtonText}>📍 현위치로 자동 찾기</Text>
          )}
        </TouchableOpacity>

        <View style={styles.formContainer}>
          {/* 동 선택 */}
          <Text style={styles.label}>동을 선택해 주세요</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedDong}
              onValueChange={(itemValue) => setSelectedDong(itemValue)}
            >
              <Picker.Item label="눌러서 확인하기" value={null} />
              {dongs.map((dong, index) => (
                <Picker.Item key={index} label={dong} value={dong} />
              ))}
            </Picker>
          </View>

          {/* 가게 선택 */}
          <Text style={styles.label}>가게를 선택해 주세요</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedStore}
              onValueChange={(itemValue) => setSelectedStore(itemValue)}
            >
              <Picker.Item label="눌러서 확인하기" value={null} />
              {stores.map((store, index) => (
                <Picker.Item key={index} label={store} value={store} />
              ))}
            </Picker>
          </View>

          {/* 기부 금액 */}
          <Text style={styles.label}>기부 금액을 적어주세요</Text>
          <TextInput
            style={styles.input}
            placeholder="기부 금액"
            keyboardType="number-pad"
            value={donationAmount}
            onChangeText={setDonationAmount}
          />

          {/* 기부 코드 */}
          <Text style={styles.label}>기부 코드를 입력해주세요</Text>
           <View style={styles.codeInputContainer}>
            <TextInput
                style={[styles.input, styles.codeInput]}
                placeholder="기부 코드"
                value={donationCode}
                onChangeText={setDonationCode}
            />
            <TouchableOpacity style={styles.codeConfirmButton}>
                <Text style={styles.codeConfirmButtonText}>확인</Text>
            </TouchableOpacity>
           </View>
        </View>

        <PrimaryButton title="기부 참여하기" onPress={handleDonate} />
      </ScrollView>
    </SafeAreaView>
  );
};

// 스타일 시트
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  container: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    color: '#555',
  },
  adminLoginText: {
    marginTop: 16,
    color: '#007AFF',
    fontSize: 16,
  },
  formContainer: {
    marginBottom: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 20,
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFF',
    marginBottom: 20,
  },
  codeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  codeInput: {
    flex: 1,
    marginRight: 8,
    marginBottom: 0, // 컨테이너에 마진이 있으므로 제거
  },
  codeConfirmButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#6C757D',
    borderRadius: 8,
  },
  codeConfirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  locationButton: {
    backgroundColor: '#28a745',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  locationButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DonationEntryScreen;