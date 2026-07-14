import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';

// 화면 좌측 상단에 떠 있는 공용 뒤로가기 버튼.
//  - navigation 을 넘기면 알아서 goBack (돌아갈 곳이 없으면 Welcome 으로) 처리합니다.
//  - onPress 를 직접 넘기면 그 동작을 우선합니다.
//  - color 로 아이콘 색을 바꿉니다(어두운 헤더 위에서는 '#FFFFFF' 권장).
const BackButton = ({ navigation, onPress, color = '#1A237E', style }) => {
  const handlePress =
    onPress ||
    (() => {
      if (navigation?.canGoBack?.()) navigation.goBack();
      else navigation?.navigate?.('Welcome');
    });

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.button, style]}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      accessibilityRole="button"
      accessibilityLabel="이전 화면으로"
    >
      <Text style={[styles.icon, { color }]}>‹</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 20 : 48,
    left: 12,
    zIndex: 50,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  icon: {
    fontSize: 34,
    fontWeight: 'bold',
    lineHeight: 36,
  },
});

export default BackButton;
