import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const UsageEditScreen = ({ route, navigation }) => {
  const { item } = route.params;
  
  const [amount, setAmount] = useState(item.amount.toString());
  const [date, setDate] = useState(item.date);
  
  const modificationDate = new Date().toLocaleString('ko-KR');

  const handleEdit = () => {
    if (!amount || !date) {
      Alert.alert('입력 오류', '금액과 날짜를 모두 입력해주세요.');
      return;
    }
    
    const numericAmount = parseInt(amount.replace(/,/g, ''));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('입력 오류', '올바른 금액을 입력해주세요.');
      return;
    }
    
    console.log(`[수정] ID: ${item.id}, 금액: ${amount}, 날짜: ${date}`);
    Alert.alert('수정 완료', '나눔 내역이 성공적으로 수정되었습니다.', [
      { text: '확인', onPress: () => navigation.goBack() }
    ]);
  };

  const formatAmount = (value) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    return numericValue.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
  };

  const handleAmountChange = (value) => {
    setAmount(formatAmount(value));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>나눔 내역 수정</Text>
          <Text style={styles.subtitle}>정확한 정보로 수정해주세요</Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* 현재 정보 카드 */}
          <View style={styles.currentInfoCard}>
            <Text style={styles.cardTitle}>📝 현재 나눔 내역</Text>
            <View style={styles.currentInfoContent}>
              <View style={styles.currentInfoRow}>
                <Text style={styles.currentInfoLabel}>금액</Text>
                <Text style={styles.currentAmount}>-{item.amount.toLocaleString()}원</Text>
              </View>
              <View style={styles.currentInfoRow}>
                <Text style={styles.currentInfoLabel}>날짜</Text>
                <Text style={styles.currentDate}>{item.date}</Text>
              </View>
            </View>
          </View>

          {/* 수정 폼 */}
          <View style={styles.formCard}>
            <Text style={styles.cardTitle}>✏️ 수정할 정보</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>수정할 금액</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="10,000"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                  value={amount}
                  onChangeText={handleAmountChange}
                />
                <Text style={styles.inputSuffix}>원</Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>수정할 날짜</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="2025/07/31"
                  placeholderTextColor="#9CA3AF"
                  value={date}
                  onChangeText={setDate}
                />
              </View>
              <Text style={styles.inputHelp}>YYYY/MM/DD 형식으로 입력해주세요</Text>
            </View>
          </View>

          {/* 수정 정보 */}
          <View style={styles.modificationCard}>
            <View style={styles.modificationInfo}>
              <Text style={styles.modificationIcon}>🕐</Text>
              <View>
                <Text style={styles.modificationLabel}>최종 수정 일시</Text>
                <Text style={styles.modificationDate}>{modificationDate}</Text>
              </View>
            </View>
          </View>

          {/* 수정 버튼 */}
          <TouchableOpacity style={styles.submitButton} onPress={handleEdit} activeOpacity={0.8}>
            <Text style={styles.submitButtonText}>✅ 수정 완료</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#F8FAFC' 
  },
  header: { 
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24, 
    paddingVertical: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  backButton: { 
    position: 'absolute', 
    left: 24, 
    top: 50,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: { 
    fontSize: 20, 
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 10,
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  container: { 
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  currentInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  currentInfoContent: {
    gap: 12,
  },
  currentInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentInfoLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  currentAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  currentDate: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: { 
    fontSize: 16, 
    color: '#374151', 
    marginBottom: 8, 
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  input: { 
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
    color: '#1F2937',
  },
  inputSuffix: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: 8,
  },
  inputHelp: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 6,
    marginLeft: 4,
  },
  modificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  modificationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modificationIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  modificationLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  modificationDate: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#10B981',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonText: { 
    color: '#FFFFFF', 
    fontSize: 18, 
    fontWeight: 'bold',
  },
});

export default UsageEditScreen;