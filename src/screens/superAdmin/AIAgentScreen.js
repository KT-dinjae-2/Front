import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import api from '../../api/client';
import BackButton from '../../components/BackButton';
import BarChart from '../../components/BarChart';
import LineChart from '../../components/LineChart';
import TypewriterText from '../../components/TypewriterText';

const PRIMARY_COLOR = '#1A237E';
const CHART_WIDTH = Math.min(Dimensions.get('window').width - 96, 460);

const formatNumber = (num) => (num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0');

const BASE_QUESTIONS = [
  '기부가 가장 많은 동은?',
  '월별 기부 추세 보여줘',
  '나눔 현황 알려줘',
  '참여 가게 수는?',
  '실적 없는 동은?',
];

const AIAgentScreen = ({ navigation, route }) => {
  const dongName = route?.params?.dongName || null;
  const dongId = route?.params?.dongId ?? null;

  // 특정 동에서 진입한 경우 그 동에만 초점을 맞춘 인사·추천 질문을 보여줍니다.
  const QUICK_QUESTIONS = dongName
    ? [`${dongName} 총 기부 실적`, `${dongName} 월별 기부 추세`, `${dongName} 나눔 현황`, `${dongName} 기부 많은 가게`]
    : BASE_QUESTIONS;

  const [messages, setMessages] = useState([
    {
      role: 'agent',
      text: dongName
        ? `${dongName} 담당자님, 안녕하세요! 🤖\n${dongName}의 기부·나눔 현황, 월별 추세, 가게별 실적 등을 물어보세요.`
        : '안녕하세요! 성동 원플러스원 사업 데이터를 분석해 드리는 AI 에이전트입니다.\n기부·나눔 현황이나 동별 실적, 추세 등을 물어보세요.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const send = async (question) => {
    const q = (question ?? input).trim();
    if (!q || loading) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: q }]);
    setLoading(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);

    try {
      const params = dongId != null ? { q, dongId } : { q };
      const res = await api.get('/agent/ask/', { params });
      setMessages((prev) => [...prev, { role: 'agent', text: res.data.answer, chart: res.data.chart, source: res.data.source, animate: true }]);
    } catch (e) {
      setMessages((prev) => [...prev, { role: 'agent', text: '죄송해요, 답변을 불러오지 못했습니다. 다시 시도해주세요.', animate: true }]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    }
  };

  const handleTypeScroll = () => scrollRef.current?.scrollToEnd({ animated: false });

  const renderChart = (chart) => {
    if (!chart) return null;
    if (chart.type === 'bar') {
      return (
        <View style={styles.chartWrap}>
          <BarChart data={chart.data} valueFormatter={(v) => `${formatNumber(v)}원`} maxItems={8} />
        </View>
      );
    }
    if (chart.type === 'line') {
      return (
        <View style={styles.chartWrap}>
          <LineChart data={chart.data} width={CHART_WIDTH} valueFormatter={(v) => `${formatNumber(v)}원`} />
        </View>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <BackButton navigation={navigation} color="#FFFFFF" />
        <Text style={styles.headerTitle}>🤖 AI 에이전트</Text>
        <Text style={styles.headerSubtitle}>사업 데이터에 대해 자유롭게 질문하세요</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 8 }}>
          {messages.map((m, i) => (
            <View key={i} style={[styles.bubbleRow, m.role === 'user' ? styles.rowRight : styles.rowLeft]}>
              <View style={[styles.bubble, m.role === 'user' ? styles.userBubble : styles.agentBubble]}>
                {m.role === 'user' ? (
                  <Text style={[styles.bubbleText, styles.userBubbleText]}>{m.text}</Text>
                ) : (
                  <>
                    <TypewriterText text={m.text} style={styles.bubbleText} animate={m.animate !== false} onUpdate={handleTypeScroll} />
                    {m.source ? (
                      <Text style={styles.sourceTag}>{m.source === 'llm' ? '🟢 AI 응답 (LLM)' : '⚪ 규칙 기반 (오프라인 폴백)'}</Text>
                    ) : null}
                    {renderChart(m.chart)}
                  </>
                )}
              </View>
            </View>
          ))}
          {loading ? (
            <View style={[styles.bubbleRow, styles.rowLeft]}>
              <View style={[styles.bubble, styles.agentBubble]}>
                <ActivityIndicator color={PRIMARY_COLOR} />
              </View>
            </View>
          ) : null}
        </ScrollView>

        {/* 추천 질문 */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickRow} contentContainerStyle={styles.quickContent}>
          {QUICK_QUESTIONS.map((q) => (
            <TouchableOpacity key={q} style={styles.quickChip} onPress={() => send(q)} disabled={loading}>
              <Text style={styles.quickChipText}>{q}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 입력창 */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="궁금한 점을 입력하세요"
            placeholderTextColor="#9CA3AF"
            onSubmitEditing={() => send()}
            returnKeyType="send"
          />
          <TouchableOpacity style={[styles.sendButton, (!input.trim() || loading) && styles.sendButtonDisabled]} onPress={() => send()} disabled={!input.trim() || loading}>
            <Text style={styles.sendButtonText}>전송</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F6F8' },
  header: {
    backgroundColor: PRIMARY_COLOR,
    paddingTop: 56,
    paddingBottom: 18,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 6 },
  bubbleRow: { marginBottom: 12, flexDirection: 'row' },
  rowLeft: { justifyContent: 'flex-start' },
  rowRight: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '86%', borderRadius: 16, paddingVertical: 12, paddingHorizontal: 14 },
  agentBubble: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 4, elevation: 1 },
  userBubble: { backgroundColor: PRIMARY_COLOR, borderTopRightRadius: 4 },
  bubbleText: { fontSize: 15, lineHeight: 22, color: '#1F2937' },
  userBubbleText: { color: '#FFFFFF' },
  sourceTag: { marginTop: 8, fontSize: 10.5, color: '#9AA0B4', fontWeight: '600' },
  chartWrap: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  quickRow: { flexGrow: 0, backgroundColor: '#F4F6F8' },
  quickContent: { paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  quickChip: { backgroundColor: '#E8EAF6', borderRadius: 16, paddingVertical: 8, paddingHorizontal: 14 },
  quickChipText: { fontSize: 13, color: PRIMARY_COLOR, fontWeight: '600' },
  inputBar: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#EEE', gap: 8 },
  input: { flex: 1, backgroundColor: '#F4F6F8', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: '#1F2937' },
  sendButton: { backgroundColor: PRIMARY_COLOR, borderRadius: 22, paddingVertical: 10, paddingHorizontal: 18 },
  sendButtonDisabled: { backgroundColor: '#B0B4C4' },
  sendButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
});

export default AIAgentScreen;
