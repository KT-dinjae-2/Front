import React, { useState } from 'react';
// KeyboardAvoidingView가 import 목록에 있는지 확인해주세요.
import { Alert, KeyboardAvoidingView, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';

const formatNumber = (num) => {
    if (!num) return '';
    const numericValue = num.toString().replace(/[^0-9]/g, '');
    return numericValue.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
};

const formatDate = (dateString) => {
    if (typeof dateString === 'string') {
        return dateString;
    }
    const d = new Date(dateString);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
};

const UsageEditScreen = ({ route, navigation }) => {
  const { item } = route.params;
  
  const [amount, setAmount] = useState(item.amount.toString());
  const [date, setDate] = useState(item.date);
  
  const [isCalendarVisible, setCalendarVisible] = useState(false);

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
    
    console.log(`[수정] ID: ${item.id}, 금액: ${amount}, 날짜: ${date}`);
    Alert.alert('수정 완료', '나눔 내역이 성공적으로 수정되었습니다.', [
      { text: '확인', onPress: () => navigation.goBack() }
    ]);
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
            <Text style={styles.storeTitle}>나눔 내역 수정</Text>
            <View style={{width: 40}} />
        </View>

        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
            <View style={styles.contentCard}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>현재 나눔 내역</Text>
                    <Text style={styles.currentAmountText}>{formatNumber(item.amount)}원</Text>
                    <Text style={styles.currentDateText}>{item.date}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>수정할 정보</Text>
                    <Text style={styles.label}>나눔 금액</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="수정할 금액 입력"
                        placeholderTextColor="#B0B0B0"
                        keyboardType="number-pad"
                        value={formatNumber(amount)}
                        onChangeText={(text) => setAmount(text)}
                    />

                    <Text style={[styles.label, { marginTop: 20 }]}>나눔 날짜</Text>
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
          <View style={styles.modalContent}>
            <Calendar
              current={date.replace(/\//g, '-')}
              onDayPress={onDayPress}
              markedDates={{
                [date.replace(/\//g, '-')]: {selected: true, selectedColor: '#098710'}
              }}
              theme={{ arrowColor: '#098710', todayTextColor: '#098710' }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#E8F5E9' },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? 20 : 10,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  storeTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  backButton: { padding: 8 },
  backButtonText: { fontSize: 28, color: '#098710', fontWeight: 'bold' },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    margin: 20,
    padding: 24,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 16,
  },
  currentAmountText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  currentDateText: {
    fontSize: 18,
    color: '#6B7280',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
  },
  dateInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#1F2937',
  },
  footer: {
    padding: 20,
    backgroundColor: '#E8F5E9',
  },
  submitButton: {
    backgroundColor: '#098710',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '90%',
  },
});

export default UsageEditScreen;