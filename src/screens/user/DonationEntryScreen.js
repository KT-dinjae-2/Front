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

// 백엔드 API 클라이언트
import api from '../../api/client';
import BackButton from '../../components/BackButton';


const CORRECT_DONATION_CODE = "1234";

// --- 커스텀 UI 컴포넌트 ---
const CustomSelectorButton = ({ label, value, onPress }) => (
  <TouchableOpacity style={styles.dropdown} onPress={onPress}>
    <Text style={value ? styles.dropdownText : styles.dropdownPlaceholder}>
      {value ? value.name : label}
    </Text>
    <Text style={styles.dropdownIcon}>▼</Text>
  </TouchableOpacity>
);

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
          style={{ flex: 1 }}
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

// --- 1. 기부 확인을 위한 맞춤형 팝업(모달) 컴포넌트 추가 ---
const ConfirmationModal = ({ visible, onCancel, onConfirm, details }) => {
    if (!details) return null;

    return (
        <Modal transparent={true} visible={visible} onRequestClose={onCancel} animationType="fade">
            <View style={styles.modalBackdrop}>
                <View style={styles.popupModalContent}>
                    <Text style={styles.modalTitle}>기부 확인</Text>
                    <Text style={styles.modalMessage}>
                        {`동: ${details.dongName}\n가게: ${details.storeName}\n금액: ${details.amount.toLocaleString()}원`}
                    </Text>
                    <Text style={styles.modalSubMessage}>이대로 기부하시겠습니까?</Text>
                    <View style={styles.modalButtonContainer}>
                        <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={onCancel}>
                            <Text style={styles.cancelButtonText}>취소</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalButton, styles.confirmButton]} onPress={onConfirm}>
                            <Text style={styles.confirmButtonText}>확인</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};


