import React, { useEffect, useState } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import api from '../../api/client';
import BackButton from '../../components/BackButton';

const NAVY = '#1A2350';

// 질문 데이터
const QUESTIONS = [
  {
    id: 1,
    text: '평소 나의 소비 습관에 가장 가까운 것은?',
    emoji: '💳',
    options: [
      { type: 'A', text: '꼭 필요한 생필품·식료품 위주로 계획적으로 산다', emoji: '🛒' },
      { type: 'B', text: '새로운 맛집과 분위기 좋은 식당을 즐겨 찾는다', emoji: '🍽️' },
      { type: 'C', text: '나를 위한 미용·취미 활동에 기꺼이 투자한다', emoji: '✨' },
      { type: 'D', text: '예쁘고 특별한 걸 보면 소소한 기쁨으로 산다', emoji: '🧁' },
    ],
  },
  {
    id: 2,
    text: "내가 떠올리는 '따뜻한 나눔'의 이미지는?",
    emoji: '🤗',
    options: [
      { type: 'A', text: '힘든 시기를 버티게 해주는 든든한 생필품', emoji: '🏠' },
      { type: 'B', text: '따뜻한 한 끼로 채워주는 마음의 위로', emoji: '🍲' },
      { type: 'C', text: '변화를 통해 자신감을 되찾게 해주는 것', emoji: '💄' },
      { type: 'D', text: '일상에 즐거움을 더하는 달콤한 간식', emoji: '🍰' },
    ],
  },
  {
    id: 3,
    text: '기부에서 가장 중요한 목적은 무엇일까?',
    emoji: '💝',
    options: [
      { type: 'A', text: '이웃의 가장 기본적인 생활을 지원하는 것', emoji: '🤝' },
      { type: 'B', text: '식사를 통해 공동체의 따뜻함을 나누는 것', emoji: '👥' },
      { type: 'C', text: '상대방의 기분까지 긍정적으로 바꾸는 것', emoji: '🦋' },
      { type: 'D', text: '힘든 하루에 잠깐의 행복을 선물하는 것', emoji: '😊' },
    ],
  },
  {
    id: 4,
    text: '누군가에게 선물한다면 무엇을 주고 싶은가?',
    emoji: '🎁',
    options: [
      { type: 'A', text: '실용적이고 오래 쓰는 생필품', emoji: '📦' },
      { type: 'B', text: '함께 나눌 수 있는 식사권', emoji: '🥘' },
      { type: 'C', text: '스타일 변신을 돕는 미용 이용권', emoji: '💅' },
      { type: 'D', text: '따뜻한 커피·디저트 쿠폰', emoji: '☕' },
    ],
  },
];

