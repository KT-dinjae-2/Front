import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';

const PRIMARY_COLOR = '#1A237E';

const formatNumber = (num) => {
    if (!num) return '';
    const numericValue = num.toString().replace(/[^0-9]/g, '');
    return numericValue.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
};

// 수정 내용을 최종 확인하는 팝업
const ConfirmationModal = ({ visible, onCancel, onConfirm, editedAmount, editedDate }) => {
    return (
        <Modal transparent={true} visible={visible} onRequestClose={onCancel} animationType="fade">
            <View style={styles.modalBackdrop}>
                <View style={styles.popupModalContent}>
                    <Text style={styles.modalTitle}>수정 확인</Text>
                    <Text style={styles.modalMessage}>
                        {`금액: ${formatNumber(editedAmount) || '0'}원\n날짜: ${editedDate ? editedDate.replace(/-/g, '/') : ''}`}
                    </Text>
                    <Text style={styles.modalSubMessage}>이 내용으로 수정하시겠습니까?</Text>
                    <View style={styles.modalButtonContainer}>
                        <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={onCancel}>
                            <Text style={styles.cancelButtonText}>아니오</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalButton, styles.confirmButton]} onPress={onConfirm}>
                            <Text style={styles.confirmButtonText}>예</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

// 수정 완료를 알리는 팝업
const SuccessModal = ({ visible, onConfirm }) => {
    return (
        <Modal transparent={true} visible={visible} onRequestClose={onConfirm} animationType="fade">
            <View style={styles.modalBackdrop}>
                <View style={styles.popupModalContent}>
                    <Text style={styles.successIcon}>🎉</Text>
                    <Text style={styles.modalTitle}>수정 완료</Text>
                    <Text style={styles.modalSubMessage}>나눔 내역이 성공적으로 수정되었습니다.</Text>
                    <TouchableOpacity style={[styles.modalButton, styles.okButton]} onPress={onConfirm}>
                        <Text style={styles.okButtonText}>확인</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};


const UsageEditScreen = ({ route, navigation }) => {
  const { item } = route.params;
  
  const [amount, setAmount] = useState(item.amount.toString());
  const [date, setDate] = useState(item.date.replace(/-/g, '/'));
  
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);
  const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);
  const [editedData, setEditedData] = useState(null);

  const handleEdit = () => {
    if (!amount || !date) {
      Alert.alert('입력 오류', '금액과 날짜를 모두 입력해주세요.');
      return;
    }
    const numericAmount = parseInt(amount.replace(/,/g, ''), 10);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('입력 오류', '올바른 금액을 입력해주세요.');
      return;
    }
    setEditedData({ amount: amount, date: date });
    setConfirmModalVisible(true);
  };
  
  const handleConfirmEdit = () => {
    setConfirmModalVisible(false);
    console.log(`[수정] ID: ${item.id}, 금액: ${editedData.amount}, 날짜: ${editedData.date}`);
    setSuccessModalVisible(true);
  }

  const handleSuccessConfirm = () => {
      setSuccessModalVisible(false);
      navigation.pop(2);
  };

  const onDayPress = (day) => {
    setDate(day.dateString.replace(/-/g, '/'));
    setCalendarVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Text style={styles.backButtonText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>나눔 내역 수정</Text>
            <View style={{width: 40}} />
        </View>

        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
            <View style={styles.contentCard}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>현재 나눔 내역</Text>
                    <Text style={styles.currentAmountText}>{formatNumber(item.amount)}원</Text>
                    <Text style={styles.currentDateText}>{item.date.replace(/-/g, '/')}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>수정할 정보</Text>
                    <Text style={styles.label}>나눔 금액</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="수정할 금액 입력"
                        placeholderTextColor="#BDBDBD"
                        keyboardType="number-pad"
                        value={formatNumber(amount)}
                        onChangeText={(text) => setAmount(text)}
                    />

                    <Text style={[styles.label, { marginTop: 24 }]}>나눔 날짜</Text>
                    <TouchableOpacity style={styles.dateInput} onPress={() => setCalendarVisible(true)}>
                        <Text style={styles.dateText}>{date}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
        
        <View style={styles.footer}>
            <TouchableOpacity style={styles.submitButton} onPress={handleEdit}>
                <Text style={styles.submitButtonText}>수정 완료</Text>
            </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>

      <Modal
        transparent={true}
        visible={isCalendarVisible}
        onRequestClose={() => setCalendarVisible(false)}
      >
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setCalendarVisible(false)}>
          <View style={styles.calendarModalContent}>
            <Calendar
              current={date.replace(/\//g, '-')}
              onDayPress={onDayPress}
              markedDates={{
                [date.replace(/\//g, '-')]: {selected: true, selectedColor: PRIMARY_COLOR}
              }}
              theme={{ 
                  arrowColor: PRIMARY_COLOR, 
                  todayTextColor: PRIMARY_COLOR,
                  selectedDayBackgroundColor: PRIMARY_COLOR,
                  monthTextColor: PRIMARY_COLOR,
                  textMonthFontWeight: 'bold',
                }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
      
      <ConfirmationModal
        visible={isConfirmModalVisible}
        onCancel={() => setConfirmModalVisible(false)}
        onConfirm={handleConfirmEdit}
        editedAmount={editedData?.amount}
        editedDate={editedData?.date}
      />
      
      <SuccessModal
        visible={isSuccessModalVisible}
        onConfirm={handleSuccessConfirm}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
    container: { flex: 1, backgroundColor: '#F4F6F8' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: Platform.OS === 'android' ? 20 : 10, paddingBottom: 16, paddingHorizontal: 16,
        backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#EEE',
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
    backButton: { padding: 8, marginLeft: -8 },
    backButtonText: { fontSize: 32, color: PRIMARY_COLOR, fontWeight: 'bold' },
    contentCard: { backgroundColor: '#FFFFFF', borderRadius: 24, margin: 20, padding: 24, },
    section: { marginBottom: 16 },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: '#6B7280', marginBottom: 16, },
    currentAmountText: { fontSize: 32, fontWeight: 'bold', color: PRIMARY_COLOR, marginBottom: 8, },
    currentDateText: { fontSize: 16, color: '#6B7280', },
    divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 24, },
    label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8, },
    input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#1F2937', },
    dateInput: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, justifyContent: 'center', },
    dateText: { fontSize: 16, color: '#1F2937', },
    footer: { padding: 20, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#EEE', },
    submitButton: { backgroundColor: PRIMARY_COLOR, borderRadius: 16, paddingVertical: 18, alignItems: 'center', },
    submitButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', },
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, },
    calendarModalContent: { backgroundColor: 'white', borderRadius: 16, padding: 10, width: '90%', },
    popupModalContent: { backgroundColor: 'white', borderRadius: 16, padding: 24, width: '100%', alignItems: 'center' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 12, textAlign: 'center' },
    modalMessage: { fontSize: 16, color: '#374151', textAlign: 'center', lineHeight: 26, fontWeight: '500', },
    modalSubMessage: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 8, marginBottom: 24 },
    modalButtonContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
    modalButton: { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginHorizontal: 6 },
    cancelButton: { backgroundColor: '#E5E7EB' },
    cancelButtonText: { color: '#374151', fontSize: 16, fontWeight: 'bold' },
    confirmButton: { backgroundColor: PRIMARY_COLOR },
    confirmButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
    successIcon: { fontSize: 40, marginBottom: 12 },
    okButton: { backgroundColor: PRIMARY_COLOR, width: '100%' },
    okButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});

export default UsageEditScreen;