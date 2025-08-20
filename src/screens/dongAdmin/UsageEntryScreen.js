import React, { useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Modal, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';

const PRIMARY_COLOR = '#1A237E';

// 숫자 및 날짜 포맷팅 함수
const formatNumber = (num) => {
    if (!num) return '';
    const numericValue = num.toString().replace(/[^0-9]/g, '');
    return numericValue.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
};

// 맞춤형 삭제 확인 팝업(모달) 컴포넌트
const ConfirmationModal = ({ visible, onCancel, onConfirm, item }) => {
    if (!item) return null;

    return (
        <Modal transparent={true} visible={visible} onRequestClose={onCancel} animationType="fade">
            <View style={styles.modalBackdrop}>
                <View style={styles.confirmationModalContent}>
                    <Text style={styles.modalTitle}>삭제 확인</Text>
                    <Text style={styles.modalMessage}>
                        {`금액: ${formatNumber(item.amount) || '0'}원\n날짜: ${item.date.replace(/-/g, '/')}`}
                    </Text>
                    <Text style={styles.modalSubMessage}>이 내역을 정말 삭제하시겠습니까?</Text>
                    <View style={styles.modalButtonContainer}>
                        <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={onCancel}>
                            <Text style={styles.cancelButtonText}>취소</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalButton, styles.confirmButton]} onPress={onConfirm}>
                            <Text style={styles.confirmButtonText}>삭제</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

// 맞춤형 등록 완료 팝업 컴포넌트
const SuccessModal = ({ visible, onConfirm, entryCount }) => {
    return (
        <Modal transparent={true} visible={visible} onRequestClose={onConfirm} animationType="fade">
            <View style={styles.modalBackdrop}>
                <View style={styles.confirmationModalContent}>
                    <Text style={styles.successIcon}>🎉</Text>
                    <Text style={styles.modalTitle}>등록 완료</Text>
                    <Text style={styles.modalSubMessage}>{`${entryCount}개의 나눔 내역이 성공적으로 등록되었습니다.`}</Text>
                    <TouchableOpacity style={[styles.modalButton, styles.okButton]} onPress={onConfirm}>
                        <Text style={styles.okButtonText}>확인</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const UsageEntryScreen = ({ route, navigation }) => {
  const storeName = route.params?.storeName || '가게 이름';
  const storeId = route.params?.storeId || '가게 ID';

  const [entries, setEntries] = useState([
    { id: 1, amount: '', date: new Date().toISOString().split('T')[0] }
  ]);
  
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [currentEntryId, setCurrentEntryId] = useState(null);

  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);

  const addEntry = () => {
    const newEntry = { id: Date.now(), amount: '', date: new Date().toISOString().split('T')[0] };
    setEntries([...entries, newEntry]);
  };

  const handleDeletePress = (id) => {
    if (entries.length <= 1) {
      Alert.alert("삭제 불가", "최소 한 개의 입력란은 필요합니다.");
      return;
    }
    const entryToDelete = entries.find(entry => entry.id === id);
    if (entryToDelete) {
      setItemToDelete(entryToDelete);
      setDeleteModalVisible(true);
    }
  };

  const confirmDeletion = () => {
    if (itemToDelete) {
        setEntries(prevEntries => prevEntries.filter(entry => entry.id !== itemToDelete.id));
    }
    setDeleteModalVisible(false);
    setItemToDelete(null);
  };

  const handleInputChange = (id, field, value) => {
    setEntries(entries.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  const onDayPress = (day) => {
    handleInputChange(currentEntryId, 'date', day.dateString.replace(/-/g, '/'));
    setCalendarVisible(false);
  };

  const showCalendarFor = (id) => {
    setCurrentEntryId(id);
    setCalendarVisible(true);
  };
  
  const handleRegisterAll = () => {
    for (const entry of entries) {
      const numericAmount = parseInt(String(entry.amount).replace(/,/g, ''), 10);
      if (!entry.amount || !entry.date || isNaN(numericAmount) || numericAmount <= 0) {
        Alert.alert('입력 오류', '모든 항목의 금액과 날짜를 올바르게 입력해주세요.');
        return;
      }
    }
    setSuccessModalVisible(true);
  };
  
  const handleSuccessConfirm = () => {
    setSuccessModalVisible(false);
    navigation.goBack();
  };

  const renderEntryForm = ({ item }) => (
    <View style={styles.formCard}>
      <View style={styles.formHeader}>
        <Text style={styles.label}>나눔 내역</Text>
        {entries.length > 1 && (
            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeletePress(item.id)}>
              <Text style={styles.deleteButtonText}>삭제</Text>
            </TouchableOpacity>
        )}
      </View>
      
      <Text style={styles.subLabel}>나눔 금액</Text>
      <TextInput
        style={styles.input}
        placeholder="금액 입력"
        placeholderTextColor="#BDBDBD"
        keyboardType="number-pad"
        value={formatNumber(item.amount)}
        onChangeText={(text) => handleInputChange(item.id, 'amount', text)}
      />

      <Text style={[styles.subLabel, { marginTop: 16 }]}>나눔 날짜</Text>
      <TouchableOpacity style={styles.dateInput} onPress={() => showCalendarFor(item.id)}>
        <Text style={styles.dateText}>{item.date.replace(/-/g, '/')}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Text style={styles.backButtonText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{storeName}</Text>
            <View style={{width: 40}} />
          </View>

          <FlatList
            data={entries}
            renderItem={renderEntryForm}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            ListFooterComponent={
              <TouchableOpacity style={styles.addButton} onPress={addEntry}>
                <Text style={styles.addButtonIcon}>+</Text>
                <Text style={styles.addButtonLabel}>내역 추가</Text>
              </TouchableOpacity>
            }
          />

          <View style={styles.footer}>
            <TouchableOpacity style={styles.submitButton} onPress={handleRegisterAll}>
              <Text style={styles.submitButtonText}>전체 등록</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      <Modal transparent={true} visible={isCalendarVisible} onRequestClose={() => setCalendarVisible(false)}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setCalendarVisible(false)}>
          <View style={styles.calendarModalContent}>
            <Calendar
              onDayPress={onDayPress}
              markedDates={{ [entries.find(e => e.id === currentEntryId)?.date.replace(/\//g, '-')]: {selected: true, selectedColor: PRIMARY_COLOR} }}
              theme={{ arrowColor: PRIMARY_COLOR, todayTextColor: PRIMARY_COLOR }}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      <ConfirmationModal 
        visible={isDeleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        onConfirm={confirmDeletion}
        item={itemToDelete}
      />

      <SuccessModal 
        visible={isSuccessModalVisible}
        onConfirm={handleSuccessConfirm}
        entryCount={entries.length}
      />
    </SafeAreaView>
  );
};

// UI 테마에 맞게 스타일 전체 수정
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, backgroundColor: '#F4F6F8' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? 20 : 10,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE'
  },
  backButton: { padding: 8, marginLeft: -8 },
  backButtonText: { fontSize: 32, color: PRIMARY_COLOR, fontWeight: 'bold' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  listContainer: { padding: 20 },
  formCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 20, elevation: 2 },
  formHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  label: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  subLabel: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#1F2937' },
  dateInput: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, justifyContent: 'center' },
  dateText: { fontSize: 16, color: '#1F2937' },
  deleteButton: { backgroundColor: '#FEE2E2', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12 },
  deleteButtonText: { color: '#EF4444', fontSize: 14, fontWeight: 'bold' },
  addButton: { alignSelf: 'center', alignItems: 'center', justifyContent: 'center', width: '100%', height: 60, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderStyle: 'dashed', borderColor: '#D1D9E6', marginTop: 8 },
  addButtonIcon: { fontSize: 24, color: PRIMARY_COLOR },
  addButtonLabel: { fontSize: 14, color: PRIMARY_COLOR, fontWeight: '600', marginTop: 2 },
  footer: { padding: 20, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#EEE' },
  submitButton: { backgroundColor: PRIMARY_COLOR, borderRadius: 16, paddingVertical: 18, alignItems: 'center' },
  submitButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  calendarModalContent: { backgroundColor: 'white', borderRadius: 16, padding: 10, width: '100%' },
  confirmationModalContent: { backgroundColor: 'white', borderRadius: 16, padding: 24, width: '100%', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 12 },
  modalMessage: { fontSize: 16, color: '#374151', textAlign: 'center', lineHeight: 26, fontWeight: '500' },
  modalSubMessage: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 16, marginBottom: 24 },
  modalButtonContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  modalButton: { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginHorizontal: 6 },
  cancelButton: { backgroundColor: '#E5E7EB' },
  cancelButtonText: { color: '#374151', fontSize: 16, fontWeight: 'bold' },
  confirmButton: { backgroundColor: '#D32F2F' },
  confirmButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  successIcon: { fontSize: 40, marginBottom: 12 },
  okButton: { backgroundColor: PRIMARY_COLOR, width: '100%' },
  okButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});

export default UsageEntryScreen;