// GVTI 유형 — 깔끔한 이모지 메달리온 + 유형별 컬러
const TYPES = {
  A: {
    name: '든든이',
    tagline: '더 든든한 하루를 만드는',
    emoji: '🐿️',
    image: require('../../../assets/gvti/GVTI-A.png'),
    description:
      '기부의 실용성과 효과를 가장 중요하게 생각하는 든든한 기부자예요. 따뜻한 한 끼와 꼭 필요한 생필품이 누군가의 하루를 지탱한다는 걸 잘 알고 있죠. 이웃의 가장 기본적인 필요를 채우는 당신의 기부는 가장 든든한 힘이 됩니다.',
    recommended: '슈퍼마켓 · 정육점 · 반찬가게 · 마트',
    accent: '#2E9E6B',
    gradient: ['#37B67E', '#1F7A55'],
    soft: '#E7F6EF',
  },
  B: {
    name: '함께',
    tagline: '따뜻한 식탁을 나누는',
    emoji: '🐶',
    image: require('../../../assets/gvti/GVTI-B.png'),
    description:
      '음식이 가진 힘을 믿는 나눔의 미식가예요. 따뜻한 밥 한 끼가 배고픔을 넘어 마음을 든든하게 하고 공동체의 온기를 느끼게 한다고 믿죠. 당신의 기부는 이웃의 마음에 온기를 전합니다.',
    recommended: '한식 · 양식 · 중식 등 음식점',
    accent: '#E8863C',
    gradient: ['#F5A65B', '#DD7625'],
    soft: '#FDF1E5',
  },
  C: {
    name: '반짝이',
    tagline: '활력을 선물하는',
    emoji: '🐱',
    image: require('../../../assets/gvti/GVTI-C.png'),
    description:
      '기부가 긍정적인 변화를 일으킨다고 믿는 변화의 스타일리스트예요. 외적인 변화가 누군가에게 자신감과 활력을 불어넣는 소중한 기회가 된다는 걸 알고 있죠. 당신의 나눔은 이웃의 내면까지 반짝이게 합니다.',
    recommended: '미용실 · 네일숍 · 피부관리실',
    accent: '#D9558A',
    gradient: ['#EC7BA9', '#C63E76'],
    soft: '#FBEAF2',
  },
  D: {
    name: '스마일',
    tagline: '행복한 미소를 나누는',
    emoji: '🐰',
    image: require('../../../assets/gvti/GVTI-D.png'),
    description:
      '기부로 소소한 행복과 즐거움을 선물하고 싶어하는 행복 전달자예요. 작은 달콤함이 누군가의 힘든 하루를 위로하고 잠시나마 미소 짓게 한다고 믿죠. 당신의 따뜻한 마음이 이웃의 일상에 기쁨을 더합니다.',
    recommended: '카페 · 제과점 · 빵집 · 디저트 가게',
    accent: '#4088C4',
    gradient: ['#5AA6DA', '#3070AC'],
    soft: '#E9F2FA',
  },
};

const calcResult = (answers) => {
  const counts = answers.reduce((acc, t) => ({ ...acc, [t]: (acc[t] || 0) + 1 }), {});
  return ['A', 'B', 'C', 'D'].reduce((best, t) => ((counts[t] || 0) > (counts[best] || 0) ? t : best), 'A');
};

