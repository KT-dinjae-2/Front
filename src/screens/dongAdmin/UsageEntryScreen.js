import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const UsageEntryScreen = ({ route, navigation }) => {
  const { storeName, storeId } = route.params;
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0].replace(/-/g, '/'));

  const handleRegister = () => {
    if (!amount || !date) {
      Alert.alert('입력 오류', '금액과 날짜를 모두 입력해주세요.');
      return;
    }

    const numericAmount = parseInt(amount.replace(/,/g, ''));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('입력 오류', '올바른 금액을 입력해주세요.');
      return;
    }

    console.log(`[${storeName}(${storeId})] 나눔 내역 등록: ${amount}원, 날짜: ${date}`);
    Alert.alert('등록 완료', '나눔 내역이 성공적으로 등록되었습니다.', [
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

  const getPreviewAmount = () => {
    const numericAmount = parseInt(amount.replace(/,/g, ''));
    return isNaN(numericAmount) ? 0 : numericAmount;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{storeName}</Text>
          <Text style={styles.subtitle}>나눔 내역 등록</Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* 안내 카드 */}
          <View style={styles.guideCard}>
            <Text style={styles.guideIcon}>💝</Text>
            <Text style={styles.guideTitle}>나눔 내역을 등록해주세요</Text>
            <Text style={styles.guideText}>
              지역사회를 위해 나눔해주신 소중한 내역을 기록합니다
            </Text>
          </View>

          {/* 입력 폼 */}
          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>💰 나눔 금액</Text>
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
              <Text style={styles.inputHelp}>나눔한 금액을 입력해주세요</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>📅 나눔 날짜</Text>
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

          {/* 미리보기 카드 */}
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>📋 등록 미리보기</Text>
            <View style={styles.previewContent}>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>가게명</Text>
                <Text style={styles.previewValue}>{storeName}</Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>나눔 금액</Text>
                <Text style={[styles.previewValue, styles.previewAmount]}>
                  -{getPreviewAmount().toLocaleString()}원
                </Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>나눔 날짜</Text>
                <Text style={styles.previewValue}>{date || '날짜를 입력해주세요'}</Text>
              </View>
            </View>
          </View>

          {/* 등록 버튼 */}
          <TouchableOpacity 
            style={[styles.submitButton, (!amount || !date) && styles.submitButtonDisabled]} 
            onPress={handleRegister} 
            activeOpacity={0.8}
            disabled={!amount || !date}
          >
            <Text style={styles.submitButtonText}>🎉 나눔 내역 등록</Text>
          </TouchableOpacity>

          {/* 주의사항 */}
          <View style={styles.noticeCard}>
            <Text style={styles.noticeTitle}>⚠️ 주의사항</Text>
            <Text style={styles.noticeText}>
              • 정확한 금액과 날짜를 입력해주세요{'\n'}
              • 등록 후에는 수정이 가능합니다{'\n'}
              • 허위 정보 입력 시 서비스 이용이 제한될 수 있습니다
            </Text>
          </View>
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
  guideCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  guideIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  guideTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  guideText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
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
  previewCard: {
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
    borderLeftColor: '#10B981',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  previewContent: {
    gap: 12,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  previewValue: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  previewAmount: {
    color: '#EF4444',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#10B981',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowColor: '#9CA3AF',
  },
  submitButtonText: { 
    color: '#FFFFFF', 
    fontSize: 18, 
    fontWeight: 'bold',
  },
  noticeCard: {
    backgroundColor: '#FEF3CD',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#FDE047',
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 8,
  },
  noticeText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
});

export default UsageEntryScreen;