const DonationEntryScreen = ({ navigation, route }) => {
  const [dongs, setDongs] = useState([]);
  const [storesForDong, setStoresForDong] = useState([]);
  const [selectedDong, setSelectedDong] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [donationAmount, setDonationAmount] = useState('');
  const [donationCode, setDonationCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isStoreLoading, setIsStoreLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalInfo, setModalInfo] = useState({ title: '', data: [], onSelect: null });
  
  // --- 2. 확인 팝업 상태 관리 ---
  const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);
  const [donationDetails, setDonationDetails] = useState(null);


  useEffect(() => {
    const fetchDongs = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/dongs/');
        setDongs(response.data);
      } catch (e) {
        console.error('동 목록 조회 실패:', e);
        Alert.alert('오류', '동 목록을 불러오지 못했습니다. 서버가 실행 중인지 확인해주세요.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDongs();
  }, []);

  // GVTI 추천 등에서 동/가게를 넘겨받으면 자동으로 선택합니다.
  useEffect(() => {
    const { dongId, dongName, storeId, storeName } = route?.params || {};
    if (!dongId || !storeId) return;

    setSelectedDong({ id: dongId, name: dongName });
    setSelectedStore(null);
    setIsStoreLoading(true);
    (async () => {
      try {
        const response = await api.get(`/dongs/${dongId}/stores/`);
        setStoresForDong(response.data);
      } catch (e) {
        console.error('가게 목록 조회 실패:', e);
      } finally {
        setIsStoreLoading(false);
        setSelectedStore({ id: storeId, name: storeName });
      }
    })();
  }, [route?.params?.dongId, route?.params?.storeId]);

  const handleSelectDong = async (dong) => {
    setSelectedDong(dong);
    setSelectedStore(null);
    setModalVisible(false);
    setIsStoreLoading(true);

    try {
      const response = await api.get(`/dongs/${dong.id}/stores/`);
      setStoresForDong(response.data);
    } catch (e) {
      console.error('가게 목록 조회 실패:', e);
      Alert.alert('오류', '가게 목록을 불러오지 못했습니다.');
      setStoresForDong([]);
    } finally {
      setIsStoreLoading(false);
    }
  };
  
  const handleSelectStore = (store) => {
    setSelectedStore(store);
    setModalVisible(false);
  };

  const openDongSelector = () => {
    setModalInfo({ title: '동 선택', data: dongs, onSelect: handleSelectDong });
    setModalVisible(true);
  };
  
  const openStoreSelector = () => {
    if (!selectedDong) {
      Alert.alert('알림', '동을 먼저 선택해주세요.');
      return;
    }
    setModalInfo({ title: '가게 선택', data: storesForDong, onSelect: handleSelectStore });
    setModalVisible(true);
  };

  // --- 3. 기부 참여하기 버튼 로직 수정 ---
  const handleCompleteDonation = () => {
    if (!selectedDong || !selectedStore || !donationAmount || !donationCode) {
      Alert.alert('입력 오류', '모든 항목을 입력 및 선택해주세요.');
      return;
    }

    if (donationCode !== CORRECT_DONATION_CODE) {
        Alert.alert('코드 오류', '기부 코드가 올바르지 않습니다.');
        return;
    }

    const numericAmount = parseInt(donationAmount.replace(/,/g, ''), 10);
    if (isNaN(numericAmount) || numericAmount <= 0) {
        Alert.alert('입력 오류', '올바른 금액을 입력해주세요.');
        return;
    }

    // 확인 팝업에 보낼 정보를 저장하고, 팝업을 켭니다.
    setDonationDetails({
        dongName: selectedDong.name,
        storeName: selectedStore.name,
        amount: numericAmount,
    });
    setConfirmModalVisible(true);
  };
  
  // --- 4. 확인 팝업에서 '확인'을 눌렀을 때 실행될 함수 ---
  const executeDonation = async () => {
    setConfirmModalVisible(false); // 확인 팝업 닫기
    setIsSubmitting(true);

    try {
      await api.post('/donation/create/', {
        dong: selectedDong.id,
        store: selectedStore.id,
        amount: donationDetails.amount,
        donation_date: new Date().toISOString().split('T')[0],
      });
      navigation.navigate('DonationSuccess', { amount: donationDetails.amount });
    } catch (e) {
      console.error('기부 등록 실패:', e);
      Alert.alert('오류', '기부 등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
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
      <BackButton onPress={() => navigation.popToTop()} color="#FFFFFF" />
      <SelectorModal
        visible={modalVisible}
        title={modalInfo.title}
        data={modalInfo.data}
        onSelect={modalInfo.onSelect}
        onClose={() => setModalVisible(false)}
      />
      <ScrollView style={styles.container}>
        <View style={styles.infoCard}>
          <Image source={require('../../../assets/images/original-logo.png')} style={styles.cardLogo} />
          <Text style={styles.cardTitle}>성동 원플러스원</Text>
          <Text style={styles.cardSubtitle}>기부 내역 입력</Text>
        </View>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>동 선택</Text>
            <CustomSelectorButton label="눌러서 선택하기" value={selectedDong} onPress={openDongSelector} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>가게 선택</Text>
            {isStoreLoading ? ( <ActivityIndicator style={{marginTop: 10}}/> ) : (
              <CustomSelectorButton label={selectedDong ? "눌러서 선택하기" : "동을 먼저 선택하세요"} value={selectedStore} onPress={openStoreSelector} />
            )}
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>기부 금액</Text>
            <TextInput style={styles.textInput} placeholder="기부 금액" keyboardType="number-pad" value={donationAmount} onChangeText={setDonationAmount} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>기부 코드</Text>
            <TextInput style={styles.textInput} placeholder="기부 코드 (테스트: 1234)" keyboardType="number-pad" value={donationCode} onChangeText={setDonationCode} />
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
      
      {/* 5. 확인 팝업 렌더링 */}
      <ConfirmationModal
        visible={isConfirmModalVisible}
        onCancel={() => setConfirmModalVisible(false)}
        onConfirm={executeDonation}
        details={donationDetails}
      />
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
  form: { padding: 24, paddingBottom: 100 },
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
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 12 },
  modalCloseButton: { fontSize: 16, color: PRIMARY_COLOR },
  modalItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalItemText: {
    fontSize: 16,
    textAlign: 'center',
  },
  // --- 6. 팝업 관련 스타일 추가 ---
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, },
  popupModalContent: { backgroundColor: 'white', borderRadius: 16, padding: 24, width: '100%', alignItems: 'center' },
  modalMessage: { fontSize: 16, color: '#374151', textAlign: 'center', lineHeight: 26, fontWeight: '500', },
  modalSubMessage: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 8, marginBottom: 24 },
  modalButtonContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  modalButton: { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginHorizontal: 6 },
  cancelButton: { backgroundColor: '#E5E7EB' },
  cancelButtonText: { color: '#374151', fontSize: 16, fontWeight: 'bold' },
  confirmButton: { backgroundColor: PRIMARY_COLOR },
  confirmButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});

export default DonationEntryScreen;