const GVTIScreen = ({ navigation }) => {
  const [started, setStarted] = useState(false);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [recStores, setRecStores] = useState([]);

  // 결과 유형에 맞는 실제 추천 가게 조회
  useEffect(() => {
    if (!result) {
      setRecStores([]);
      return;
    }
    let alive = true;
    api
      .get('/gvti/recommend/', { params: { type: result } })
      .then((res) => alive && setRecStores(res.data.stores || []))
      .catch(() => alive && setRecStores([]));
    return () => {
      alive = false;
    };
  }, [result]);

  const reset = () => {
    setStarted(false);
    setQIndex(0);
    setAnswers([]);
    setResult(null);
  };

  const handleAnswer = (type) => {
    const next = [...answers, type];
    setAnswers(next);
    if (qIndex < QUESTIONS.length - 1) setQIndex(qIndex + 1);
    else setResult(calcResult(next));
  };

  // ============ 결과 ============
  if (result) {
    const r = TYPES[result];
    return (
      <View style={styles.flex}>
        <LinearGradient colors={r.gradient} style={styles.resultHeader}>
          <BackButton onPress={reset} color="#FFFFFF" />
          <View style={styles.resultBadge}>
            <Text style={styles.resultBadgeText}>GVTI · {result}</Text>
          </View>
          <View style={styles.medallion}>
            <Image source={r.image} style={styles.medallionImg} resizeMode="contain" />
          </View>
          <Text style={styles.resultTagline}>{r.tagline}</Text>
          <Text style={styles.resultName}>‘{r.name}’ 유형</Text>
        </LinearGradient>

        <ScrollView style={[styles.flex, { backgroundColor: '#FFFFFF' }]} contentContainerStyle={styles.resultBody}>
          <Text style={styles.resultDesc}>{r.description}</Text>

          <View style={[styles.recommendCard, { backgroundColor: r.soft }]}>
            <Text style={[styles.recommendLabel, { color: r.accent }]}>🎯 나와 잘 맞는 기부처</Text>
            <Text style={styles.recommendText}>{r.recommended}</Text>
          </View>

          {/* 실제 참여 가게 추천 */}
          {recStores.length > 0 ? (
            <View style={styles.storeSection}>
              <Text style={styles.storeSectionTitle}>이런 가게는 어때요?</Text>
              <Text style={styles.storeSectionSub}>내 유형과 잘 맞는 실제 참여 가게예요</Text>
              {recStores.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  activeOpacity={0.85}
                  style={styles.storeCard}
                  onPress={() => navigation.navigate('DonationEntry', { dongId: s.dongId, dongName: s.dong, storeId: s.id, storeName: s.name })}
                >
                  <View style={[styles.storeDot, { backgroundColor: r.accent }]}>
                    <Text style={styles.storeDotText}>{r.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.storeName} numberOfLines={1}>{s.name}</Text>
                    {s.dong ? <Text style={styles.storeDong}>{s.dong}</Text> : null}
                  </View>
                  <Text style={[styles.storeGo, { color: r.accent }]}>기부 ›</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}

          <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: r.accent }]} onPress={() => navigation.navigate('DonationEntry')}>
            <Text style={styles.primaryBtnText}>이 유형으로 기부 시작하기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ghostBtn} onPress={reset}>
            <Text style={styles.ghostBtnText}>다시 테스트하기</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ============ 시작 ============
  if (!started) {
    return (
      <LinearGradient colors={['#232E63', '#141A3E']} style={styles.flex}>
        <SafeAreaView style={styles.flex}>
          <BackButton navigation={navigation} color="#FFFFFF" />
          <View style={styles.startPage}>
            <Text style={styles.startKicker}>GIVING VALUE TYPE INDICATOR</Text>
            <Text style={styles.startLogo}>GVTI</Text>
            <View style={styles.startEmojiRow}>
              {['🐿️', '🐶', '🐱', '🐰'].map((e) => (
                <View key={e} style={styles.startEmojiChip}><Text style={styles.startEmojiText}>{e}</Text></View>
              ))}
            </View>
            <Text style={styles.startTitle}>내 마음이 닿는{'\n'}기부 유형은?</Text>
            <Text style={styles.startDesc}>4개의 질문으로 나만의 기부 스타일을 발견하고{'\n'}잘 맞는 기부처를 찾아보세요.</Text>
            <TouchableOpacity style={styles.startBtn} onPress={() => setStarted(true)}>
              <Text style={styles.startBtnText}>테스트 시작하기</Text>
            </TouchableOpacity>
            <Text style={styles.startHint}>약 30초 소요 · 4문항</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // ============ 질문 ============
  const q = QUESTIONS[qIndex];
  const progress = (qIndex + 1) / QUESTIONS.length;
  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: '#F6F7FB' }]}>
      <BackButton
        onPress={() => {
          if (qIndex === 0) reset();
          else {
            setQIndex(qIndex - 1);
            setAnswers(answers.slice(0, -1));
          }
        }}
        color={NAVY}
      />
      <View style={styles.qPage}>
        {/* 진행 */}
        <View style={styles.progressWrap}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>{qIndex + 1}<Text style={styles.progressTotal}> / {QUESTIONS.length}</Text></Text>
        </View>

        {/* 질문 */}
        <View style={styles.qEmojiCircle}><Text style={styles.qEmoji}>{q.emoji}</Text></View>
        <Text style={styles.qText}>{q.text}</Text>

        {/* 선택지 */}
        <ScrollView style={styles.flex} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
          {q.options.map((opt) => (
            <TouchableOpacity key={opt.type} activeOpacity={0.85} style={styles.optionCard} onPress={() => handleAnswer(opt.type)}>
              <View style={styles.optionEmojiChip}><Text style={styles.optionEmoji}>{opt.emoji}</Text></View>
              <Text style={styles.optionText}>{opt.text}</Text>
              <Text style={styles.optionArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },

  // 시작
  startPage: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  startKicker: { color: 'rgba(255,255,255,0.55)', fontSize: 11, fontWeight: '700', letterSpacing: 3, marginBottom: 6 },
  startLogo: { color: '#FFFFFF', fontSize: 58, fontWeight: '900', letterSpacing: 3, marginBottom: 24 },
  startEmojiRow: { flexDirection: 'row', gap: 10, marginBottom: 36 },
  startEmojiChip: { width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  startEmojiText: { fontSize: 22 },
  startTitle: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold', textAlign: 'center', lineHeight: 38, marginBottom: 14 },
  startDesc: { color: 'rgba(255,255,255,0.75)', fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 40 },
  startBtn: { backgroundColor: '#FFFFFF', paddingVertical: 17, paddingHorizontal: 56, borderRadius: 30, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
  startBtnText: { color: NAVY, fontSize: 17, fontWeight: 'bold' },
  startHint: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 16 },

  // 질문
  qPage: { flex: 1, paddingTop: 52, paddingHorizontal: 22 },
  progressWrap: { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  progressBarBg: { flex: 1, height: 6, borderRadius: 3, backgroundColor: '#E4E7F0', overflow: 'hidden', marginRight: 12 },
  progressBar: { height: '100%', borderRadius: 3, backgroundColor: NAVY },
  progressText: { fontSize: 15, fontWeight: '800', color: NAVY },
  progressTotal: { fontSize: 13, fontWeight: '600', color: '#9AA0B4' },
  qEmojiCircle: { width: 64, height: 64, borderRadius: 20, backgroundColor: '#EEF0F8', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  qEmoji: { fontSize: 32 },
  qText: { fontSize: 22, fontWeight: 'bold', color: '#1C2440', lineHeight: 30, marginBottom: 24 },
  optionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 16, marginBottom: 12, borderWidth: 1, borderColor: '#EDEFF5', shadowColor: '#1A2350', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  optionEmojiChip: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#F4F6FC', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  optionEmoji: { fontSize: 22 },
  optionText: { flex: 1, fontSize: 15, color: '#2A3355', lineHeight: 21, fontWeight: '500' },
  optionArrow: { fontSize: 22, color: '#C4C9DA', marginLeft: 8, fontWeight: '300' },

  // 결과
  resultHeader: { paddingTop: 64, paddingBottom: 30, alignItems: 'center', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  resultBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20, marginBottom: 20 },
  resultBadgeText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800', letterSpacing: 1 },
  medallion: { width: 128, height: 128, borderRadius: 64, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginBottom: 18, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } },
  medallionImg: { width: 116, height: 116 },
  resultTagline: { color: 'rgba(255,255,255,0.9)', fontSize: 15, marginBottom: 4 },
  resultName: { color: '#FFFFFF', fontSize: 30, fontWeight: '900' },
  resultBody: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 44 },
  resultDesc: { fontSize: 15.5, color: '#3A4260', lineHeight: 26, marginBottom: 24 },
  recommendCard: { borderRadius: 18, padding: 22, alignItems: 'center', marginBottom: 30 },
  recommendLabel: { fontSize: 14, fontWeight: '800', marginBottom: 8 },
  recommendText: { fontSize: 17, fontWeight: 'bold', color: '#1C2440', textAlign: 'center' },
  storeSection: { marginBottom: 26 },
  storeSectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1C2440', marginBottom: 2 },
  storeSectionSub: { fontSize: 13, color: '#8A90A6', marginBottom: 14 },
  storeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14, marginBottom: 10, borderWidth: 1, borderColor: '#EDEFF5' },
  storeDot: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  storeDotText: { fontSize: 20 },
  storeName: { fontSize: 15.5, fontWeight: '700', color: '#242C48' },
  storeDong: { fontSize: 12.5, color: '#8A90A6', marginTop: 2 },
  storeGo: { fontSize: 14, fontWeight: '800', marginLeft: 8 },
  primaryBtn: { paddingVertical: 17, borderRadius: 15, alignItems: 'center', marginBottom: 12 },
  primaryBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: 'bold' },
  ghostBtn: { paddingVertical: 16, borderRadius: 15, alignItems: 'center', backgroundColor: '#F2F4F9' },
  ghostBtnText: { color: '#5A6280', fontSize: 15, fontWeight: '600' },
});

export default GVTIScreen;
