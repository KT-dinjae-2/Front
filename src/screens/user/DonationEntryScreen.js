import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

// 💡 백엔드 서버의 실제 주소로 변경해야 합니다.
const API_BASE_URL = 'http://43.202.137.139:8000/api';

const DonationEntryScreen = ({ navigation }) => {
  // 1. Mock 데이터를 제거하고, API로부터 받아온 데이터를 저장할 state만 남깁니다.
  const [dongs, setDongs] = useState([]);
  const [stores, setStores] = useState([]);

  const [selectedDongId, setSelectedDongId] = useState();
  const [selectedStoreId, setSelectedStoreId] = useState();
  
  const [donationAmount, setDonationAmount] = useState('');
  const [donationCode, setDonationCode] = useState('');

  // 로딩 및 에러 상태 추가
  const [isLoadingDongs, setIsLoadingDongs] = useState(true);
  const [isLoadingStores, setIsLoadingStores] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2. 앱이 시작될 때 전체 동(dong) 목록을 서버에서 받아오는 기능
  useEffect(() => {
    const fetchDongs = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/dongs/`);
        // 백엔드에서 받은 dong_name을 name으로, id를 id로 매핑
        const formattedDongs = response.data.map(dong => ({ id: dong.id, name: dong.dong_name }));
        setDongs(formattedDongs);
      } catch (error) {
        console.error("동 목록을 불러오는 중 오류 발생:", error);
        Alert.alert("오류", "동 목록을 불러오는 데 실패했습니다.");
      } finally {
        setIsLoadingDongs(false);
      }
    };
    fetchDongs();
  }, []); // []를 비워두어 컴포넌트가 처음 마운트될 때 한 번만 실행되도록 설정

  // 3. 동(dong)이 선택되면, 해당 동에 속한 가게 목록을 서버에서 받아옴
  const handleDongChange = async (dongId) => {
    setSelectedDongId(dongId);
    setStores([]); // 가게 목록 초기화
    setSelectedStoreId(null);

    if (dongId) {
      setIsLoadingStores(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/dongs/${dongId}/stores/`);
        // 백엔드에서 받은 store_name을 name으로, id를 id로 매핑
        const formattedStores = response.data.map(store => ({ id: store.id, name: store.store_name }));
        setStores(formattedStores);
      } catch (error) {
        console.error("가게 목록을 불러오는 중 오류 발생:", error);
        Alert.alert("오류", "가게 목록을 불러오는 데 실패했습니다.");
      } finally {
        setIsLoadingStores(false);
      }
    }
  };

  const handleDonate = async () => {
    // ... (기존 handleDonate 로직은 대부분 동일)
    if (isSubmitting) return;

    if (!selectedDongId || !selectedStoreId || !donationAmount) {
      Alert.alert('입력 오류', '모든 필수 항목을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    const donationData = {
      dong: selectedDongId,
      store: selectedStoreId,
      amount: parseInt(donationAmount, 10),
      donation_date: new Date().toISOString().split('T')[0],
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/donation/create/`, donationData);
      if (response.status === 201) {
        Alert.alert('기부 완료', '기부 내역이 성공적으로 등록되었습니다!');
        setSelectedDongId(null);
        setSelectedStoreId(null);
        setStores([]);
        setDonationAmount('');
        setDonationCode('');
      }
    } catch (error) {
      console.error('기부 처리 중 오류 발생:', error);
      Alert.alert('오류', '기부 내역 등록 중 문제가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Image source={require('../../../assets/images/white-small-logo.png')} style={styles.logo} />
        <Text style={styles.title}>성동 원플러스원</Text>
        <Text style={styles.subtitle}>기부 내역 입력</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.formContainer}>
          <Text style={styles.label}>동을 선택해 주세요</Text>
          <View style={styles.pickerContainer}>
            {isLoadingDongs ? (
              <ActivityIndicator style={{ paddingVertical: 14 }} />
            ) : (
              <Picker selectedValue={selectedDongId} onValueChange={(itemValue) => handleDongChange(itemValue)}>
                <Picker.Item label="동을 선택하세요" value={null} color="#888" />
                {dongs.map((dong) => <Picker.Item key={dong.id} label={dong.name} value={dong.id} />)}
              </Picker>
            )}
          </View>
          
          <Text style={styles.label}>가게를 선택해 주세요</Text>
          <View style={styles.pickerContainer}>
            {isLoadingStores ? (
               <ActivityIndicator style={{ paddingVertical: 14 }} />
            ) : (
              <Picker selectedValue={selectedStoreId} onValueChange={(itemValue) => setSelectedStoreId(itemValue)} enabled={!isLoadingStores && stores.length > 0}>
                <Picker.Item label={selectedDongId ? "가게를 선택하세요" : "동을 먼저 선택해주세요"} value={null} color="#888" />
                {stores.map((store) => <Picker.Item key={store.id} label={store.name} value={store.id} />)}
              </Picker>
            )}
          </View>

          <Text style={styles.label}>기부 금액을 적어주세요</Text>
          <TextInput style={styles.input} placeholder="기부 금액" keyboardType="number-pad" value={donationAmount} onChangeText={setDonationAmount} />
          <Text style={styles.label}>기부 코드를 입력해주세요  (가게에 문의해주세요)</Text>
          <TextInput style={styles.input} placeholder="기부 코드" value={donationCode} onChangeText={setDonationCode}/>
        </View>

        <TouchableOpacity style={[styles.button, isSubmitting && styles.disabledButton]} onPress={handleDonate} disabled={isSubmitting}>
          {isSubmitting ? <ActivityIndicator color="#FFFFFF"/> : <Text style={styles.buttonText}>기부 참여하기</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// 스타일 코드는 기존과 동일하게 유지합니다.
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { backgroundColor: '#228B22', paddingVertical: 30, paddingTop: 50, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 51, height: 51, resizeMode: 'contain', marginBottom: 12 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#FFFFFF' },
  subtitle: { fontSize: 18, color: '#FFFFFF' },
  container: { flexGrow: 1, padding: 24 },
  formContainer: { width: '100%', marginBottom: 32 },
  label: { fontSize: 16, fontWeight: '500', color: '#333', marginBottom: 8, marginLeft: 4 },
  pickerContainer: { borderWidth: 1.5, borderColor: '#228B22', borderRadius: 12, marginBottom: 20, justifyContent: 'center', backgroundColor: '#FFF' },
  input: { borderWidth: 1.5, borderColor: '#228B22', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, backgroundColor: '#FFF', marginBottom: 20 },
  button: { backgroundColor: '#228B22', padding: 18, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  disabledButton: { backgroundColor: '#a5d6a7' },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});

export default DonationEntryScreen;