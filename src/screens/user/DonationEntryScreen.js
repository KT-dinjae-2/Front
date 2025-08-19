import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const API_BASE_URL = 'http://43.202.139.8000/api';
const CORRECT_DONATION_CODE = "1234";

// --- 커스텀 UI 컴포넌트 ---

// '동' 또는 '가게'를 선택하기 위한 예쁜 버튼
const CustomSelectorButton = ({ label, value, onPress }) => (
  <TouchableOpacity style={styles.dropdown} onPress={onPress}>
    <Text style={value ? styles.dropdownText : styles.dropdownPlaceholder}>
      {value ? value.name : label}
    </Text>
    <Text style={styles.dropdownIcon}>▼</Text>
  </TouchableOpacity>
);

// '동' 또는 '가게' 목록을 보여주는 모달
const SelectorModal = ({ visible, title, data, onSelect, onClose }) => (
  <Modal
    transparent={true}
    visible={visible}
    animationType="fade"
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalCloseButton}>닫기</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={data}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.modalItem} onPress={() => onSelect(item)}>
              <Text style={styles.modalItemText}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  </Modal>
);

const DonationEntryScreen = ({ navigation }) => {
  const [dongs, setDongs] = useState([]);
  const [storesForDong, setStoresForDong] = useState([]);

  const [selectedDong, setSelectedDong] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  
  const [donationAmount, setDonationAmount] = useState('');
  const [donationCode, setDonationCode] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isStoreLoading, setIsStoreLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 모달 상태 관리
  const [modalVisible, setModalVisible] = useState(false);
  const [modalInfo, setModalInfo] = useState({ title: '', data: [], onSelect: null });

  useEffect(() => {
    const fetchDongs = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_BASE_URL}/dongs/`);
        setDongs(response.data);
      } catch (error) {
        console.error("동 목록 로딩 오류:", error);
        Alert.alert("오류", "동 목록을 불러오는 데 실패했습니다.", [{ text: '확인', onPress: () => navigation.goBack() }]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDongs();
  }, [navigation]);

  const handleSelectDong = async (dong) => {
    setSelectedDong(dong);
    setSelectedStore(null); // 동을 바꾸면 가게 선택 초기화
    setModalVisible(false);
    
    setIsStoreLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/dongs/${dong.id}/stores/`);
      setStoresForDong(response.data);
    } catch (error) {
      console.error("가게 목록 불러오는 중 오류 발생:", error);
      Alert.alert("오류", "가게 목록을 불러오는 데 실패했습니다.");
    } finally {
      setIsStoreLoading(false);
    }
  };
  
  const handleSelectStore = (store) => {
    setSelectedStore(store);
    setModalVisible(false);
  };

  const openDongSelector = () => {
    setModalInfo({
      title: '동을 선택해 주세요',
      data: dongs,
      onSelect: handleSelectDong,
    });
    setModalVisible(true);
  };
  
  const openStoreSelector = () => {
    if (!selectedDong) {
      Alert.alert('알림', '동을 먼저 선택해주세요.');
      return;
    }
    setModalInfo({
      title: '가게를 선택해 주세요',
      data: storesForDong,
      onSelect: handleSelectStore,
    });
    setModalVisible(true);
  };

  const handleCompleteDonation = () => {
    if (!selectedDong || !selectedStore || !donationAmount || !donationCode) {
      Alert.alert('입력 오류', '모든 항목을 입력 및 선택해주세요.');
      return;
    }
    
    if (donationCode !== CORRECT_DONATION_CODE) {
      Alert.alert('코드 오류', '기부 코드가 올바르지 않습니다.');
      return;
    }

    Alert.alert('기부 확인', '입력하신 내용으로 기부하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '확인',
        onPress: async () => {
          setIsSubmitting(true);
          const donationData = {
            dong: selectedDong.id,
            store: selectedStore.id,
            amount: parseInt(donationAmount, 10),
            donation_date: new Date().toISOString().split('T')[0],
          };
          try {
            const response = await axios.post(`${API_BASE_URL}/donation/create/`, donationData);
            if (response.status === 201) {
              Alert.alert('기부 완료', '소중한 마음이 성공적으로 전달되었습니다.');
              navigation.goBack();
            } else {
               Alert.alert('오류', '서버에서 예상치 못한 응답을 받았습니다.');
            }
          } catch (error) {
            console.error('기부 처리 오류:', error.response?.data || error.message);
            Alert.alert('오류', '기부 내역 등록 중 문제가 발생했습니다.');
          } finally {
            setIsSubmitting(false);
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
          <ActivityIndicator style={{flex: 1}} size="large" color={PRIMARY_COLOR}/>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <SelectorModal
        visible={modalVisible}
        title={modalInfo.title}
        data={modalInfo.data}
        onSelect={modalInfo.onSelect}
        onClose={() => setModalVisible(false)}
      />

      <ScrollView style={styles.container}>
        <View style={styles.infoCard}>
          <Image
            source={require('../../../assets/images/original-logo.png')}
            style={styles.cardLogo}
          />
          <Text style={styles.cardTitle}>성동 원플러스원</Text>
          <Text style={styles.cardSubtitle}>기부 내역 입력</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>동을 선택해 주세요</Text>
            <CustomSelectorButton
              label="눌러서 선택하기"
              value={selectedDong}
              onPress={openDongSelector}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>가게를 선택해 주세요</Text>
            {isStoreLoading ? (
              <ActivityIndicator style={{marginTop: 10}}/>
            ) : (
              <CustomSelectorButton
                label={selectedDong ? "눌러서 선택하기" : "동을 먼저 선택하세요"}
                value={selectedStore}
                onPress={openStoreSelector}
              />
            )}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>기부 금액을 적어주세요</Text>
            <TextInput
              style={styles.textInput}
              placeholder="기부 금액"
              keyboardType="number-pad"
              value={donationAmount}
              onChangeText={setDonationAmount}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>기부 코드를 입력해주세요</Text>
            <View style={styles.codeContainer}>
              <TextInput
                style={[styles.textInput, {flex: 1}]}
                placeholder="기부 코드"
                keyboardType="number-pad"
                value={donationCode}
                onChangeText={setDonationCode}
              />
              <TouchableOpacity 
                style={styles.confirmButton} 
                onPress={() => {
                  if(donationCode === CORRECT_DONATION_CODE) Alert.alert('성공', '코드가 확인되었습니다.');
                  else Alert.alert('오류', '코드가 올바르지 않습니다.');
                }}
              >
                <Text style={styles.confirmButtonText}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && styles.disabledButton]} 
          onPress={handleCompleteDonation}
          disabled={isSubmitting}
        >
          {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>기부 참여하기</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// --- 스타일 시트 ---
const PRIMARY_COLOR = '#1A237E';

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1 },
  infoCard: {
    backgroundColor: PRIMARY_COLOR,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingVertical: 30,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  cardLogo: { width: 50, height: 50, resizeMode: 'contain', marginBottom: 16 },
  cardTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 },
  cardSubtitle: { fontSize: 16, color: '#E8EAF6' },
  form: { padding: 24, paddingBottom: 100 }, // 버튼에 가려지지 않도록 하단 여백 추가
  inputGroup: { marginBottom: 24 },
  label: { fontSize: 14, color: '#555', marginBottom: 8, fontWeight: '500' },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D1D1',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 50,
  },
  dropdownText: { fontSize: 16, color: '#333' },
  dropdownPlaceholder: { fontSize: 16, color: '#999' },
  dropdownIcon: { fontSize: 16, color: '#555' },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D1D1',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 50,
    fontSize: 16,
  },
  codeContainer: { flexDirection: 'row', alignItems: 'center' },
  confirmButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 16,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginLeft: 8,
  },
  confirmButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  
  bottomButtonContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  submitButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  disabledButton: { backgroundColor: '#5C6BC0' },

  // --- 모달 스타일 ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxHeight: '70%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    fontSize: 16,
    color: PRIMARY_COLOR,
  },
  modalItem: {
    paddingVertical: 16,
  },
  modalItemText: {
    fontSize: 16,
  },
});

export default DonationEntryScreen;